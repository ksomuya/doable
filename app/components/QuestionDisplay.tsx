import React from "react";
import { View, Text } from "react-native";
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

  const difficultyColor = getDifficultyColor(difficultyLevel);
  const difficultyBgColor = difficultyLevel === "Easy" ? "bg-green-100" : difficultyLevel === "Medium" ? "bg-yellow-100" : "bg-red-100";

  return (
    <View className="bg-white p-5 rounded-lg shadow-sm w-full">
      {/* Question header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-500 font-medium">
            Question {questionNumber}/{totalQuestions}
          </Text>
          <View
            className={`px-2 py-1 rounded-full ${difficultyColor} ${difficultyBgColor}`}
          >
            <Text
              className={`text-xs font-medium ${difficultyColor}`}
            >
              {difficultyLevel}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Clock size={16} color="#6B7280" />
          <Text className="text-gray-500 font-medium ml-1">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60)
              .toString()
              .padStart(2, "0")}
          </Text>
        </View>
      </View>

      {/* Question text */}
      <View className="mb-6 mt-6">
        <Text className="text-lg font-medium text-gray-800 leading-relaxed mb-6">
          {questionText}
        </Text>
      </View>

      {/* Subject and topic */}
      <View className="mb-3">
        <Text className="text-sm text-gray-500 font-medium">
          {subject} • {topic}
        </Text>
      </View>

      {/* Help buttons */}
      <View className="flex-row justify-end gap-4">
        <View className="flex-row items-center gap-1">
          <HelpCircle size={20} color="#64748b" />
          <Text className="text-sm text-gray-500">Hint</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <AlertTriangle size={20} color="#64748b" />
          <Text className="text-sm text-gray-500">Report</Text>
        </View>
      </View>
    </View>
  );
};

export default QuestionDisplay;
