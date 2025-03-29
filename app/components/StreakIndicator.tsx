import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Flame } from "lucide-react-native";

interface StreakIndicatorProps {
  streak: number;
  visible: boolean;
}

const StreakIndicator = ({ streak, visible }: StreakIndicatorProps) => {
  const translateY = new Animated.Value(50);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible && streak > 0) {
      // Reset position
      translateY.setValue(50);
      opacity.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate out after delay
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -50,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [streak, visible]);

  if (!visible || streak === 0) return null;

  const getStreakColor = () => {
    if (streak >= 10) return "#EF4444"; // Red for 10+
    if (streak >= 5) return "#F59E0B"; // Amber for 5+
    return "#10B981"; // Green for others
  };

  const getStreakMessage = () => {
    if (streak >= 10) return "You're on fire! 🔥";
    if (streak >= 5) return "Great streak! 🎯";
    if (streak >= 3) return "Keep it up! 👍";
    return "Good job! 👏";
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
        { backgroundColor: getStreakColor() },
      ]}
    >
      <Flame size={20} color="white" />
      <Text style={styles.streakText}>{streak} in a row!</Text>
      <Text style={styles.message}>{getStreakMessage()}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  streakText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  message: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 8,
  },
});

export default StreakIndicator;
