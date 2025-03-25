import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";

interface LeaderboardProps {
  rank?: number;
  totalUsers?: number;
  topUsers?: Array<{
    id: string;
    name: string;
    avatar: string;
    rank: number;
    xp: number;
  }>;
  onViewFullLeaderboard?: () => void;
}

const Leaderboard = ({
  rank = 1234,
  totalUsers = 50000,
  topUsers = [
    {
      id: "1",
      name: "Rahul S.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
      rank: 1,
      xp: 12500,
    },
    {
      id: "2",
      name: "Priya M.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
      rank: 2,
      xp: 12350,
    },
    {
      id: "3",
      name: "Arjun K.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
      rank: 3,
      xp: 12100,
    },
  ],
  onViewFullLeaderboard = () => {},
}: LeaderboardProps) => {
  return (
    <View className="w-full bg-white rounded-xl p-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-800">Leaderboard</Text>
        <TouchableOpacity
          onPress={onViewFullLeaderboard}
          className="flex-row items-center"
        >
          <Text className="text-sm text-blue-500 mr-1">View All</Text>
          <ChevronRight size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* User's rank */}
      <View className="bg-blue-50 p-3 rounded-lg mb-3">
        <Text className="text-sm text-gray-600 mb-1">
          Your All India Rank (AIR)
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-blue-700">{rank}</Text>
            <Text className="text-sm text-gray-500 ml-2">
              out of {totalUsers}
            </Text>
          </View>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-xs text-blue-700">
              Top {Math.round((rank / totalUsers) * 100)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Top performers */}
      <View>
        {topUsers.map((user, index) => (
          <View
            key={user.id}
            className="flex-row items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <View className="w-8 h-8 justify-center items-center mr-2">
              <Text
                className={`font-bold ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-700" : "text-gray-700"}`}
              >
                {user.rank}
              </Text>
            </View>
            <Image
              source={{ uri: user.avatar }}
              className="w-8 h-8 rounded-full bg-gray-200"
            />
            <Text className="flex-1 ml-3 font-medium text-gray-800">
              {user.name}
            </Text>
            <Text className="text-sm font-semibold text-blue-600">
              {user.xp.toLocaleString()} XP
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Leaderboard;
