// In App.js in a new project

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView, StyleSheet, Platform, StatusBar } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import SettingsScreen from "./components/Settings.js";
import GaugeScreen from "./components/Gauges.js";
import HomeScreen from "./components/HomeScreen.js";
import CoolSideGraph from "./components/CoolSideGraph.js";
import OutSideGraph from "./components/OutSideGraph.js";
import HeatGraph from "./components/HeaterGraph.js";

// import { useMQTT } from "./components/MQTTService";

const Tab = createMaterialTopTabNavigator();

function App() {
  return (
    <SafeAreaView style={styles.AndroidSafeArea}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          tabBarOptions={{
            activeTintColor: "red", // Change this to your desired active tab text color
            inactiveTintColor: "blue", // Change this to your desired inactive tab text color
            labelStyle: { fontSize: 16 }, // Customize the label style
            indicatorStyle: { backgroundColor: 'red' }, // Customize the tab bar underline
            style: { backgroundColor: "white" }, // Customize the tab bar background color
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Gauges" component={GaugeScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen name="coolSide" component={CoolSideGraph} />
          <Tab.Screen name="outSide" component={OutSideGraph} />
          <Tab.Screen name="heatGraph" component={HeatGraph} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
export default App;
