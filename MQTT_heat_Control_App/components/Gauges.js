
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MqttService from "../MqttService";
// Gauges.js
const TemperatureGraph = () => {
  console.log("TemperatureGraph");
  const [mqttService, setMqttService] = useState(null);
  const [outSide, setOutSide] = useState("");
  const [coolSide, setCoolSideTemp] = useState("");
  const [heater, setControlTemp] = useState("");
  useEffect(() => {
    console.log("useEffect");

    const onMessageArrived = (message) => {
      console.log("Message received:", message.payloadString);
      switch (message.destinationName) {
        case "outSide":
          setOutSide(parseInt(message.payloadString));
          break;
        case "coolSide":
          setCoolSideTemp(parseInt(message.payloadString));
          console.log("coolSide " + coolSide);
          break;
        case "heater":
          setControlTemp(parseInt(message.payloadString));
          break;
        default:
          console.log("Unknown topic:", message.destinationName);
      }
      // Log the updated values
      console.log("Current values:", {
        outSide,
        coolSide,
        heater,
      });
    };

    // Initialize the MQTT service
    const mqtt = new MqttService(onMessageArrived);
    mqtt.connect("Tortoise", "Hea1951Ter", {
      onSuccess: () => {
        console.log("TemperatureGraph Connected to MQTT broker");
        mqtt.subscribe("outSide");
        mqtt.subscribe("coolSide");
        mqtt.subscribe("heater");
      },
      onFailure: (error) => {
        console.error("Failed to connect to MQTT broker", error);
      },
    });

    setMqttService(mqtt);

    return () => {
      // Disconnect MQTT when component unmounts
      if (mqttService) {
        console.log("Disconnecting MQTT");
        mqttService.disconnect();
      }
    };
  }, []);

  const publishMessage = (topic, message) => {
    console.log("Publishing message:", message);
    if (mqttService) {
      mqttService.publish(topic, message, (retain = true));
    }
  };

  // subscribeToTopic = (topic) => {
  //   console.log("TemperatureGraph Subscribing to topic:", topic);
  //   if (mqttService) {
  //     console.log("TemperatureGraph Subscribing to topic:", topic);
  //     console.log(`TemperatureGraph Subscribed to topic: ${topic}`);

  //     mqttService.subscribe(topic, {
  //       // onSuccess: () => {
  //       //   console.log(`TemperatureGraph Subscribed to topic: ${topic}`);
  //       // },
  //       // onFailure: (error) =>
  //       //   console.error(`TemperatureGraph Failed to subscribe to topic: ${topic}`, error),
  //     });
  //   }
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Temperature Over Time</Text>
      <View>
        <TouchableOpacity onPress={() => subscribeToTopic("outSide")}>
          <Text>Subscribe to Temperature Topic</Text>
          <Text>Topic = {outSide} </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => subscribeToTopic("coolSide")}>
          <Text>Subscribe to Temperature Topic</Text>
          <Text>Topic = {coolSide} </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => subscribeToTopic("heater")}>
          <Text>Subscribe to Temperature Topic</Text>
          <Text>Topic = {heater} </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => publishMessage("outSide", "12",(retain = true))}>
          <Text>Publish Message</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => publishMessage("coolSide", "13", (retain = true))}>
          <Text>Publish Message</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => publishMessage("heater", "14", (retain = true))}>
          <Text>Publish Message</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.outPut}>
        <Text>Outside Temperature: {outSide}</Text>
        <Text>CoolSide Temperature: {coolSide}</Text>
        <Text>Heater Temperature: {heater}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  outPut: {
    fontSize: 20,
    margin: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
});

export default TemperatureGraph;
