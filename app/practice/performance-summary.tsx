import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronRight, Clock, Award, Target, CheckCircle, XCircle, Timer } from "lucide-react-native";

const PerformanceSummaryScreen = () => {
  const router = useRouter();
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
    router.push("/practice/final-choice" as any);
  };
  
  return (
    <SafeAreaView style={styles.container}>
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
                <CheckCircle size={20} color="#10B981" style={styles.statIcon} />
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={styles.statValue}>{correct}</Text>
              </View>
              
              <View style={styles.statItem}>
                <XCircle size={20} color="#EF4444" style={styles.statIcon} />
                <Text style={styles.statLabel}>Incorrect</Text>
                <Text style={styles.statValue}>{incorrect}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Timer size={20} color="#6366F1" style={styles.statIcon} />
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
              <Target size={20} color="#4F46E5" />
            </View>
            <View style={styles.questionSummaryContent}>
              <Text style={styles.questionSummaryTitle}>Total Questions</Text>
              <Text style={styles.questionSummaryValue}>{totalQuestions}</Text>
            </View>
          </View>
          
          <View style={styles.questionSummaryItem}>
            <View style={styles.questionSummaryIconContainer}>
              <Clock size={20} color="#4F46E5" />
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
                hasBadge !== "true" && { color: "#9CA3AF" }
              ]}>
                {hasBadge === "true" ? "1" : "0"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
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
    marginRight: 16,
  },
  accuracyText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4F46E5",
  },
  accuracyLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  statsColumn: {
    flex: 1,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statIcon: {
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  questionSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  questionSummaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questionSummaryContent: {
    flex: 1,
  },
  questionSummaryTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  questionSummaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
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
    marginBottom: 8,
  },
  rewardIconText: {
    fontSize: 24,
  },
  rewardLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default PerformanceSummaryScreen; 