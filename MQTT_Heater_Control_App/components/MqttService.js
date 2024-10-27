//import { Client as PahoClient, Message } from "paho-mqtt";
import Paho from "paho-mqtt";
class MqttService {
  client = null;

  constructor(onMessageCallback) {
    console.log("MqttService constructor");
    // Initialize the client and pass in the callback for when a message is received
    this.client = new Paho.Client(
      "c846e85af71b4f65864f7124799cd3bb.s1.eu.hivemq.cloud", // Replace with your actual HiveMQ cluster URL
      Number(8884), // Secure WebSocket port (wss) for HiveMQ Cloud
      "react_native_mqtt"
    );

    this.client.onMessageArrived = onMessageCallback;
  }
  connect(username, password) {
    // Add username and password for authentication
    this.client.connect({
      onSuccess: () => {
        console.log("Connected to MQTT broker");
        this.client.subscribe("outSide"); // Subscribe to a topic upon successful connection
        this.client.subscribe("coolSide"); // Subscribe to a topic upon successful connection
        this.client.subscribe("heater"); // Subscribe to a topic upon successful connection
      },
      onFailure: (error) => {
        console.error("Failed to connect to MQTT broker", error);
      },
      userName: username, // Pass the username for the MQTT broker
      password: password, // Pass the password for the MQTT broker
      useSSL: true, // Ensure SSL is enabled for secure WebSocket connection
    });
  }
  disconnect() {
    if (this.client && this.client.isConnected()) {
      this.client.disconnect();
      console.log("Disconnected from MQTT broker");
    }
  }

  publish(topic, message) {
    if (this.client && this.client.isConnected()) {
      const messageObj = new Paho.Message(message);
      messageObj.destinationName = topic;
      this.client.send(messageObj);
      console.log(`Message sent to topic ${topic}: ${message}`);
    } else {
      console.error("MQTT client is not connected. Cannot publish message.");
    }
  }
  subscribe(topic) {
    console.log("MqttService subscribe topic: " + topic);
    if (this.client.isConnected()) {
      this.client.subscribe(topic, {
        onSuccess: () => {
          console.log(`MqttService subscribed to topic: ${topic}`);
          // mqtt.subscribe("outSide");
          // mqtt.subscribe("coolSide");
          // mqtt.subscribe("heater");
          // console.log(`MqttService Subscribed to topic: ${topic}`);
          // console.log("coolSide" + coolSide);
          // console.log("heater" + heater);
          // console.log("outSide" + outSide);
        },

        onFailure: (error) => {
          console.error(`Failed to subscribe to topic: ${topic}`, error);
        },
      });
    } else {
      console.error(
        `Cannot subscribe to topic: ${topic} because the client is not connected.`
      );
    }
  }

  publishMessage = (topic, message) => {
    console.log("publishing message");
    if (!client.isConnected()) {
      console.log("Client is not connected. Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          console.log("Reconnected successfully.");
          sendMessages();
        },
        onFailure: (err) => {
          console.log("Failed to reconnect:", err);
        },
      });
    } else {
      sendMessages();
    }
  };
}

export default MqttService;
