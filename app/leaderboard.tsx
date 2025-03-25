import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react-native";
import { useAppContext } from "./context/AppContext";

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAppContext();

  const leaderboardData = [
    {
      id: 1,
      name: "Aarav Singh",
      xp: 12500,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
    },
    {
      id: 2,
      name: "Priya Sharma",
      xp: 11200,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    },
    {
      id: 3,
      name: "Rahul Patel",
      xp: 10800,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    },
    { id: 4, name: user.name, xp: user.xp, avatar: user.photoUrl },
    {
      id: 5,
      name: "Ananya Gupta",
      xp: 9500,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    },
    {
      id: 6,
      name: "Vikram Reddy",
      xp: 8900,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    },
    {
      id: 7,
      name: "Neha Kapoor",
      xp: 8200,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    },
    {
      id: 8,
      name: "Arjun Mehta",
      xp: 7800,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    },
    {
      id: 9,
      name: "Kavya Iyer",
      xp: 7200,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya",
    },
    {
      id: 10,
      name: "Rohan Joshi",
      xp: 6900,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
    },
  ];

  // Sort leaderboard by XP
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => b.xp - a.xp);

  const handleBackPress = () => {
    router.back();
  };

  const getLeaderboardIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy size={24} color="#FFD700" />;
      case 1:
        return <Medal size={24} color="#C0C0C0" />;
      case 2:
        return <Award size={24} color="#CD7F32" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="mr-4">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Leaderboard</Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <Text className="text-base font-medium text-gray-500 mb-4">
            Top performers this week
          </Text>

          {sortedLeaderboard.map((item, index) => (
            <View
              key={item.id}
              className={`flex-row items-center py-3 px-4 mb-3 rounded-xl ${index < 3 ? "bg-yellow-50" : "bg-gray-50"}`}
            >
              <Text className="font-bold text-lg w-8">{index + 1}</Text>
              <Image
                source={{ uri: item.avatar }}
                className="w-10 h-10 rounded-full"
              />
              <View className="flex-1 ml-3">
                <Text className="font-medium">{item.name}</Text>
                <Text className="text-gray-500">
                  {item.xp.toLocaleString()} XP
                </Text>
              </View>
              {getLeaderboardIcon(index)}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
