import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Heart, Zap, Hexagon, Flame } from "lucide-react-native";

interface UserStatsProps {
  health?: number;
  energy?: number;
  gems?: number;
  streak?: number;
}

const UserStats = ({
  health = 100,
  energy = 126,
  gems = 505,
  streak = 7,
}: UserStatsProps) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statPill}>
        <Heart size={20} color="#FF5757" />
        <Text style={styles.statText}>{health}</Text>
      </View>

      <View style={styles.statPill}>
        <Zap size={20} color="#FFB443" />
        <Text style={styles.statText}>{energy}</Text>
      </View>

      <View style={styles.statPill}>
        <Hexagon size={20} color="#7B61FF" />
        <Text style={styles.statText}>{gems}</Text>
      </View>

      <View style={[styles.statPill, styles.streakPill]}>
        <Flame size={20} color="#FF4D4D" />
        <Text style={styles.statText}>{streak}</Text>
      </View>
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