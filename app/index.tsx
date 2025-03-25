import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Heart,
  Zap,
  ClipboardList,
  BarChart2,
  Settings,
  Menu,
  ArrowUpRight,
  LogOut,
} from "lucide-react-native";
import ChapterInput from "./components/ChapterInput";
import VirtualPet from "./components/VirtualPet";
import UserStats from "./components/UserStats";
import { useAppContext } from "./context/AppContext";

export default function HomeScreen() {
  const router = useRouter();
  const {
    user,
    pet,
    studiedChapters,
    updateStudiedChapters,
    feedPet,
    playWithPet,
    signOut,
  } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleProfilePress = () => {
    console.log("Navigate to profile");
  };

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  const handleStartPractice = () => {
    router.push("/practice");
  };

  const handleCardPress = (cardType: string) => {
    if (cardType === "Leader Board") {
      router.push("/leaderboard");
    } else if (cardType === "Custom Test") {
      router.push("/customtest");
    } else if (cardType === "Reports") {
      router.push("/reports");
    }
  };

  const handleChapterSave = (savedChapters: string[]) => {
    updateStudiedChapters(savedChapters);
  };

  const handleSignOut = () => {
    signOut();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600">Loading your study buddy...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <ScrollView className="flex-1">
        {/* Simple Header */}
        <View className="flex-row justify-between items-center px-5 py-4">
          <TouchableOpacity onPress={handleProfilePress}>
            <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center">
              <Image
                source={{
                  uri: user.photoUrl,
                }}
                className="w-12 h-12 rounded-full"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleMenuPress}>
            <Menu size={28} color="#000" />
          </TouchableOpacity>
        </View>

        {/* User Stats */}
        <View className="px-5 mb-3">
          <UserStats sreks={user.sreks} xp={user.xp} />
        </View>

        {/* Virtual Pet */}
        <View className="px-5 mb-3">
          <VirtualPet
            name={pet.name}
            foodLevel={pet.foodLevel}
            healthLevel={pet.healthLevel}
            mood={pet.mood}
            streakDays={user.streak}
            onFeed={feedPet}
            onPlay={playWithPet}
          />
        </View>

        {/* Chapter Input CTA */}
        <View className="px-5 mb-3">
          <Text className="text-base font-bold mb-1">
            What did you study today?
          </Text>
          <ChapterInput
            onSave={handleChapterSave}
            initialChapters={studiedChapters}
          />
        </View>

        {/* Bento Box Layout */}
        <View className="px-3 mb-3">
          {/* Side by Side Layout */}
          <View className="flex-row space-x-3">
            {/* Left Column - Two Small Boxes */}
            <View className="flex-1 space-y-3">
              {/* Leader Board Card */}
              <TouchableOpacity onPress={() => handleCardPress("Leader Board")}>
                <View className="bg-orange-100 rounded-xl p-3 h-32">
                  <View className="flex-row justify-between">
                    <Text className="text-sm font-bold">Leader Board</Text>
                    <View className="bg-white rounded-full p-1">
                      <ArrowUpRight size={12} color="#000" />
                    </View>
                  </View>
                  <View className="flex-1 items-center justify-center">
                    <BarChart2 size={28} color="#f97316" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Custom Test Card */}
              <TouchableOpacity onPress={() => handleCardPress("Custom Test")}>
                <View className="bg-purple-100 rounded-xl p-3 h-32">
                  <View className="flex-row justify-between">
                    <Text className="text-sm font-bold">Custom Test</Text>
                    <View className="bg-white rounded-full p-1">
                      <ArrowUpRight size={12} color="#000" />
                    </View>
                  </View>
                  <View className="flex-1 items-center justify-center">
                    <Settings size={28} color="#8b5cf6" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Right Column - One Large Box */}
            <View className="flex-1">
              <TouchableOpacity
                onPress={() => handleCardPress("Reports")}
                className="h-full"
              >
                <View className="bg-green-100 rounded-xl p-3 h-[267px]">
                  <View className="flex-row justify-between">
                    <Text className="text-sm font-bold">Reports</Text>
                    <View className="bg-white rounded-full p-1">
                      <ArrowUpRight size={12} color="#000" />
                    </View>
                  </View>
                  <View className="flex-1 items-center justify-center">
                    <ClipboardList size={28} color="#10b981" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Extra space at the bottom to prevent content from being hidden behind floating button */}
        <View className="h-16" />
      </ScrollView>

      {/* Floating Start Practice Button */}
      <View className="absolute bottom-4 left-0 right-0 px-5 z-10">
        <TouchableOpacity
          className="bg-black py-3 rounded-xl items-center shadow-lg"
          onPress={handleStartPractice}
        >
          <Text className="text-white text-base font-bold">
            Start Practice Session
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menu Overlay */}
      {showMenu && (
        <View className="absolute top-16 right-5 bg-white rounded-lg shadow-xl p-2 z-20">
          <TouchableOpacity
            className="flex-row items-center p-3"
            onPress={handleSignOut}
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="ml-2 text-red-500 font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
