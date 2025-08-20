#include <Wire.h>
#include <Adafruit_PN532.h>
#include "TCA9548A.h"
#include <string.h>

// ---------------- Pins (unchanged) ----------------
#define SDA_PIN 10
#define SCL_PIN 11
#define PN532_IRQ   (2)
#define PN532_RESET (3)
#define PN532_I2C_ADDRESS 0x48   // (unused by lib; kept for parity)

// ---------------- Instances ----------------
TCA9548A I2CMux;
Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET, &Wire);

// ---------------- Scan scheduling ----------------
unsigned long previousMillis = 0;
const long interval = 40;   // ms between channel checks
int currentChannel = 5;      // channels 5,6,7 -> TAG1, TAG2, TAG3
bool suspendScan = false;    // set true while handling a serial command

// ---------------- Debounced tag states ----------------
struct TagState {
  String stable = "empty";    // current published value
  String candidate = "";      // current candidate (differs from stable)
  uint8_t count = 0;          // consecutive observations of candidate
};

TagState ts1, ts2, ts3;

// thresholds
const uint8_t THRESH_TEXT = 2;  // non-empty must repeat twice to adopt
const uint8_t THRESH_EMPTY = 5; // need 5 empties to clear an existing text

// ---------------- Helpers ----------------
static void printTagLine(uint8_t idx, const String& s) {
  Serial.print("TAG");
  Serial.print(idx);
  Serial.print(":");
  Serial.println(s);
}

static String asciiFromBuf(const uint8_t* buf, size_t len) {
  String s;
  for (size_t i = 0; i < len; i++) {
    if (buf[i] == 0x00) break;
    char c = (char)buf[i];
    if (c >= 32 && c <= 126) s += c; else s += '.';
  }
  return s.length() ? s : String("empty");
}

// Find a short-record well-known NDEF Text ("T") anywhere in buf.
static bool extractNdefText(const uint8_t* buf, size_t len, String& out) {
  if (len < 6) return false;
  for (size_t i = 3; i + 2 < len; i++) {
    uint8_t hdr       = buf[i - 3];
    uint8_t typeLen   = buf[i - 2];
    uint8_t payloadLen= buf[i - 1];
    uint8_t typeByte  = buf[i];
    // TNF=1 (well-known), SR=1, typeLen=1, type='T'
    if (((hdr & 0x07) != 0x01) || ((hdr & 0x10) == 0) || typeLen != 1 || typeByte != 0x54) continue;

    size_t payloadStart = i + 1; // status byte
    if (payloadStart >= len || payloadLen == 0) continue;
    size_t payloadEnd = payloadStart + payloadLen;
    if (payloadEnd > len) continue;

    uint8_t status = buf[payloadStart];
    uint8_t langLen = status & 0x1F;
    size_t textStart = payloadStart + 1 + langLen;
    if (textStart >= payloadEnd) continue;

    out = "";
    for (size_t k = textStart; k < payloadEnd; k++) {
      uint8_t b = buf[k];
      if (b == 0x00 || b == 0xFE) break;
      char c = (char)b;
      if (c >= 32 && c <= 126) out += c; else out += '.';
    }
    if (out.length() > 0) return true;
  }
  return false;
}

static int channelForTagIndex(uint8_t tagIdx) {
  // TAG1->ch5, TAG2->ch6, TAG3->ch7
  if (tagIdx == 1) return 5;
  if (tagIdx == 2) return 6;
  if (tagIdx == 3) return 7;
  return -1;
}

