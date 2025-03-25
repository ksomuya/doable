import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock, AlertTriangle, HelpCircle } from "lucide-react-native";

interface QuestionDisplayProps {
  questionNumber?: number;
  totalQuestions?: number;
  questionText?: string;
  difficultyLevel?: "Easy" | "Medium" | "Hard";
  timeRemaining?: number;
  subject?: string;
  topic?: string;
}

const QuestionDisplay = ({
  questionNumber = 1,
  totalQuestions = 10,
  questionText = "A particle moves in a straight line with constant acceleration. If it covers distances s₁ and s₂ in the first t₁ and t₂ seconds respectively from the beginning of the motion, then its initial velocity is:",
  difficultyLevel = "Medium",
  timeRemaining = 120,
  subject = "Physics",
  topic = "Kinematics",
}: QuestionDisplayProps) => {
  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Get color based on difficulty level
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Easy":
        return "#4ade80"; // green
      case "Medium":
        return "#facc15"; // yellow
      case "Hard":
        return "#f87171"; // red
      default:
        return "#facc15";
    }
  };

  return (
    <View style={styles.container}>
      {/* Question header with metadata */}
      <View style={styles.header}>
        <View style={styles.questionCounter}>
          <Text style={styles.questionCounterText}>
            Question {questionNumber}/{totalQuestions}
          </Text>
        </View>

        <View style={styles.metadataContainer}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(difficultyLevel) },
            ]}
          >
            <Text style={styles.difficultyText}>{difficultyLevel}</Text>
          </View>

          <View style={styles.timer}>
            <Clock size={16} color="#64748b" />
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>
      </View>

      {/* Subject and topic info */}
      <View style={styles.subjectContainer}>
        <Text style={styles.subjectText}>
          {subject} • {topic}
        </Text>
      </View>

      {/* Question content */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{questionText}</Text>
      </View>

      {/* Help buttons */}
      <View style={styles.helpContainer}>
        <View style={styles.helpButton}>
          <HelpCircle size={20} color="#64748b" />
          <Text style={styles.helpText}>Hint</Text>
        </View>
        <View style={styles.helpButton}>
          <AlertTriangle size={20} color="#64748b" />
          <Text style={styles.helpText}>Report</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionCounter: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  questionCounterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  subjectContainer: {
    marginBottom: 12,
  },
  subjectText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1e293b",
    fontWeight: "400",
  },
  helpContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  helpText: {
    fontSize: 14,
    color: "#64748b",
  },
});

export default QuestionDisplay;
