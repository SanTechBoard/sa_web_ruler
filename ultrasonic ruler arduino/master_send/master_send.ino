#include <esp_now.h>
#include <WiFi.h>
#include "parayaan_pattilla.h"

const int trigPin = 2;
const int echoPin = 4;

float duration, distance;

uint8_t broadcastAddress[6];  // Define an array to hold the broadcast address
typedef struct struct_message {
  char a[32];
  int b;
  float c;
  bool d;
} struct_message;  

struct_message myData;

esp_now_peer_info_t peerInfo;

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  Serial.begin(115200);

  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-Now");
    return;
  }

  esp_now_register_send_cb(OnDataSent);

  // Copy slave_mac into broadcastAddress
  memcpy(broadcastAddress, slave_mac, sizeof(slave_mac));

  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add peer");
    return;
  }
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = (duration * 0.0343) / 2;
  Serial.print("Distance: ");
  Serial.println(distance);
  delay(10);

  String change = String(distance, 2);  // Convert float to String with 2 decimal places
  change.toCharArray(myData.a, sizeof(myData.a)); // Copy String to char array

  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t*)&myData, sizeof(myData));

  if (result == ESP_OK) {
    Serial.println("Sending Confirmed");
  } else {
    Serial.println("Sending Error");
  }
  delay(100);
}
