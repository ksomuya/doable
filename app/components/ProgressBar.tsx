import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
  currentXP?: number;
  goalXP?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

const ProgressBar = ({
  currentXP = 75,
  goalXP = 200,
  color = "#4F46E5",
  height = 12,
  showLabel = true,
}: ProgressBarProps) => {
  // Calculate the progress percentage (capped at 100%)
  const progressPercentage = Math.min(
    Math.round((currentXP / goalXP) * 100),
    100,
  );

  return (
    <View className="w-full bg-gray-100 rounded-full p-1">
      {/* Progress bar container */}
      <View className="relative w-full">
        {/* Progress bar fill */}
        <View
          className="rounded-full"
          style={{
            backgroundColor: color,
            height: height,
            width: `${progressPercentage}%`,
          }}
        />

        {/* XP Label */}
        {showLabel && (
          <View className="absolute top-0 right-2 -mt-6">
            <Text className="text-sm font-medium text-gray-700">
              {currentXP} / {goalXP} XP
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProgressBar;
