//HomeScreen.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import from react-native-safe-area-context
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import backgroundImage from "../assets/background-image.png";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={backgroundImage} style={[styles.image]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Go to Home screen</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Dials")}
        >
          <Text style={styles.buttonText}>Go to Dials screen</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Gauges")}
        >
          <Text style={styles.buttonText}>Go to Gauges screen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.buttonText}>Go to Settings screen</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.button}
          // onPress={() => navigation.navigate("Graph")}
        >
          {/* <Text style={styles.buttonText}>Go to Graph screen</Text> */}
       {/*</TouchableOpacity>
         */}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Centers children vertically in the container
    alignItems: "center", // Centers children horizontally in the container
  },
  image: {
    width: "100%", // Example width
    height: "100%", // Example height
    justifyContent: "center", // Centers children vertically in the container
    alignItems: "center", // Centers children horizontally in the container
  },
  button: {
    margin: 10,
    width: 250,
    backgroundColor: "rgba(173,216,230,0.80)", // Semi-transparent light bluebackground
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    alignItems: "center",
    fontSize: 20,
    color: "red",
  },
});
