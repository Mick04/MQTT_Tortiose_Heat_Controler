import React, { useRef, useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useFocusEffect } from "@react-navigation/native";
import { styles } from "./Styles/styles";
const CustomLineChart = ({ data }) => {
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
    //const label = value.label; // Ensure value.label is a valid timestamp or string
    const date = new Date(value.label);
    const dateString = date.toLocaleDateString(); // Format the date
    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }); // Format the time
  
    return (
      <View style={{ alignItems: "center" }}>
        {/* Render date above the time */}
        <Text style={{ color: "green", fontSize: 12 }}>{dateString}</Text>
        <Text style={{ color: "green", fontSize: 19 }}>{timeString}</Text>
      </View>
    );
  };

//   const data = [
//     {
//       value: 20,
//       label: "2024-11-27T10:30:00Z", // ISO 8601 format or a timestamp
//       dataPointText: "20°C",
//     },
//     {
//       value: 25,
//       label: "2024-11-27T11:00:00Z",
//       dataPointText: "25°C",
//     },
//   ];

  return (
    <View style={styles.container}>
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
          height={600}
          initialSpacing={0}
          xAxisLabelComponent={renderXAxisLabel}
        //   xAxisLabelTextStyle={{ color: "green", fontSize: 19 }}
          yAxisLabelTextStyle={{ color: "red", fontSize: 22 }}
          // yAxisInterval={10}
          //dataPointsColor={"blue"}
          dataPointsRadius={3}
          textShiftY={-25} // Move data points up by 10 units={20}
          hideYAxisText
          spacing={94}
          textFontSize={26} // font size of the text on the data points
          textColor1="red"
          //padding={50}
          yAxisMinValue={-10} // Ensure y-axis starts from =10
          yAxisMaxValue={40} // Ensure y-axis ends at 30
          curved={true} // Make the line points curved
          // showVerticalLines={true} // Show vertical lines
          // verticalLinesColor="gray" // Color of the vertical lines
          // verticalLinesThickness={2} // Thickness of the vertical lines
        />
      </ScrollView>
    </View>
  );
};
export default CustomLineChart;
