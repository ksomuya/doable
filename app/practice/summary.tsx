import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Home, ArrowLeft, RotateCcw } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { Image } from "expo-image";
import SessionResults from "../components/SessionResults";
import PetStatusUpdate from "../components/PetStatusUpdate";
import RewardsDisplay from "../components/RewardsDisplay";

const SummaryScreen = () => {
  const router = useRouter();
  const { questionsAnswered, correctAnswers, xpEarned, goalXP } =
    useLocalSearchParams();
  const { user, pet, completePracticeSession } = useAppContext();

  // Calculate stats
  const accuracy =
    parseInt(questionsAnswered as string) > 0
      ? Math.round(
          (parseInt(correctAnswers as string) /
            parseInt(questionsAnswered as string)) *
            100,
        )
      : 0;

  const timeSpent = 15; // Placeholder
  const streakMaintained = user?.streak || 3;
  const petName = pet?.name || "Dodo";
  const healthIncrease = 20; // Placeholder
  const foodIncrease = 25; // Placeholder
  const newLevel = false; // Placeholder
  const levelNumber = user?.level || 1;
  const snowballsEarned = Math.floor(parseInt(xpEarned as string) * 0.2); // 20% of XP as snowballs

  // Complete the practice session when the summary screen loads
  useEffect(() => {
    completePracticeSession?.();
  }, []);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handlePracticeContinue = () => {
    // Direct users to the final choice screen
    router.push("/practice/final-choice" as any);
  };

  // Get personalized recommendations based on performance
  const getRecommendations = () => {
    if (accuracy < 60) {
      return [
        "📚 Review the fundamentals of this subject before continuing",
        "🔍 Try easier questions to build confidence",
      ];
    } else if (accuracy < 80) {
      return [
        "📝 Focus on the topics where you made mistakes",
        "🔄 Try a mixed practice session to reinforce learning",
      ];
    } else {
      return [
        "🚀 You're doing great! Try a more challenging subject",
        "🏆 Challenge yourself with advanced questions",
      ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.confettiContainer}>
        <Image
          source={{
            uri: "https://api.dicebear.com/7.x/bottts/svg?seed=penguin&backgroundColor=orange",
          }}
          style={styles.characterImage}
          contentFit="contain"
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice Complete!</Text>
        <Text style={styles.headerSubtitle}>
          Great job on your study session
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionsContainer}>
          {/* Session Results Component */}
          <View style={styles.resultsCard}>
            <Text style={styles.sectionTitle}>Session Results</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{xpEarned}</Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{questionsAnswered}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{correctAnswers}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
            </View>
          </View>

          {/* Rewards Section */}
          <View style={styles.rewardsCard}>
            <Text style={styles.sectionTitle}>Rewards</Text>

            <View style={styles.rewardsRow}>
              <View style={styles.rewardItem}>
                <View
                  style={[styles.rewardIcon, { backgroundColor: "#EEF2FF" }]}
                >
                  <Text style={styles.rewardIconText}>🏆</Text>
                </View>
                <Text style={styles.rewardValue}>{xpEarned} XP</Text>
                <Text style={styles.rewardLabel}>Experience</Text>
              </View>

              <View style={styles.rewardItem}>
                <View
                  style={[styles.rewardIcon, { backgroundColor: "#FEF3C7" }]}
                >
                  <Text style={styles.rewardIconText}>🔥</Text>
                </View>
                <Text style={styles.rewardValue}>{streakMaintained} days</Text>
                <Text style={styles.rewardLabel}>Streak</Text>
              </View>

              <View style={styles.rewardItem}>
                <View
                  style={[styles.rewardIcon, { backgroundColor: "#ECFDF5" }]}
                >
                  <Text style={styles.rewardIconText}>❄️</Text>
                </View>
                <Text style={styles.rewardValue}>{snowballsEarned}</Text>
                <Text style={styles.rewardLabel}>Snowballs</Text>
              </View>
            </View>
          </View>

          {/* Pet Status Update */}
          <View style={styles.petCard}>
            <Text style={styles.sectionTitle}>Pet Status</Text>
            <View style={styles.petStatusContainer}>
              <View style={styles.petImageContainer}>
                <Image
                  source={{
                    uri: "https://api.dicebear.com/7.x/bottts/svg?seed=penguin",
                  }}
                  style={styles.petImage}
                  contentFit="contain"
                />
              </View>
              <View style={styles.petStatusInfo}>
                <Text style={styles.petName}>{petName}</Text>
                <Text style={styles.petStatusText}>
                  Your pet is happy with your progress!
                </Text>
                <View style={styles.petStatsRow}>
                  <View style={styles.petStatItem}>
                    <Text style={styles.petStatLabel}>Health</Text>
                    <Text style={styles.petStatValue}>+{healthIncrease}%</Text>
                  </View>
                  <View style={styles.petStatItem}>
                    <Text style={styles.petStatLabel}>Food</Text>
                    <Text style={styles.petStatValue}>+{foodIncrease}%</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationsCard}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationsList}>
              {recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.recommendationItem}>
                  {recommendation}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleGoHome}
        >
          <Home size={20} color="#4F46E5" />
          <Text style={styles.secondaryButtonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handlePracticeContinue}
        >
          <RotateCcw size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Practice Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  confettiContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  characterImage: {
    width: 100,
    height: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
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
  },
  sectionsContainer: {
    padding: 16,
    gap: 16,
  },
  resultsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  rewardsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rewardItem: {
    alignItems: "center",
    width: "30%",
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  rewardIconText: {
    fontSize: 20,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  petCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  petStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  petImageContainer: {
    marginRight: 16,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
  },
  petStatusInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  petStatusText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  petStatsRow: {
    flexDirection: "row",
    gap: 16,
  },
  petStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  petStatLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  petStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  recommendationsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    fontSize: 14,
    color: "#4B5563",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
  },
  secondaryButton: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#4F46E5",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default SummaryScreen;
