import serial
import serial.tools.list_ports
import time
from typing import Optional

class ESPSerial:
    def __init__(self):
        self.ser: Optional[serial.Serial] = None
        self.last_attempt = 0

    def connect(self):
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if any(x in port.description for x in ["USB", "CH340", "Silicon"]):
                try:
                    self.ser = serial.Serial(port.device, 9600, timeout=1)
                    self.ser.reset_input_buffer()
                    print(f"✅ Connected ESP on {port.device}")
                    return
                except Exception as e:
                    print(f"❌ Failed to connect: {e}")
        self.ser = None

    def ensure_connection(self):
        if self.ser and self.ser.is_open:
            return
        if time.time() - self.last_attempt > 5:
            print("🔄 Reconnecting...")
            self.last_attempt = time.time()
            self.connect()

    def write_scan_command(self, tag_id: str):
        # print("scanning " + tag_id)
        self.ensure_connection()
        if self.ser:
            try:
                self.ser.write(f"scan {tag_id}\n".encode())
            except Exception as e:
                print(f"⚠️ Write error: {e}")
                self.ser = None

    def read_tag(self) -> Optional[str]:
        self.ensure_connection()
        if not self.ser:
            return None
        try:
            line = self.ser.readline().decode("utf-8", errors="ignore").strip()
            print(line)
            return line
        except Exception as e:
            print(f"⚠️ Serial read error: {e}")
            self.ser = None
            return None

        
    def readRFID(self, expected_label: str) -> str | None:
        """Send scan command and return tag value if label matches."""
        self.write_scan_command(expected_label)
        response = self.read_tag()
        if response and ":" in response:
            label, value = response.split(":", 1)
            value = value.strip()
            if label == expected_label:
                return value
        return None