//HomeScreen.js
import React from "react";
//import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import from react-native-safe-area-context
import {
  ImageBackground,
  Text,
  TouchableOpacity,
} from "react-native";
import { styles } from "../Styles/styles";
import backgroundImage from "../assets/background-image.png";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.homeContainer}>
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
