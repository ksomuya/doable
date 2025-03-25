import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Sparkles } from "lucide-react-native";

interface XPGoalSettingProps {
  onGoalSelected?: (goal: number) => void;
  availableGoals?: number[];
  defaultSelectedGoal?: number;
}

const XPGoalSetting = ({
  onGoalSelected = () => {},
  availableGoals = [50, 100, 200, 300, 500],
  defaultSelectedGoal = 100,
}: XPGoalSettingProps) => {
  const [selectedGoal, setSelectedGoal] = useState(defaultSelectedGoal);

  const handleGoalSelection = (goal: number) => {
    setSelectedGoal(goal);
    onGoalSelected(goal);
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md w-full">
      <Text className="text-xl font-bold text-center mb-4 text-purple-800">
        Set Your XP Goal
      </Text>

      <Text className="text-sm text-gray-600 mb-4 text-center">
        Choose how much XP you want to earn in this session
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10 }}
        className="mb-4"
      >
        {availableGoals.map((goal) => (
          <TouchableOpacity
            key={goal}
            onPress={() => handleGoalSelection(goal)}
            className={`mx-2 px-6 py-4 rounded-full flex-row items-center justify-center ${selectedGoal === goal ? "bg-purple-600" : "bg-gray-200"}`}
          >
            <Sparkles
              size={18}
              color={selectedGoal === goal ? "white" : "#6B7280"}
            />
            <Text
              className={`ml-2 font-semibold ${selectedGoal === goal ? "text-white" : "text-gray-700"}`}
            >
              {goal} XP
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="p-3 bg-purple-100 rounded-lg mb-4">
        <Text className="text-sm text-purple-800 text-center">
          {selectedGoal < 100
            ? "Quick session - perfect for a short break!"
            : selectedGoal < 300
              ? "Balanced session - great for daily progress!"
              : "Power session - maximize your learning today!"}
        </Text>
      </View>

      <TouchableOpacity
        className="bg-purple-600 py-3 px-6 rounded-lg items-center"
        onPress={() => onGoalSelected(selectedGoal)}
      >
        <Text className="text-white font-bold text-lg">Confirm Goal</Text>
      </TouchableOpacity>
    </View>
  );
};

export default XPGoalSetting;
