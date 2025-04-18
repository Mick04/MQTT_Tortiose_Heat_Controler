import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MqttService from "./MqttService";
import CustomLineChart from "./CustomLineChart"; // Import the reusable component
import { styles } from "./Styles/styles";

const OutSideGraph = () => {
  const [mqttService, setMqttService] = useState(null);
  const [outSide, setHeaterTemp] = useState("");
  const [gaugeHours, setGaugeHours] = useState(0);
  const [gaugeMinutes, setGaugeMinutes] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState([
    { value: -10, label: "10:00", dataPointText: "-10 c˚" },
  ]);

  // Define the onMessageArrived callback
  const onMessageArrived = useCallback(
    (message) => {
      if (message.destinationName === "outSide") {
        const newTemp = parseFloat(message.payloadString).toFixed(0.1);
        const lastTemp = data.length > 0 ? data[data.length - 1].value : null;

        if (lastTemp === null || Math.abs(newTemp - lastTemp) >= 0.5) {
          const formattedTemp = parseFloat(newTemp); // Convert back to number
          setHeaterTemp(formattedTemp);
          console.log("Gauges line 32 outSide: ", outSide);

          setData((prevData) => [
            ...prevData,
            {
              value: formattedTemp,
              label: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              dataPointText: `${formattedTemp} c˚`,
            },
          ]);
        }
      }
      if (message.destinationName === "gaugeHours") {
        setGaugeHours(parseInt(message.payloadString));
      }
      if (message.destinationName === "gaugeMinutes") {
        setGaugeMinutes(parseInt(message.payloadString));
      }
    },
    [data, outSide]
  );

  useFocusEffect(
    useCallback(() => {
      console.log("GaugeScreen is focused");

      // Initialize the MQTT service
      const mqtt = new MqttService(onMessageArrived, setIsConnected);
      console.log("line 55 TemperatureGraph ");
      mqtt.connect("Tortoise", "Hea1951Ter", {
        onSuccess: () => {
          console.log(
            "Settings line 76 TemperatureGraph Connected to MQTT broker"
          );
          setIsConnected(true);

          mqtt.client.subscribe("outSide");
          mqtt.client.subscribe("gaugeHours");
          mqtt.client.subscribe("gaugeMinutes");
          // mqtt.client.subscribe("HeaterStatus");
          // mqtt.client.subscribe("topicTargetTemperature");
        },
        onFailure: (error) => {
          console.error("Failed to connect to MQTT broker", error);
          setIsConnected(false);
        },
      });

      setMqttService(mqtt);

      return () => {
        console.log("GaugeScreen is unfocused, cleaning up...");
        // Disconnect MQTT when the screen is unfocused
        if (mqtt) {
          console.log("Gauges line 97 Disconnecting MQTT");
          mqtt.disconnect();
        }
        setIsConnected(false); // Reset connection state
      };
    }, [onMessageArrived])
  );

  function handleReconnect() {
    console.log("Gauges line 104 Reconnecting...");
    if (mqttService) {
      mqttService.reconnect();
      mqttService.reconnectAttempts = 0;
    } else {
      console.log("Gauges line 110 MQTT Service is not initialized");
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("chartData");
        if (savedData) {
          setData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("chartData", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save data", error);
      }
    };

    saveData();
  }, [data]);

  const addDataPoint = () => {
    const newValue = parseFloat(inputValue);
    if (isNaN(newValue)) {
      Alert.alert("Invalid input", "Please enter a valid number", [
        { text: "OK" },
      ]);
      return;
    }
    const newLabel = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newDataPoint = {
      value: newValue,
      label: newLabel,
      dataPointText: `${newValue} c˚`,
    };
    setData([...data, newDataPoint]);
    setInputValue("");
  };
  return (
    <SafeAreaView style={styles.container}>
  <View>
    <Text style={styles.header}>CoolSide Temperature</Text>
    <Text style={styles.timeText}>Hours: Minutes</Text>
    <Text style={styles.time}>
      {gaugeHours}:{gaugeMinutes.toString().padStart(2, "0")}
    </Text>
  </View>
  <Text
    style={[
      styles.connectionStatus,
      { color: isConnected ? "green" : "red" },
    ]}
  >
    {isConnected ? "Connected to MQTT Broker" : "Disconnected from MQTT Broker"}
  </Text>
  <CustomLineChart data={data} />
  <TouchableOpacity style={styles.reconnectButton} onPress={handleReconnect}>
    <Text style={styles.reconnectText}>Reconnect</Text>
  </TouchableOpacity>
  <StatusBar style="auto" />
</SafeAreaView>
  );
};
export default OutSideGraph;
