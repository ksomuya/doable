import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Zap, Flame } from "lucide-react-native";

interface UserStatsProps {
  energy?: number;
  streak?: number;
  onStreakPress?: () => void;
}

const UserStats = ({
  energy = 126,
  streak = 7,
  onStreakPress = () => {},
}: UserStatsProps) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statPill}>
        <Zap size={20} color="#FFB443" />
        <Text style={styles.statText}>{energy}</Text>
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
