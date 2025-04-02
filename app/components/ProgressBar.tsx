import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  height?: number;
  backgroundColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
  style?: object;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  height = 4,
  backgroundColor = "#E5E7EB",
  gradientColors = ["#4F46E5", "#7C3AED"],
  style = {},
}) => {
  // Calculate width percentage
  const progressPercentage = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);
  
  return (
    <View style={[styles.container, { height: height, backgroundColor }, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressFill, { width: `${progressPercentage}%` }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});

export default ProgressBar;
