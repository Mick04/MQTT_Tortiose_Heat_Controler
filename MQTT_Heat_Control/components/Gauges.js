//Gauges.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import MqttService from "./MqttService";
import { styles } from "../Styles/styles";
const GaugeScreen = () => {
  console.log("TemperatureGraph");
  const [mqttService, setMqttService] = useState(null);
  const [outSide, setOutSideTemp] = useState("");
  const [coolSide, setCoolSideTemp] = useState("");
  const [heater, setHeaterTemp] = useState("");
  const [gaugeHours, setGaugeHours] = useState(0);
  const [gaugeMinutes, setGaugeMinutes] = useState(0);
  const [HeaterStatus, setHeaterStatus] = useState(false);
  const [targetTemperature, setTargetTemperature] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    console.log("useEffect");

    const onMessageArrived =
      (message) => {
        console.log("Message received:", message.payloadString);
        switch (message.destinationName) {
          case "outSide":
            setOutSideTemp(parseInt(message.payloadString));
            break;
          case "coolSide":
            setCoolSideTemp(parseInt(message.payloadString));
            break;
          case "heater":
            setHeaterTemp(parseInt(message.payloadString));
            break;
          case "gaugeHours":
            setGaugeHours(parseInt(message.payloadString));
            break;
          case "gaugeMinutes":
            setGaugeMinutes(parseInt(message.payloadString));
            break;
          case "HeaterStatus":
            const newStatus = message.payloadString.trim() === "true";
            setHeaterStatus(newStatus);
            console.log("HeaterStatus", newStatus); 
           break;
          case "targetTemperature":
            setTargetTemperature(message.payloadString.trim());
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
// Pass the setIsConnected function
    // Initialize the MQTT service
    const mqtt = new MqttService(onMessageArrived, setIsConnected);
console.log("line 55 TemperatureGraph");
    mqtt.connect("Tortoise", "Hea1951Ter", {
      onSuccess: () => {
        console.log("TemperatureGraph Connected to MQTT broker");
        setIsConnected(true);
        mqtt.client.subscribe("outSide");
        mqtt.client.subscribe("coolSide");
        mqtt.client.subscribe("heater");
        mqtt.client.subscribe("gaugeHours");
        mqtt.client.subscribe("gaugeMinutes");
        mqtt.client.subscribe("HeaterStatus");
        mqtt.client.subscribe("targetTemperature");
      },
      onFailure: (error) => {
        console.error("Failed to connect to MQTT broker", error);
        setIsConnected(false);
      },
    });

    setMqttService(mqtt);

    return () => {
      // Disconnect MQTT when component unmounts
      if (mqttService) {
        console.log("Disconnecting MQTT");
        mqttService.disconnect();
      }
      setIsConnected(false); // Reset connection state
    };
  }, []);
  function handleReconnect() {
    console.log("131 qqqqqReconnecting...");
    if (mqttService) {
      mqttService.reconnect();
    mqttService.reconnectAttempts = 0;
    }
    else {
      console.log("MQTT Service is not initialized");
  }
}
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Gauges</Text>
        <Text style={styles.timeHeader}>
          If time is incorrect, check housing
        </Text>
        <View>
          {/* <Text style={styles.timeText}>Hours: Minutes</Text> */}
          <Text style={styles.time}>
            {gaugeHours}:{gaugeMinutes.toString().padStart(2, "0")}
          </Text>
          <Text
            style={[
              styles.TargetTempText,
              { color: HeaterStatus ? "red" : "green" },
            ]}
          >
            {"Heater Status = " + (HeaterStatus ? "on" : "off")}
          </Text>
        </View>
        <Text style={styles.TargetTempText}>
          {"Target Temperature = " + targetTemperature}{" "}
        </Text>
        <View style={styles.tempContainer}>
          <Text style={[styles.tempText, { color: "black" }]}>
            {"outSide Temperature = " + outSide + "\n"}
          </Text>
          <Text style={[styles.tempText, { color: "green" }]}>
            {"coolSide Temperature = " + coolSide + "\n"}
          </Text>

          <Text style={[styles.tempText, { color: "red" }]}>
            {"heater Temperature = " + heater}
          </Text>
        </View>
        <View style={styles.connectionStatus}>
          <Text
            style={[
              styles.connectionStatus,
              { color: isConnected ? "green" : "red" },
            ]}
          >
            {isConnected
              ? "Connected to MQTT Broker"
              : "Disconnected from MQTT Broker"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.reconnectButton}
          onPress={handleReconnect}
        >
          <Text style={styles.reconnectText}>Reconnect</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
};

export default GaugeScreen;
