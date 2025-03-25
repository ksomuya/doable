import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Home, ArrowLeft } from "lucide-react-native";
import SessionResults from "../components/SessionResults";
import PetStatusUpdate from "../components/PetStatusUpdate";
import RewardsDisplay from "../components/RewardsDisplay";

interface SummaryScreenProps {
  accuracy?: number;
  timeSpent?: number;
  xpEarned?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  streakMaintained?: number;
  petName?: string;
  healthIncrease?: number;
  foodIncrease?: number;
  newLevel?: boolean;
  levelNumber?: number;
  sreksEarned?: number;
  showAnimation?: boolean;
}

const SummaryScreen = ({
  accuracy = 85,
  timeSpent = 18,
  xpEarned = 180,
  questionsAnswered = 25,
  correctAnswers = 21,
  streakMaintained = 4,
  petName = "Buddy",
  healthIncrease = 20,
  foodIncrease = 25,
  newLevel = true,
  levelNumber = 4,
  sreksEarned = 35,
  showAnimation = true,
}: SummaryScreenProps) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-600 pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-white text-center">
          Practice Complete!
        </Text>
        <Text className="text-white text-center opacity-80">
          Great job on your study session
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="space-y-6">
          {/* Session Results Component */}
          <SessionResults
            accuracy={accuracy}
            timeSpent={timeSpent}
            xpEarned={xpEarned}
            questionsAnswered={questionsAnswered}
            correctAnswers={correctAnswers}
            streakMaintained={streakMaintained}
          />

          {/* Pet Status Update Component */}
          <PetStatusUpdate
            petName={petName}
            healthIncrease={healthIncrease}
            foodIncrease={foodIncrease}
            xpEarned={xpEarned}
            newLevel={newLevel}
            levelNumber={levelNumber}
          />

          {/* Rewards Display Component */}
          <RewardsDisplay
            sreksEarned={sreksEarned}
            xpEarned={xpEarned}
            streakDays={streakMaintained}
            showAnimation={showAnimation}
          />

          {/* Recommendations Section */}
          <View className="bg-white p-4 rounded-xl shadow-md">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              What's Next?
            </Text>
            <View className="bg-blue-50 p-3 rounded-lg mb-3">
              <Text className="text-blue-800 font-medium">
                📚 Review your weak areas in Physics - Kinematics
              </Text>
            </View>
            <View className="bg-green-50 p-3 rounded-lg">
              <Text className="text-green-800 font-medium">
                🎯 Try a Conquer session for Chemistry tomorrow
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-8 mb-6">
          <TouchableOpacity
            onPress={handleGoBack}
            className="flex-row items-center justify-center bg-gray-200 px-6 py-3 rounded-full"
          >
            <ArrowLeft size={20} color="#4B5563" />
            <Text className="ml-2 font-medium text-gray-700">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoHome}
            className="flex-row items-center justify-center bg-indigo-600 px-6 py-3 rounded-full"
          >
            <Home size={20} color="#FFFFFF" />
            <Text className="ml-2 font-medium text-white">Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SummaryScreen;
