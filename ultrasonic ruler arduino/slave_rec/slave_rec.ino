#include <esp_now.h>
#include <WiFi.h>
#include "parayaan_pattilla.h"  // Ensure this file is correct and has no conflicts

// Define a structure to hold the incoming data
typedef struct struct_message {
  char a[32];
  int b;
  float c;
  bool d;
} struct_message;  // Declare the structure type outside of functions

// Create an instance of the structure to hold the received data
struct_message myData;

// Create a peer info structure
esp_now_peer_info_t peerInfo;

// Callback function that will be called when data is received
void OnDataRecv(const esp_now_recv_info_t *info, const uint8_t *incomingData, int len) {
  memcpy(&myData, incomingData, sizeof(myData));

  // Print the received data
  Serial.println(myData.a);
}

void setup() {
  // Initialize serial communication
  Serial.begin(115200);

  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Initialize ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-Now");
    return;
  }

  // Register the receive callback function
  esp_now_register_recv_cb(OnDataRecv);

  // Add the MAC address of the sender (master)
  uint8_t broadcastAddress[6]; 
  memcpy(broadcastAddress, master_mac, sizeof(master_mac)); // Copy master_mac to broadcastAddress

  // Initialize peerInfo structure and set the peer address
  memset(&peerInfo, 0, sizeof(peerInfo)); // Clear previous values
  memcpy(peerInfo.peer_addr, broadcastAddress, sizeof(broadcastAddress));  // Set peer address to master_mac
  peerInfo.channel = 0;  // Use default channel
  peerInfo.encrypt = false;  // No encryption

  // Add the peer
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add peer");
    return;
  }
}

void loop() {
  // Nothing to do here, everything is handled by the callback function
}
