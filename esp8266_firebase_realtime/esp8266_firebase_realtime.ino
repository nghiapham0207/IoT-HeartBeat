//
#include <SoftwareSerial.h>
//
#include <ESP8266WiFi.h>
#include<FirebaseESP8266.h>
//
#include <Wire.h>
#include <Adafruit_GFX.h>
//#include <Adafruit_SSD1306.h>
#include "OakOLED.h"
//
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
//Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
OakOLED oled;
// read
SoftwareSerial s(D6, D5);

String data = "";
String bpm = "";
String spo2 = "";
// end read

// firebase
#define FIREBASE_HOST "heartbeat-f8957-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "67SaGgOgUWiLi34MCpna89TL2VLBvC7dUFEwUM8d"

#define WIFI_SSID "HT 2.4Ghz"
#define WIFI_PASSWORD "1234abCD"

FirebaseData firebaseData;
FirebaseJson firebaseJson;

String path = "/";
int isRun = 0;
// end firebase

void displayMessage(String message)
{
  //  display.clearDisplay();
  //  display.setTextSize(1);
  //  display.setTextColor(1);
  //  display.setCursor(0, 0);
  //  display.println(message);
  //  display.display();

  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(1);
  oled.setCursor(0, 0);

  oled.println(message);
  oled.display();
}

void setup() {
  Serial.begin(115200);
  s.begin(9600); //any baud

  oled.begin();

  // begin display
  //  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3D for 128x64
  //    Serial.println(F("SSD1306 allocation failed"));
  //    for (;;);
  //  }

  displayMessage("Starting Heart Monitor...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    displayMessage("Connecting Wifi...");
  }

  // put your setup code here, to run once:
  Serial.print("Connect with IP:  ");
  Serial.print(WiFi.localIP());
  Serial.println();

  displayMessage("Connecting Firebase!");
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  if (!Firebase.beginStream(firebaseData, path)) {
    Serial.println("REASON:  " + firebaseData.errorReason() );
  }
  displayMessage("Setup Success!");
}

void loop() {
  if (Firebase.getInt(firebaseData, "/heart/init/run")) {
    if (firebaseData.dataTypeEnum() == fb_esp_rtdb_data_type_integer) {
      isRun = firebaseData.to<int>();
    }
  }
  if (isRun) {
    if (s.available() > 0) {
      data = s.readStringUntil('\r');
      if (data != "") {
        s.end() ;

        /* split data */
        for (int i = 0; i < data.length(); i++) {
          if (data.substring(i, i + 1) == "-") {
            bpm = data.substring(0, i);
            spo2 = data.substring(i + 1);
            break;
          }
        }
        //        int index = data.indexOf('-');
        //        bpm = data.substring(0, index);
        //        spo2 = data.substring(index + 1);
        /* end split */
        if (bpm == "0.00") {
          Serial.println("Khong phat hien nhip tim");
          displayMessage("No Beat Detected!");
        } else {
          Serial.print("Heart rate: ");
          Serial.print(bpm);
          Serial.print(" bpm");
          Serial.print(" - ");
          Serial.print("SpO2: ");
          Serial.print(spo2);
          Serial.println(" %");
          Serial.println();

          // display oled
          //          display.clearDisplay();
          //          display.setTextSize(1);
          //          display.setTextColor(1);
          //          display.setCursor(0, 0);
          //          display.println("Heart Rate: ");
          //
          //          display.setTextSize(1);
          //          display.setTextColor(1);
          //          display.setCursor(0, 16);
          //          display.print(bpm);
          //          display.print(" bpm");
          //
          //          display.setTextSize(1);
          //          display.setTextColor(1);
          //          display.setCursor(0, 30);
          //          display.println("Spo2: ");
          //
          //          display.setTextSize(1);
          //          display.setTextColor(1);
          //          display.setCursor(0, 45);
          //          display.print(spo2);
          //          display.print(" %");
          //          display.display();
          oled.clearDisplay();
          oled.setTextSize(1);
          oled.setTextColor(1);
          oled.setCursor(0, 16);
          oled.print(bpm);
          oled.println(" bpm");

          oled.setTextSize(1);
          oled.setTextColor(1);
          oled.setCursor(0, 0);
          oled.println("Heart BPM:");

          oled.setTextSize(1);
          oled.setTextColor(1);
          oled.setCursor(0, 30);
          oled.println("Spo2:");

          oled.setTextSize(1);
          oled.setTextColor(1);
          oled.setCursor(0, 45);
          oled.print(spo2);
          oled.println(" %");
          oled.display();
        }
        //        if (Firebase.ready()) {
        //          Serial.printf("Send HeartBeat... %s\n",
        //                        Firebase.setString(firebaseData, path + "HeartBeat/realtime/heartbeat", bpm)
        //                        ? "ok" : firebaseData.errorReason());
        //          Serial.printf("Send HeartBeat... %s\n",
        //                        Firebase.setString(firebaseData, path + "HeartBeat/realtime/oxy", spo2)
        //                        ? "ok" : firebaseData.errorReason());
        //        }
        Firebase.setString(firebaseData, path + "heart/realtime/heartbeat", bpm);
        Firebase.setString(firebaseData, path + "heart/realtime/oxy", spo2);
        s.begin(9600);
      }
    }
  }
  else
  {
    Serial.println("Chua bat dau do");
    displayMessage("Not started yet!");
  }
}
