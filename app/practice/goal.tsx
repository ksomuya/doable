import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronUp, ChevronDown, Zap } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import ProgressBar from "../components/ProgressBar";
import { LinearGradient } from "expo-linear-gradient";

const GoalSelectionScreen = () => {
  const router = useRouter();
  const { practiceProgress, updatePracticeStepInfo, startPracticeSession } = useAppContext();
  const [xpGoal, setXpGoal] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);

  // Update practice progress when screen loads
  useEffect(() => {
    if (practiceProgress.currentStep !== 3) {
      updatePracticeStepInfo({
        currentStep: 3 // Third step in practice flow
      });
    }
  }, []);

  const handleIncreaseXP = () => {
    setXpGoal((prev) => Math.min(prev + 50, 500));
  };

  const handleDecreaseXP = () => {
    setXpGoal((prev) => Math.max(prev - 50, 50));
  };

  const getXpDescription = () => {
    if (xpGoal <= 100) {
      return "Quick session - great for a short break!";
    } else if (xpGoal <= 250) {
      return "Balanced session - perfect daily progress";
    } else {
      return "Power session - maximize your learning!";
    }
  };

  const handleStartSession = () => {
    // Only proceed if we have subject and type from previous steps
    if (!practiceProgress.subject || !practiceProgress.type) {
      return;
    }

    // Update practice progress in context
    updatePracticeStepInfo({
      goal: xpGoal,
      currentStep: 4 // Moving to final step (questions)
    });

    // Start the practice session
    setIsLoading(true);
    
    // Store values to ensure they're not null
    const subject = practiceProgress.subject;
    const type = practiceProgress.type;
    
    setTimeout(() => {
      startPracticeSession(
        subject,
        type,
        xpGoal
      );
      setIsLoading(false);
      router.push({
        pathname: "/practice/question",
        params: {
          xp: xpGoal.toString(),
          subject: subject,
          type: type,
        },
      });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <ProgressBar
            currentStep={practiceProgress.currentStep}
            totalSteps={practiceProgress.totalSteps}
            style={styles.progressBar}
          />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Set Your Goal</Text>
        <Text style={styles.subtitle}>
          How much XP do you want to earn in this session?
        </Text>

        <View style={styles.xpSelectorContainer}>
          <TouchableOpacity
            onPress={handleIncreaseXP}
            style={styles.arrowButton}
            disabled={xpGoal >= 500}
          >
            <ChevronUp size={28} color={xpGoal >= 500 ? "#D1D5DB" : "#1F2937"} />
          </TouchableOpacity>

          <View style={styles.xpValueContainer}>
            <LinearGradient
              colors={["#EEF2FF", "#C7D2FE"]}
              style={styles.xpValueGradient}
            >
              <View style={styles.xpIconContainer}>
                <Zap size={24} color="#4F46E5" />
              </View>
              <Text style={styles.xpValue}>{xpGoal}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </LinearGradient>
            <View style={styles.xpDescriptionContainer}>
              <Text style={styles.xpDescription}>{getXpDescription()}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDecreaseXP}
            style={styles.arrowButton}
            disabled={xpGoal <= 50}
          >
            <ChevronDown size={28} color={xpGoal <= 50 ? "#D1D5DB" : "#1F2937"} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartSession}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>Start Practice</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressBar: {
    height: 4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  xpSelectorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  xpValueContainer: {
    alignItems: "center",
    width: "100%",
  },
  xpValueGradient: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: "center",
    width: "80%",
  },
  xpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  xpValue: {
    fontSize: 64,
    fontWeight: "700",
    color: "#4F46E5",
  },
  xpLabel: {
    fontSize: 20,
    color: "#4F46E5",
    fontWeight: "600",
    marginTop: 4,
  },
  xpDescriptionContainer: {
    backgroundColor: "#EEF2FF",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  xpDescription: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "500",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  startButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GoalSelectionScreen;
