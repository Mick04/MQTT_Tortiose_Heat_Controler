import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-gifted-charts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MqttService from "./MqttService";
import { styles } from "./Styles/styles";

const HeatGraph = () => {
  const [mqttService, setMqttService] = useState(null);
  // const [outSide, setOutSideTemp] = useState("");
  // const [coolSide, setCoolSideTemp] = useState("");
  // const [heater, setHeaterTemp] = useState("");
  const [gaugeHours, setGaugeHours] = useState(0);
  const [gaugeMinutes, setGaugeMinutes] = useState(0);
  const [HeaterStatus, setHeaterStatus] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState([
    { value: -10, label: "10:00", dataPointText: "-10 c˚" },
    // { value: -8, label: "10:30", dataPointText: "-8" },
    // { value: -4, label: "11:00", dataPointText: "-4" },
    // { value: 0, label: "11:30", dataPointText: "0" },
  ]);
  const [heater, setHeaterTemp] = useState("");

  // Define the onMessageArrived callback
  const onMessageArrived = useCallback(
    (message) => {
      if (message.destinationName === "heater") {
        const newTemp = parseFloat(message.payloadString).toFixed(.1);
        const lastTemp = data.length > 0 ? data[data.length - 1].value : null;

        if (lastTemp === null || Math.abs(newTemp - lastTemp) >= 0.5) {
          const formattedTemp = parseFloat(newTemp); // Convert back to number
          setHeaterTemp(formattedTemp);
          console.log("Gauges line 32 heater: ", heater);

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
    [heater]
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

          mqtt.client.subscribe("heater");
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
        <Text style={styles.header}> Heater Temperature</Text>
       
        <Text style={styles.timeText}>Hours: Minutes</Text>
        <Text style={styles.time}> 
            {gaugeHours}:{gaugeMinutes.toString().padStart(2, "0")}
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
      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          color="blue"
          thickness={2}
          width={500}
          hight={500}
          initialSpacing={0}
          xAxisLabelTextStyle={{ color: "green", fontSize: 19 }}
          yAxisLabelTextStyle={{ color: "red", fontSize: 22 }}
          // yAxisInterval={10}
          //dataPointsColor={"blue"}
          dataPointsRadius={3}
          textShiftY={-20} // Move data points up by 10 units={20}
          hideYAxisText
          spacing={94}
          textFontSize={26} // font size of the text on the data points
          textColor1="red"
          //padding={50}
          yAxisMinValue={-10} // Ensure y-axis starts from =10
          yAxisMaxValue={40} // Ensure y-axis ends at 30
          scrollToEnd={true} // Scroll to the end to show the last entry
          curved={true} // Make the line points curved
          // showVerticalLines={true} // Show vertical lines
          // verticalLinesColor="gray" // Color of the vertical lines
          // verticalLinesThickness={2} // Thickness of the vertical lines
        />
      </View>
      <TouchableOpacity
        style={styles.reconnectButton}
        onPress={handleReconnect}
      >
        <Text style={styles.reconnectText}>Reconnect</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};
export default HeatGraph;
