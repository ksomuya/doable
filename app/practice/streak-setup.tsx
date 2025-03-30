import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Check } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";

const StreakSetupScreen = () => {
  const router = useRouter();
  const { updateStreakGoal } = useAppContext();
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  
  const streakOptions = [
    { days: 7, label: "Good" },
    { days: 14, label: "Great" },
    { days: 30, label: "Incredible" },
    { days: 50, label: "Unstoppable" },
  ];
  
  const handleGoalSelection = (days: number) => {
    setSelectedGoal(days);
  };
  
  const handleContinue = async () => {
    if (selectedGoal) {
      // Update streak goal in context
      await updateStreakGoal(selectedGoal);
      
      // Navigate to notification permission screen
      router.push("/practice/notification-permission" as any);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pick your streak goal!</Text>
        
        <View style={styles.goalsContainer}>
          {streakOptions.map((option) => (
            <TouchableOpacity 
              key={option.days}
              style={[
                styles.goalOption,
                selectedGoal === option.days && styles.selectedGoal
              ]}
              onPress={() => handleGoalSelection(option.days)}
            >
              <Text style={styles.goalOptionText}>{option.days} day streak</Text>
              <Text style={[
                styles.goalRating,
                selectedGoal === option.days && styles.selectedGoalRating
              ]}>
                {option.label}
              </Text>
              {selectedGoal === option.days && (
                <View style={styles.checkContainer}>
                  <Check size={20} color="#FF9500" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.mascotContainer}>
          <Image
            source={{
              uri: "https://cdn.jsdelivr.net/gh/duolingo/images@master/owl-happy.png"
            }}
            style={styles.mascotImage}
          />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              You'll be <Text style={styles.highlightText}>9x more</Text> likely to complete the course!
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.commitButton,
          !selectedGoal && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={!selectedGoal}
      >
        <Text style={styles.commitButtonText}>COMMIT TO MY GOAL</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  goalsContainer: {
    width: "100%",
    marginBottom: 40,
  },
  goalOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  selectedGoal: {
    backgroundColor: "#FFF5E5",
    borderColor: "#FF9500",
  },
  goalOptionText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#4B4B4B",
  },
  goalRating: {
    fontSize: 17,
    fontWeight: "500",
    color: "#909090",
  },
  selectedGoalRating: {
    color: "#FF9500",
  },
  checkContainer: {
    position: "absolute",
    right: 16,
  },
  mascotContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  mascotImage: {
    width: 100,
    height: 100,
  },
  speechBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginLeft: -20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    maxWidth: 220,
  },
  speechText: {
    fontSize: 16,
    color: "#4B4B4B",
  },
  highlightText: {
    color: "#FF9500",
    fontWeight: "bold",
  },
  commitButton: {
    backgroundColor: "#58CC02",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  commitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default StreakSetupScreen; 