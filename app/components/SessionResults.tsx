import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Clock, Award, Zap } from "lucide-react-native";

interface SessionResultsProps {
  accuracy?: number;
  timeSpent?: number;
  xpEarned?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  streakMaintained?: number;
}

const SessionResults = ({
  accuracy = 75,
  timeSpent = 15,
  xpEarned = 120,
  questionsAnswered = 20,
  correctAnswers = 15,
  streakMaintained = 3,
}: SessionResultsProps) => {
  return (
    <View className="bg-white p-6 rounded-xl shadow-md w-full">
      <Text className="text-2xl font-bold text-center mb-6 text-indigo-700">
        Session Summary
      </Text>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2 text-gray-800">
          Performance Stats
        </Text>

        <View className="flex-row items-center justify-between mb-4 bg-indigo-50 p-3 rounded-lg">
          <View className="flex-row items-center">
            <Check size={24} color="#4F46E5" />
            <Text className="ml-2 text-gray-700">Accuracy</Text>
          </View>
          <Text className="font-bold text-indigo-700">{accuracy}%</Text>
        </View>

        <View className="flex-row items-center justify-between mb-4 bg-indigo-50 p-3 rounded-lg">
          <View className="flex-row items-center">
            <Clock size={24} color="#4F46E5" />
            <Text className="ml-2 text-gray-700">Time Spent</Text>
          </View>
          <Text className="font-bold text-indigo-700">{timeSpent} mins</Text>
        </View>

        <View className="flex-row items-center justify-between mb-4 bg-indigo-50 p-3 rounded-lg">
          <View className="flex-row items-center">
            <Zap size={24} color="#4F46E5" />
            <Text className="ml-2 text-gray-700">XP Earned</Text>
          </View>
          <Text className="font-bold text-indigo-700">+{xpEarned} XP</Text>
        </View>
      </View>

      <View className="bg-indigo-100 p-4 rounded-lg mb-6">
        <Text className="text-lg font-semibold mb-2 text-gray-800">
          Session Details
        </Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-700">Questions Answered:</Text>
          <Text className="font-medium text-indigo-700">
            {questionsAnswered}
          </Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-700">Correct Answers:</Text>
          <Text className="font-medium text-indigo-700">{correctAnswers}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-700">Streak Maintained:</Text>
          <Text className="font-medium text-indigo-700">
            {streakMaintained} days
          </Text>
        </View>
      </View>

      <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <View className="flex-row items-center mb-2">
          <Award size={24} color="#EAB308" />
          <Text className="ml-2 text-lg font-semibold text-yellow-700">
            Achievement Unlocked!
          </Text>
        </View>
        <Text className="text-yellow-700">
          {xpEarned > 100
            ? "Excellent work! You've earned the 'Study Champion' badge for this session."
            : "Good progress! Keep studying to unlock more achievements."}
        </Text>
      </View>
    </View>
  );
};

export default SessionResults;
