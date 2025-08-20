const int BUTTON1_PIN = 17;  // TAG1
const int BUTTON2_PIN = 18;  // TAG2
String tag1 = "ABC123";
String tag2 = "ABC123";

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON1_PIN, INPUT_PULLUP);
  pinMode(BUTTON2_PIN, INPUT_PULLUP);
  delay(2000);
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "scan TAG1") {
      if(digitalRead(BUTTON1_PIN) == LOW){
        Serial.println("TAG1:" + tag1);
      }else{
        Serial.println("TAG1:empty");
      }
    }
    
    if (command == "scan TAG2") {
      if(digitalRead(BUTTON2_PIN) == LOW){
        Serial.println("TAG2:" + tag2);
      }
      else{
        Serial.println("TAG2:empty");
      }
    }
  }
}