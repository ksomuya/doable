import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  ViewStyle,
  ImageStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Check } from "lucide-react-native";
import { Image } from "expo-image";
import { useAppContext } from "../context/AppContext";
import { spacing, typography, colors, buttonStyles, layoutStyles } from "../styles/designSystem";

interface CustomStyles {
  title: TextStyle;
  goalsContainer: ViewStyle;
  goalOption: ViewStyle;
  selectedGoal: ViewStyle;
  goalOptionText: TextStyle;
  goalRating: TextStyle;
  selectedGoalRating: TextStyle;
  checkContainer: ViewStyle;
  mascotContainer: ViewStyle;
  mascotImage: ImageStyle;
  speechBubble: ViewStyle;
  speechText: TextStyle;
  highlightText: TextStyle;
}

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
    <SafeAreaView style={layoutStyles.safeArea}>
      <View style={layoutStyles.content}>
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
                  <Check size={20} color={colors.accent} />
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
      
      <View style={layoutStyles.footer}>
        <TouchableOpacity 
          style={[
            buttonStyles.primary,
            !selectedGoal && buttonStyles.disabled
          ]}
          onPress={handleContinue}
          disabled={!selectedGoal}
        >
          <Text style={buttonStyles.text}>COMMIT TO MY GOAL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<CustomStyles>({
  title: {
    fontSize: typography.largeTitle.fontSize,
    fontWeight: typography.largeTitle.fontWeight,
    color: typography.largeTitle.color,
    textAlign: "center",
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  goalsContainer: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  goalOption: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedGoal: {
    backgroundColor: "#FFF5E5",
    borderColor: colors.accent,
  },
  goalOptionText: {
    fontSize: typography.body.fontSize,
    fontWeight: "500",
    color: typography.body.color,
  },
  goalRating: {
    fontSize: typography.body.fontSize,
    fontWeight: "500",
    color: colors.textLight,
  },
  selectedGoalRating: {
    color: colors.accent,
  },
  checkContainer: {
    position: "absolute",
    right: spacing.md,
  },
  mascotContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  mascotImage: {
    width: 100,
    height: 100,
  },
  speechBubble: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    marginLeft: -spacing.lg - 4,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 220,
  },
  speechText: {
    fontSize: typography.body.fontSize,
    color: typography.body.color,
  },
  highlightText: {
    color: colors.accent,
    fontWeight: "bold",
  },
});

export default StreakSetupScreen; 