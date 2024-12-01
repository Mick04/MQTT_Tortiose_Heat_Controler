//Setting.js
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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
  // const [outSide, setOutSideTemp] = useState("");
  // const [coolSide, setCoolSideTemp] = useState("");
  // const [heater, setHeaterTemp] = useState("");
  const [gaugeHours, setGaugeHours] = useState(0);
  const [gaugeMinutes, setGaugeMinutes] = useState(0);
  const [HeaterStatus, setHeaterStatus] = useState(false);
  const [targetTemperature, setTargetTemperature] = useState(0);
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

  //useEffect(() => {
  // const mqttService = new MqttService((message) => {
  // Existing message callback logic
  const onMessageArrived = useCallback((message) => {
    // console.log("Settings line 82 Message received: ", message.payloadString);
    const payload = message.payloadString;
    switch (message.destinationName) {
      case "amTemperature":
        setAmTemperature(payload);
        //("Settings line 87 amTemperature " + amTemperature);
        break;
      case "pmTemperature":
        setPmTemperature(payload);
        //console.log("Settings line 91 pmTemperature " + pmTemperature);
        break;
      case "AMtime":
        setAMTime(payload);
        //console.log("Settings line 95 AMtime " + AMtime);
        break;
      case "PMtime":
        setPMTime(payload);
        break;
      case "gaugeHours":
        setGaugeHours(parseInt(message.payloadString));
        //console.log("Settings line 102 gaugeHours " + gaugeHours);
        break;
      case "gaugeMinutes":
        setGaugeMinutes(parseInt(message.payloadString));
        //console.log("Settings line 106 gaugeMinutes " + gaugeMinutes);
        break;
      case "HeaterStatus":
        const newStatus = message.payloadString.trim() === "true";
        setHeaterStatus(newStatus);
        //console.log("Settings line 111 HeaterStatus " + newStatus);
        break;
      case "targetTemperature":
        setTargetTemperature(message.payloadString.trim());
        break;
      default:
      //console.log(`Unhandled topic: ${message.destinationName}`);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      //console.log("SettingsScreen is focused");

      // Initialize the MQTT service
      const mqtt = new MqttService(onMessageArrived, { setIsConnected });
      mqtt.connect("Tortoise", "Hea1951Ter", {
        onSuccess: () => {
          //console.log("Settings line 125 TemperatureGraph Connected to MQTT broker");
          setIsConnected(true);
          mqtt.subscribe("control");
          mqtt.subscribe("amTemperature");
          mqtt.subscribe("pmTemperature");
          mqtt.subscribe("AMtime");
          //console.log("Settings line 133 AMtime " + AMtime);
          mqtt.subscribe("PMtime");
          //console.log("Settings line 135 PMtime " + PMtime);
          mqtt.subscribe("gaugeHours");
          mqtt.subscribe("gaugeMinutes");
          mqtt.subscribe("HeaterStatus");
          mqtt.subscribe("targetTemperature");
        },
        onFailure: (error) => {
          console.error(
            "Settings line 143 Failed to connect to MQTT broker ",
            error
          );
          setIsConnected(false);
        },
      });
      setMqttService(mqtt);
      /********************************************************************
       *   Effect hook to establish MQTT connection and handle messages   *
       *                          start                                   *
       * ******************************************************************/

      return () => {
        console.log("GaugeScreen is unfocused, cleaning up...");
        // Disconnect MQTT when component unmounts
        if (mqtt) {
          console.log("Settings line 156 Disconnecting MQTT");
          mqtt.disconnect();
        }
        setIsConnected(false); // Reset connection state
      };
    }, [onMessageArrived])
  );

  function handleReconnect() {
    //console.log("Settings line 163 handleReconnect...");
    mqttService.reconnectAttempts = 0;
    mqttService.reconnect();
  }

  function handlePublishMessage() {
    //console.log("Settings line 183 isConnected ", isConnected);
    if (isConnected) {
      //console.log("settings line 169 targetTemperature " + targetTemperature);
      mqttService.publishMessage(
        amTemperature,
        pmTemperature,
        AMtime,
        PMtime,
        targetTemperature
      );
      //console.log("Settings line 176 targetTemperature " + targetTemperature);
    } else {
      console.error("Settings line 179 mqttService is not initialized yet.");
    }
  }

  // console.log("Settings line 183 gaugeHours " + gaugeHours);
  // console.log("Settings line 184 gaugeMinutes " + gaugeMinutes);
  // console.log("Settings line 185 HeaterStatus " + HeaterStatus);
  // console.log("Settings line 186 targetTemperature " + targetTemperature);
  // console.log("Settings line 18t isConnected" + isConnected);

  // console.log("Settings line 282 isConnected ", isConnected);
  // console.log("updateConnectionStatus..." + this.updateConnectionStatus);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>MQTT_Heat_Control</Text>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.timeHeader}>
          If time is incorrect, check housing
        </Text>
        <View>
        <Text style={styles.timeText}>Hours: Minutes</Text>
        <Text style={styles.time}>
          {gaugeHours}:{gaugeMinutes.toString().padStart(2, "0")}
        </Text>
        </View>
        <TouchableOpacity style={styles.reset} onPress={handleOnPress}>
          <Text style={styles.header}>
            {Reset ? "Press To Reset" : "PRESS WHEN FINISHED"}
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.connectionStatus,
            { color: isConnected ? "green" : "red" },
          ]}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </Text>
        <View>
          <Text
            style={[
              styles.TargetTempText,
              // { color: HeaterStatus ? "red" : "green" },
            ]}
          ></Text>
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
