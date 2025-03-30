import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronRight, Clock, Award, Target, CheckCircle, XCircle, Timer } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { spacing, typography, colors, buttonStyles, layoutStyles, cardStyles, getShadow } from "../styles/designSystem";

interface CustomStyles {
  header: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  content: ViewStyle;
  card: ViewStyle;
  cardTitle: TextStyle;
  performanceContainer: ViewStyle;
  accuracyCircle: ViewStyle;
  accuracyText: TextStyle;
  accuracyLabel: TextStyle;
  statsColumn: ViewStyle;
  statItem: ViewStyle;
  statIcon: ViewStyle;
  statLabel: TextStyle;
  statValue: TextStyle;
  questionSummaryItem: ViewStyle;
  questionSummaryIconContainer: ViewStyle;
  questionSummaryContent: ViewStyle;
  questionSummaryTitle: TextStyle;
  questionSummaryValue: TextStyle;
  rewardsGrid: ViewStyle;
  rewardItem: ViewStyle;
  rewardIcon: ViewStyle;
  rewardIconText: TextStyle;
  rewardLabel: TextStyle;
  rewardValue: TextStyle;
  continueButton: ViewStyle;
  continueButtonText: TextStyle;
}

const PerformanceSummaryScreen = () => {
  const router = useRouter();
  const { isFirstPracticeSession } = useAppContext();
  const { 
    questionsAnswered, 
    correctAnswers, 
    xpEarned, 
    goalXP,
    coinsEarned,
    hasBadge,
  } = useLocalSearchParams();
  
  // Calculate stats
  const totalQuestions = parseInt(questionsAnswered as string) || 0;
  const correct = parseInt(correctAnswers as string) || 0;
  const incorrect = totalQuestions - correct;
  const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  
  // Time calculation (for demo purposes, we'll use a placeholder)
  const timeSpentMinutes = Math.floor(totalQuestions * 1.5); // Assume avg 1.5 min per question
  const timeTaken = `${timeSpentMinutes} minutes`;
  
  const handleContinue = () => {
    if (isFirstPracticeSession()) {
      // First time users go to streak setup
      router.push("/practice/streak-setup" as any);
    } else {
      // Returning users go to final choice
      router.push("/practice/final-choice" as any);
    }
  };
  
  return (
    <SafeAreaView style={layoutStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Summary</Text>
        <Text style={styles.headerSubtitle}>
          Here's how you performed
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Performance Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance</Text>
          
          <View style={styles.performanceContainer}>
            <View style={styles.accuracyCircle}>
              <Text style={styles.accuracyText}>{accuracy}%</Text>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
            </View>
            
            <View style={styles.statsColumn}>
              <View style={styles.statItem}>
                <CheckCircle size={20} color={colors.success} style={styles.statIcon} />
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={styles.statValue}>{correct}</Text>
              </View>
              
              <View style={styles.statItem}>
                <XCircle size={20} color={colors.error} style={styles.statIcon} />
                <Text style={styles.statLabel}>Incorrect</Text>
                <Text style={styles.statValue}>{incorrect}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Timer size={20} color={colors.info} style={styles.statIcon} />
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>{timeTaken}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Questions Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Questions Summary</Text>
          
          <View style={styles.questionSummaryItem}>
            <View style={styles.questionSummaryIconContainer}>
              <Target size={20} color={colors.secondary} />
            </View>
            <View style={styles.questionSummaryContent}>
              <Text style={styles.questionSummaryTitle}>Total Questions</Text>
              <Text style={styles.questionSummaryValue}>{totalQuestions}</Text>
            </View>
          </View>
          
          <View style={styles.questionSummaryItem}>
            <View style={styles.questionSummaryIconContainer}>
              <Clock size={20} color={colors.secondary} />
            </View>
            <View style={styles.questionSummaryContent}>
              <Text style={styles.questionSummaryTitle}>Average Time per Question</Text>
              <Text style={styles.questionSummaryValue}>
                {totalQuestions > 0 ? `${Math.round(timeSpentMinutes * 60 / totalQuestions)} seconds` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Rewards Earned */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rewards Earned</Text>
          
          <View style={styles.rewardsGrid}>
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: "#EEF2FF" }]}>
                <Text style={styles.rewardIconText}>🏆</Text>
              </View>
              <Text style={styles.rewardLabel}>XP</Text>
              <Text style={styles.rewardValue}>{xpEarned}</Text>
            </View>
            
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: "#FEF3C7" }]}>
                <Text style={styles.rewardIconText}>💰</Text>
              </View>
              <Text style={styles.rewardLabel}>Coins</Text>
              <Text style={styles.rewardValue}>{coinsEarned}</Text>
            </View>
            
            <View style={styles.rewardItem}>
              <View style={[
                styles.rewardIcon, 
                { backgroundColor: hasBadge === "true" ? "#ECFDF5" : "#F3F4F6" }
              ]}>
                <Text style={styles.rewardIconText}>
                  {hasBadge === "true" ? "🏅" : "🔒"}
                </Text>
              </View>
              <Text style={styles.rewardLabel}>Badge</Text>
              <Text style={[
                styles.rewardValue,
                hasBadge !== "true" && { color: colors.textLight }
              ]}>
                {hasBadge === "true" ? "1" : "0"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity style={[buttonStyles.secondary, { margin: spacing.md }]} onPress={handleContinue}>
        <Text style={buttonStyles.text}>Continue</Text>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<CustomStyles>({
  header: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...getShadow(1),
  },
  cardTitle: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  performanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  accuracyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  accuracyText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.secondary,
  },
  accuracyLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textLight,
  },
  statsColumn: {
    flex: 1,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statIcon: {
    marginRight: spacing.sm,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textLight,
    flex: 1,
  },
  statValue: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: colors.textDark,
  },
  questionSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  questionSummaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  questionSummaryContent: {
    flex: 1,
  },
  questionSummaryTitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  questionSummaryValue: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: colors.textDark,
  },
  rewardsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rewardItem: {
    alignItems: "center",
    width: "30%",
  },
  rewardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  rewardIconText: {
    fontSize: 24,
  },
  rewardLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    padding: spacing.md,
    borderRadius: 12,
    margin: spacing.md,
  },
  continueButtonText: {
    color: "white",
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    marginRight: spacing.sm,
  },
});

export default PerformanceSummaryScreen; 