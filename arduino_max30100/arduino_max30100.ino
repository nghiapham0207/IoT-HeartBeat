#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <SoftwareSerial.h>

SoftwareSerial nodemcu(5, 6); // nodemcu module connected here

#define REPORTING_PERIOD_MS 1000

PulseOximeter pox;
uint32_t tsLastReport = 0;

float bpm = 0;
int spo2 = 0;
String data = "";
String isRun = "";

void onBeatDetected()
{
  Serial.println("Beat Detected!");
}

void setup()
{
  Serial.begin(115200);
  nodemcu.begin(9600);

  //  displayMessage("Initializing pulse oximeter..");
  Serial.print("Initializing pulse oximeter..");

  // Initialize the PulseOximeter instance
  // Failures are generally due to an improper I2C wiring, missing power supply
  // or wrong target chip
  if (!pox.begin())
  {
    Serial.println("FAILED");
    //    displayMessage("FAILED");
    for (;;);
  }
  else
  {
    //    displayMessage("SUCCESS");
    Serial.println("SUCCESS");
  }
  Serial.println("After begin pox");
  //  displayMessage("After begin pox");
  pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);

  // Register a callback for the beat detection
  pox.setOnBeatDetectedCallback(onBeatDetected);
}

void loop()
{
  // Make sure to call update as fast as possible
  pox.update();
  if (millis() - tsLastReport > REPORTING_PERIOD_MS)
  {
    bpm = pox.getHeartRate();
    spo2 = pox.getSpO2();

    data = "";
    data.concat(bpm);
    data.concat("-");
    data.concat(spo2);

    //    Serial.print("Heart rate: ");
    //    Serial.print(bpm);
    //    Serial.print(" bpm");
    //    Serial.print(" - ");
    //    Serial.print("SpO2: ");
    //    Serial.print(spo2);
    //    Serial.println(" %");
    //    Serial.println();
    //    Serial.println(data);
    //    Serial.println();

    Serial.println(data);
    nodemcu.println(data);

    tsLastReport = millis();
  }
}
