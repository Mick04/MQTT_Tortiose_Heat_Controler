import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import AsyncStorage from "@react-native-async-storage/async-storage";
const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState([
    // { value: -10, label: "10:00", dataPointText: "-10 c˚" },
    // { value: -8, label: "10:30", dataPointText: "-8" },
    // { value: -4, label: "11:00", dataPointText: "-4" },
    // { value: 0, label: "11:30", dataPointText: "0" },
  ]);

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
        <Text style={styles.header}> Ooutside Temperature</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter value"
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
        />
        <Button title="Add Data Point" onPress={addDataPoint} />
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
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  chartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 80,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "red",
    padding: 10,
    marginLeft: "50%",
    width: 80,
    fontSize: 20,
  },
});
