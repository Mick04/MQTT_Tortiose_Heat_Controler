#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <pubsubclient.h>

const char* ssid = "Gimp";
const char* password = "FC7KUNPX";

const char* mqtt_server = "c846e85af71b4f65864f7124799cd3bb.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;  // Secure MQTT port
const char* mqtt_user = "Tortoise";
const char* mqtt_password = "Hea1951Ter";

WiFiClientSecure espClient;
PubSubClient client(espClient);

// put function declarations here:
void callback(char* topic, uint8_t* payload, unsigned int length);
void reconnect();
bool Flag = 0;
void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi connected");

    espClient.setInsecure();  // For basic TLS without certificate verification
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
}


void loop() {
    if (!client.connected()) {
        Serial.println("Calling Reconnect to MQTT server");
        reconnect();
    }
    client.loop();
    if (Flag == 0) {
        client.publish("outSide", "Hello from Wemos D1 Mini Pro");
        Serial.println("Message sent to MQTT server");
        Flag = 1;
    }
}

// put function definitions here:
void callback(char* topic, uint8_t* payload, unsigned int length)  {
    Serial.print("Message arrived [");
    Serial.println(topic);
    Serial.print("] ");
    if (topic == nullptr || payload == nullptr) {
        Serial.println("Error: Null topic or payload");
        return;
    }

    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("]: ");

    for (unsigned int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
}
void reconnect() {
    Serial.print("Attempting MQTT connection...");
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        if (client.connect("WemosD1Client", mqtt_user, mqtt_password)) {
            Serial.println("connected");
            client.subscribe("outSide");
            client.subscribe("coolSide");
            client.subscribe("heater");
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}