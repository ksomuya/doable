import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Sparkles, Trophy } from "lucide-react-native";

interface RewardsDisplayProps {
  sreksEarned?: number;
  xpEarned?: number;
  streakDays?: number;
  showAnimation?: boolean;
}

const RewardsDisplay = ({
  sreksEarned = 25,
  xpEarned = 150,
  streakDays = 3,
  showAnimation = true,
}: RewardsDisplayProps) => {
  return (
    <View className="w-full p-4 rounded-xl bg-indigo-50">
      <Text className="text-xl font-bold text-center mb-4 text-indigo-900">
        Session Rewards
      </Text>

      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center bg-amber-100 p-3 rounded-lg flex-1 mr-2">
          <View className="bg-amber-400 p-2 rounded-full mr-2">
            <Sparkles size={20} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xs text-amber-800">Sreks Earned</Text>
            <Text className="text-lg font-bold text-amber-900">
              {sreksEarned}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center bg-blue-100 p-3 rounded-lg flex-1 ml-2">
          <View className="bg-blue-500 p-2 rounded-full mr-2">
            <Trophy size={20} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xs text-blue-800">XP Earned</Text>
            <Text className="text-lg font-bold text-blue-900">{xpEarned}</Text>
          </View>
        </View>
      </View>

      {streakDays > 0 && (
        <View className="bg-purple-100 p-3 rounded-lg">
          <Text className="text-sm text-center text-purple-800">
            🔥 {streakDays} day streak! Keep it up!
          </Text>
        </View>
      )}

      {showAnimation && (
        <View className="items-center mt-3">
          <Image
            source={{
              uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=reward",
            }}
            style={{ width: 60, height: 60 }}
            contentFit="contain"
          />
        </View>
      )}
    </View>
  );
};

export default RewardsDisplay;
