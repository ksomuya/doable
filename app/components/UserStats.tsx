import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Thermometer, Zap, Snowflake, Flame } from "lucide-react-native";

interface UserStatsProps {
  temperature?: number;
  energy?: number;
  snowballs?: number;
  streak?: number;
  onTemperaturePress?: () => void;
  onStreakPress?: () => void;
}

const UserStats = ({
  temperature = 30,
  energy = 126,
  snowballs = 505,
  streak = 7,
  onTemperaturePress = () => {},
  onStreakPress = () => {},
}: UserStatsProps) => {
  // Function to determine temperature color based on value
  const getTemperatureColor = (temp: number) => {
    if (temp <= 20) return "#3B82F6"; // Blue - optimal
    if (temp <= 50) return "#FBBF24"; // Yellow - warning
    return "#EF4444"; // Red - critical
  };

  return (
    <View style={styles.statsContainer}>
      <TouchableOpacity
        style={[
          styles.statPill,
          { borderColor: getTemperatureColor(temperature) },
        ]}
        onPress={onTemperaturePress}
      >
        <Thermometer size={20} color={getTemperatureColor(temperature)} />
        <Text
          style={[styles.statText, { color: getTemperatureColor(temperature) }]}
        >
          {temperature}°
        </Text>
      </TouchableOpacity>

      <View style={styles.statPill}>
        <Zap size={20} color="#FFB443" />
        <Text style={styles.statText}>{energy}</Text>
      </View>

      <View style={styles.statPill}>
        <Snowflake size={20} color="#3B82F6" />
        <Text style={styles.statText}>{snowballs}</Text>
      </View>

      <TouchableOpacity
        style={[styles.statPill, styles.streakPill]}
        onPress={onStreakPress}
      >
        <Flame size={20} color="#FF4D4D" />
        <Text style={styles.statText}>{streak}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  streakPill: {
    backgroundColor: "#FFF5F5",
  },
  statText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default UserStats;
