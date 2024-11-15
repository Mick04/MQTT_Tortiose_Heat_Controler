//MqttService.js
import Paho from "paho-mqtt";
class MqttService {
  client = null;

  constructor(onMessageArrived, setIsConnected) {
    console.log("MqttService constructor");
    // Initialize the client and pass in the callback for when a message is received
    this.client = new Paho.Client(
      "c846e85af71b4f65864f7124799cd3bb.s1.eu.hivemq.cloud", // Replace with your actual HiveMQ cluster URL
      Number(8884), // Secure WebSocket port (wss) for HiveMQ Cloud
      "react_native_mqtt"
    );

    this.client.onMessageArrived = onMessageArrived;
    this.client.onConnectionLost = (responseObject) => {
      console.error("Connection lost:", responseObject.errorMessage);
      if (this.setIsConnected) this.setIsConnected(false);
    };
  }
  connect(username, password, options = {}) {
    console.log("line 19 MqttService connect");
    // Add username and password for authentication
    this.client.connect({
      onSuccess: () => {
        setIsConnected(true);
        clearRetainedMessages(); // Clear retained messages
        console.log(`MqttService subscribed to topic: ${topic}`);
      },
      onFailure: (error) => {
        console.error("Failed to connect to MQTT broker", error);
      },
      userName: username, // Pass the username for the MQTT broker
      password: password, // Pass the password for the MQTT broker
      useSSL: true, // Ensure SSL is enabled for secure WebSocket connection
      ...options,
    });
  }
  disconnect() {
    if (this.client && this.client.isConnected()) {
      this.client.disconnect();
      console.log("Disconnected from MQTT broker");
    }
  }

  reconnect = () => {
    if (this.client && !this.client.isConnected()) {
      console.log("Attempting to reconnect...");
      this.client.connect({
        onSuccess: () => {
          console.log("Reconnected successfully.");
          if (this.setIsConnected) this.setIsConnected(true);
        },
        onFailure: (error) => {
          console.log("Failed to reconnect:", error);
          if (this.setIsConnected) this.setIsConnected(false);
        },
      });
    } else if (this.client && this.client.isConnected()) {
      console.warn("Client is already connected");
    } else {
      console.warn("Client is not initialized");
    }
  };

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
}

export default MqttService;
