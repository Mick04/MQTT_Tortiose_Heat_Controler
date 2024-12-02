import React, { useRef, useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useFocusEffect } from "@react-navigation/native";
import { styles } from "../Styles/styles";

const CustomLineChart = ({ data, GraphTextcolor }) => {
  const scrollViewRef = useRef(null);

  const scrollToEnd = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToEnd();
  }, [data]);

  useFocusEffect(
    React.useCallback(() => {
      scrollToEnd();
    }, [])
  );
  const renderXAxisLabel = (value) => {
    console.log("renderXAxisLabel - value:", value);
    let dateString = "Invalid Date";
    let timeString = value.label;

    // Check if value.label is a valid string
    if (value.label) {
      // Combine current date with time to create a valid date object
      const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
      const combinedDateTime = `${today}T${value.label}`;
      const date = new Date(combinedDateTime);

      if (!isNaN(date)) {
        dateString = date.toLocaleDateString(); // Format the date
        timeString = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }); // Format the time
      }
    }

    return (
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "green", fontSize: 12 }}>{dateString}</Text>
        <Text style={{ color: "green", fontSize: 19 }}>{timeString}</Text>
      </View>
    );
  };

  return (
    <View style={styles.lineGraphContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <LineChart
          data={data}
          color="blue"
          thickness={2}
          width={data.length * 94} // Adjust width based on data length
          height={550}
          initialSpacing={0}
          xAxisLabelComponent={renderXAxisLabel}
          yAxisLabelTextStyle={{ color: "red", fontSize: 22 }}
          dataPointsRadius={3}
          textShiftY={-25} // Move data points up by 10 units={20}
          hideYAxisText
          spacing={94}
          textFontSize={26} // font size of the text on the data points
          textColor1={GraphTextcolor}
          showScrollIndicator={true}
          yAxisMinValue={-10} // Ensure y-axis starts from =10
          yAxisMaxValue={40} // Ensure y-axis ends at 30
          curved={true} // Make the line points curved
          //paddingBottom={50} // Add padding to the top of the graph
          //paddingTop={50} // Add padding to the bottom of the graph
        />
      </ScrollView>
    </View>
  );
};
export default CustomLineChart;