// Read one reader (by tag index 1..3) and return the decoded value ("empty" or text)
static String readOneTagNow(uint8_t tagIdx) {
  int ch = channelForTagIndex(tagIdx);
  if (ch < 0) return "empty";

  I2CMux.closeAll();
  I2CMux.openChannel(ch);
  delay(20);

  String result = "empty";

  if (nfc.getFirmwareVersion()) {
    nfc.SAMConfig(); // required before reads

    uint8_t uid[7];
    uint8_t uidLength = 0;
    bool success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength, 80);

    if (success && uidLength > 0) {
      bool decoded = false;

      // ---- MIFARE Classic path (sector 1: blocks 4,5,6) ----
      {
        uint8_t keyA[6] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
        uint8_t b4[16], b5[16], b6[16];
        if (nfc.mifareclassic_AuthenticateBlock(uid, uidLength, 4, 0 /* KEY_A */, keyA)) {
          bool r4 = nfc.mifareclassic_ReadDataBlock(4, b4);
          bool r5 = nfc.mifareclassic_ReadDataBlock(5, b5);
          bool r6 = nfc.mifareclassic_ReadDataBlock(6, b6);
          if (r4 && r5 && r6) {
            uint8_t buf48[48];
            memcpy(&buf48[0],  b4, 16);
            memcpy(&buf48[16], b5, 16);
            memcpy(&buf48[32], b6, 16);

            String text;
            if (extractNdefText(buf48, sizeof(buf48), text)) {
              result = text;
            } else {
              result = asciiFromBuf(b4, 16); // fallback legacy
            }
            decoded = true;
          }
        }
      }

      // ---- NTAG / Ultralight path (pages 3..15 => 52 bytes) ----
      if (!decoded) {
        const uint8_t startPage = 3;
        const uint8_t pagesToRead = 13;
        uint8_t buf52[52];
        bool ok = true;
        for (uint8_t p = 0; p < pagesToRead; p++) {
          uint8_t pageBuf[4];
          if (nfc.ntag2xx_ReadPage(startPage + p, pageBuf)) {
            memcpy(&buf52[p * 4], pageBuf, 4);
          } else {
            ok = false;
            break;
          }
        }
        if (ok) {
          String text;
          if (extractNdefText(buf52, sizeof(buf52), text)) {
            result = text;
          } else {
            result = asciiFromBuf(buf52, 16);
          }
        }
      }
    }
  }

  I2CMux.closeChannel(ch);
  if (result.length() == 0) result = "empty";
  return result;
}

// Debounced update: apply candidate/count hysteresis per tag.
static void applyObservation(TagState& ts, const String& observed) {
  const bool obsEmpty = (observed == "empty");
  // If observation equals stable, reset candidate
  if (observed == ts.stable) {
    ts.candidate = "";
    ts.count = 0;
    return;
  }

  // New observation differs from stable
  if (ts.candidate == observed) {
    ts.count++;
  } else {
    ts.candidate = observed;
    ts.count = 1;
  }

  // Choose threshold based on direction
  uint8_t threshold;
  if (!obsEmpty) {
    // empty -> text or textA -> textB
    threshold = THRESH_TEXT;
  } else {
    // text -> empty
    threshold = THRESH_EMPTY;
  }

  if (ts.count >= threshold) {
    ts.stable = observed;
    ts.candidate = "";
    ts.count = 0;
  }
}

// Continuously called to keep debounced tag1/tag2/tag3 updated (unless suspended)
static void periodicScanTick() {
  unsigned long now = millis();
  if (now - previousMillis < interval) return;
  previousMillis = now;

  uint8_t idx = (uint8_t)(currentChannel - 4); // 5->1, 6->2, 7->3
  String val = readOneTagNow(idx);

  if (idx == 1) applyObservation(ts1, val);
  else if (idx == 2) applyObservation(ts2, val);
  else if (idx == 3) applyObservation(ts3, val);

  currentChannel++;
  if (currentChannel > 7) currentChannel = 5;
}

static uint8_t parseTagIndex(const String& cmd) {
  // expects "scan TAG1", "scan TAG2", "scan TAG3" (case-insensitive)
  String s = cmd;
  s.trim();
  s.toUpperCase();
  if (!s.startsWith("SCAN")) return 0;
  int pos = s.indexOf("TAG");
  if (pos < 0 || pos + 4 > (int)s.length()) return 0;
  char d = s.charAt(pos + 3);
  if (d == '1') return 1;
  if (d == '2') return 2;
  if (d == '3') return 3;
  return 0;
}

void setup(void) {
  Serial.begin(9600);
  while (!Serial) { /* wait for USB serial */ }

  Wire.begin(SDA_PIN, SCL_PIN);   // default 100 kHz for stability
  I2CMux.begin(Wire);
  I2CMux.closeAll();
  delay(300);

  nfc.begin();
  nfc.setPassiveActivationRetries(2);  // modest retries
  Serial.setTimeout(30);
}

void loop(void) {
  // 1) Keep scanning and updating debounced values (unless suspended)
  if (!suspendScan) {
    periodicScanTick();
  }

  // 2) Check for serial command
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    uint8_t idx = parseTagIndex(line);
    if (idx >= 1 && idx <= 3) {
      suspendScan = true;  // pause scan while we respond

      if (idx == 1) printTagLine(1, ts1.stable);
      else if (idx == 2) printTagLine(2, ts2.stable);
      else printTagLine(3, ts3.stable);

      suspendScan = false; // resume scanning
    }
    // Ignore other input silently
  }
}