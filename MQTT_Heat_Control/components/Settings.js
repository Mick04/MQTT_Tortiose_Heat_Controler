//Setting.js
import { StatusBar } from "expo-status-bar";
import * as React from "react";
//import Paho from "paho-mqtt";
import { Client } from "react-native-paho-mqtt";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import DatePickerModal from "./DatePickerModal"; // Adjust the path as necessary
import TemperaturePicker from "./TemperaturePicker";
import { styles } from "../Styles/styles";

import MqttService from "./MqttService";

// /************************************
//  *    Creating a new MQTT client    *
//  *              start               *
//  * **********************************/

// const mqttService = new MqttService((message) => {
//   mqttService.onMessageReceived(message);
// });

// /************************************
//  *    Creating a new MQTT client    *
//  *                end               *
//  * **********************************/
const SettingsScreen = () => {
  const [Reset, setReset] = useState(true);
  const [amTemperature, setAmTemperature] = useState(" ");
  const [pmTemperature, setPmTemperature] = useState(" ");
  const [isAMDatePickerVisible, setAMDatePickerVisibility] = useState(false);
  const [isPMDatePickerVisible, setPMDatePickerVisibility] = useState(false);
  const [AMtime, setAMTime] = useState("");
  const [PMtime, setPMTime] = useState("");
  // const [gaugeHours, setgaugeHours] = useState(0);
  // const [gaugeMinutes, setgaugeMinutes] = useState(0);
  // const [HeaterStatus, setHeaterStatus] = useState(false);
  // const [targetTemperature, settargetTemperature] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const handleOpenAMDatePicker = () => setAMDatePickerVisibility(true);
  const handleOpenPMDatePicker = () => setPMDatePickerVisibility(true);
  const handleCloseAMDatePicker = () => setAMDatePickerVisibility(false);
  const handleClosePMDatePicker = () => setPMDatePickerVisibility(false);
  const [mqttService, setMqttService] = useState(null);

  // Function to handle AM time change
  const handleTimeChangeAM = (AMtime) => {
    setAMTime(AMtime);
    handleCloseAMDatePicker();
  };
  // Function to handle PM time change
  const handleTimeChangePM = (PMtime) => {
    setPMTime(PMtime);
    handleClosePMDatePicker();
  };

  // Toggle the reset state and log current state for debugging
  const handleOnPress = () => {
    setReset(!Reset);
    if (!Reset) {
      handlePublishMessage(); // Invoke the function here
    }
  };

  // const checkConnectionStatus = () => {
  //   const status = mqttService.getConnectionStatus();
  //   console.log("MQTT Connection Status:", status);
  //   setIsConnected(status);
  // };
  useEffect(() => {
    // const mqttService = new MqttService((message) => {
    // Existing message callback logic

    console.log("useEffect");
    const onMessageArrived =
      ((message) => {
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
        // console.log("Current values:", {
        //   outSide,
        //   coolSide,
        //   heater,
        // });
      },
      setIsConnected()); // Pass the setIsConnected function

    // Initialize the MQTT service

    const service = new MqttService(
      (message) => {
        // Handle incoming message logic here
        console.log("Received message:", message.payloadString);
      },
      setIsConnected(true) // Pass setIsConnected to update connection status
    );

    // Save the instance to state
    setMqttService(service);

    const mqtt = new MqttService(onMessageArrived);
    setMqttService(mqtt);

    mqtt.connect("Tortoise", "Hea1951Ter", {
      onSuccess: () => {
        console.log("TemperatureGraph Connected to MQTT broker");
        mqtt.subscribe("outSide");
        mqtt.subscribe("coolSide");
        mqtt.subscribe("heater");
      },
      onFailure: (error) => {
        console.error("Failed to connect to MQTT broker", error);
        setIsConnected(false);
      },
    });

    return () => {
      // Disconnect MQTT when component unmounts
      if (mqttService) {
        console.log("Disconnecting MQTT");
        mqttService.disconnect();
      }
    };
  }, []);
if (isConnected) {
  mqttService.publishMessage = (topic, message) => {
    console.log("Publishing message:", message);
    if (mqttService) {
      mqttService.publish(topic, message, (retain = true));
    }
  };
  };
  /********************************************************************
   *   Effect hook to establish MQTT connection and handle messages   *
   *                          start                                   *
   * ******************************************************************/

  // return () => {
  //   if (mqttService.client) {
  //     mqttService.client.disconnect();
  //   }
  // };

  // }, []);

  function handleReconnect() {
    console.log("131 qqqqqReconnecting...");
    mqttService.reconnectAttempts = 0;
    mqttService.reconnect();
  }

  function handlePublishMessage() {
    if (isConnected) {
      mqttService.publishMessage(amTemperature, pmTemperature, AMtime, PMtime);
    } else {
      console.error("mqttService is not initialized yet.");
    }
  }

  // function onMessageReceived(message) {
  //   const payload = message.payloadString;
  //   switch (message.destinationName) {
  //     case "amTemperature":
  //       setAmTemperature(payload);
  //       break;
  //     case "pmTemperature":
  //       setPmTemperature(payload);
  //       break;
  //     case "AMtime":
  //       setAMTime(payload);
  //       break;
  //     case "PMtime":
  //       setPMTime(payload);
  //       break;
  //     case "gaugeHours":
  //       setgaugeHours(parseInt(message.payloadString));
  //       break;
  //     case "gaugeMinutes":
  //       setgaugeMinutes(parseInt(message.payloadString));
  //       break;
  //     case "HeaterStatus":
  //       const newStatus = message.payloadString.trim() === "true";
  //       setHeaterStatus(newStatus);
  //       break;
  //     case "targetTemperature":
  //       settargetTemperature(message.payloadString.trim());
  //       break;
  //     default:
  //       console.log(`Unhandled topic: ${message.destinationName}`);
  //   }
  // }

  // client.onMessageArrived = onMessageReceived;
  // client.connect({ onSuccess: onConnect, onFailure });

  // return () => {
  //   client.disconnect();
  // };
  // }, []);

  /*************************************************************
   *   Cleanup function to disconnect when component unmounts  *
   *                            end                            *
   * ***********************************************************/

  // const reconnect = () => {
  //   if (!client.isConnected()) {
  //     console.log("Attempting to reconnect...");
  //     client.connect({
  //       onSuccess: () => {
  //         console.log("Reconnected successfully.");
  //         setIsConnected(true);

  //         // Clear previous data
  //         setAmTemperature(null);
  //         setPmTemperature(null);
  //         setAMTime("");
  //         setPMTime("");

  //         // Optionally, subscribe to the topics again
  //         client.subscribe("control");
  //         client.subscribe("amTemperature");
  //         client.subscribe("pmTemperature");
  //         client.subscribe("AMtime");
  //         client.subscribe("PMtime");
  //         client.subscribe("gaugeHours");
  //         client.subscribe("gaugeMinutes");
  //         client.subscribe("HeaterStatus");
  //         client.subscribe("targetTemperature");
  //       },
  //       onFailure: (err) => {
  //         console.log("Failed to reconnect:", err);
  //         setIsConnected(false);
  //       },
  //     });
  //   } else {
  //     console.log("Already connected.");
  //   }
  // };
  console.log("isConnected", isConnected);
  // console.log("updateConnectionStatus..." + this.updateConnectionStatus);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Settings</Text>
        <TouchableOpacity style={styles.reset} onPress={handleOnPress}>
          <Text style={styles.header}>
            {Reset ? "Press To Reset" : "PRESS WHEN FINISHED"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.header}>
          {isConnected ? "Connected" : "Disconnected"}
        </Text>
        <Text style={styles.timeHeader}>
          If time is incorrect, check housing
        </Text>

        <View>
          {/* <Text style={styles.timeText}>Hours: Minutes</Text> */}
          <Text style={styles.time}>
            {/* {gaugeHours}:{gaugeMinutes.toString().padStart(2, "0")} */}
          </Text>
          <Text
            style={[
              styles.TargetTempText,
              // { color: HeaterStatus ? "red" : "green" },
            ]}
          >
            {/* {"Heater Status = " + (HeaterStatus ? "on" : "off")} */}
          </Text>
          {/* Button to toggle the reset state */}
        </View>

        {!Reset && ( // Add this line to conditionally render the TimePicker components START
          <>
            {/* TimePicker components for AM and PM times */}
            <View style={styles.pickerContainer}>
              {/* TemperaturePicker components for AM temperatures */}
              <TemperaturePicker
                label="Am Target "
                temperature={amTemperature}
                onValueChange={setAmTemperature}
              />
            </View>
            <TemperaturePicker
              label="Target "
              temperature={pmTemperature}
              onValueChange={setPmTemperature}
              // onValueChange={(value) => setPmTemperature(value)}
            />
            <TouchableOpacity
              style={styles.timeReset}
              onPress={handleOpenAMDatePicker}
            >
              <Text style={styles.dataReset}>Select AM Time</Text>
              <DatePickerModal
                isVisible={isAMDatePickerVisible}
                onClose={handleCloseAMDatePicker}
                onTimeChange={handleTimeChangeAM}
              />
              <Text style={styles.dataText}>AM Time {AMtime}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeReset}
              onPress={handleOpenPMDatePicker}
            >
              <Text style={styles.dataReset}>Select PM Time </Text>

              <DatePickerModal
                isVisible={isPMDatePickerVisible}
                onClose={handleClosePMDatePicker}
                onTimeChange={handleTimeChangePM}
              />
              <Text style={styles.dataText}>PM Time {PMtime}</Text>
            </TouchableOpacity>
          </>
        )}
        {/* Add this line to conditionally render the TimePicker components END */}

        {Reset && ( // Add this line to conditionally render the TimePicker components START
          <>
            <Text style={styles.temperatureText}>
              {`AM Target Temperature:     ${
                amTemperature !== null ? `${amTemperature}°C` : "Not selected"
              }`}
            </Text>
            <Text style={styles.temperatureText}>
              {`Pm Target Temperature:    ${
                pmTemperature !== null ? `${pmTemperature}°C` : "Not selected"
              }`}
            </Text>
          </>
        )}
        <View style={styles.pickerContainer}>
          {Reset && ( // Add this line to conditionally render the TimePicker components
            <>
              <Text style={styles.dataReset}>
                {AMtime !== null ? `${AMtime} AM` : "Not selected"}
              </Text>

              <Text style={styles.dataReset}>
                {PMtime !== null ? `${PMtime} PM` : "Not selected"}
              </Text>
            </>
          )}
          <StatusBar style="auto" />
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

export default SettingsScreen;
