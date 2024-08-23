#include <esp_now.h>
#include <WiFi.h>

// Define a structure to hold the incoming data
typedef struct struct_message {
  char a[32];
  int b;
  float c;
  bool d;
} struct_message;

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

  // Add the MAC address of the sender
  uint8_t senderMacAddress[] = {mac_id};
  memset(&peerInfo, 0, sizeof(peerInfo)); // Ensure no garbage values
  memcpy(peerInfo.peer_addr, senderMacAddress, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;

  
  // Add the peer
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add peer");
    return;
  }
}

void loop() {
  // Nothing to do here, everything is handled by the callback function
}

