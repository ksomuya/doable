import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Coins, Zap } from "lucide-react-native";

interface UserStatsProps {
  sreks?: number;
  xp?: number;
}

const UserStats = ({ sreks = 1250, xp = 3750 }: UserStatsProps) => {
  return (
    <View className="w-full bg-white p-4 rounded-lg shadow-sm mb-4">
      <View className="flex-row justify-between items-center">
        {/* Sreks (Virtual Coins) */}
        <View className="flex-row items-center bg-amber-50 p-3 rounded-lg flex-1 mr-2">
          <Coins size={24} color="#F59E0B" />
          <View className="ml-2">
            <Text className="text-xs text-gray-500 font-medium">Sreks</Text>
            <Text className="text-lg font-bold text-amber-500">{sreks}</Text>
          </View>
        </View>

        {/* Experience Points (XP) */}
        <View className="flex-row items-center bg-blue-50 p-3 rounded-lg flex-1 ml-2">
          <Zap size={24} color="#3B82F6" />
          <View className="ml-2">
            <Text className="text-xs text-gray-500 font-medium">XP</Text>
            <Text className="text-lg font-bold text-blue-500">{xp}</Text>
          </View>
        </View>
      </View>

      {/* Level Progress Bar */}
      <View className="mt-3">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-500">Level 5</Text>
          <Text className="text-xs text-gray-500">{xp}/5000 XP</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${Math.min(100, (xp / 5000) * 100)}%` }}
          />
        </View>
      </View>
    </View>
  );
};

export default UserStats;
