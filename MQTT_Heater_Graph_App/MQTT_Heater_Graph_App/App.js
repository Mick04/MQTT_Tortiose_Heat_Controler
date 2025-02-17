// In App.js in a new project

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView, StyleSheet, Platform, StatusBar } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// import SettingsScreen from "./components/Settings.js";
import CoolSideGraph from "./CoolSideGraph.js";
import OutSideGraph from "./OutSideGraph.js";
import HeatGraph from "./HeaterGraph.js";
// import HomeScreen from "./components/HomeScreen.js";
// import { useMQTT } from "./components/MQTTService";

const Tab = createMaterialTopTabNavigator();

function App() {
  return (
    <SafeAreaView style={styles.AndroidSafeArea}>
      <NavigationContainer>
        <Tab.Navigator initialRouteName="HeatGraph">
          {/* <Tab.Screen name="Home" component={HomeScreen} /> */}
          {/* <Tab.Screen name="Dials" component={DialsScreen} /> */}
          {/* <Tab.Screen name="Gauges" component={GaugeScreen} /> */}
          <Tab.Screen name="CoolSide" component={CoolSideGraph} />
          <Tab.Screen name="OutSideGraph" component={OutSideGraph} />
          <Tab.Screen name="HeatGraph" component={HeatGraph} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
// export default function App() {
//   return (
//     <TemperatureDataProvider>
//       <AppContent />
//     </TemperatureDataProvider>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
export default App;
