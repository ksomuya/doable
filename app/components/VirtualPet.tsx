import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Image } from "expo-image";
import { Heart, Utensils, Award } from "lucide-react-native";

interface VirtualPetProps {
  name?: string;
  foodLevel?: number;
  healthLevel?: number;
  mood?: "happy" | "neutral" | "sad";
  streakDays?: number;
  onFeed?: () => void;
  onPlay?: () => void;
}

const VirtualPet = ({
  name = "Buddy",
  foodLevel = 70,
  healthLevel = 85,
  mood = "happy",
  streakDays = 3,
  onFeed = () => {},
  onPlay = () => {},
}: VirtualPetProps) => {
  const [bounce] = useState(new Animated.Value(0));

  // Pet animation effect
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    if (mood === "happy") {
      animation.start();
    } else {
      animation.stop();
      bounce.setValue(0);
    }

    return () => animation.stop();
  }, [mood]);

  // Get pet image based on mood
  const getPetImage = () => {
    switch (mood) {
      case "happy":
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=happy-pet&mouth=smile&eyes=happy";
      case "neutral":
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral-pet&mouth=serious&eyes=default";
      case "sad":
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=sad-pet&mouth=sad&eyes=eyeRoll";
      default:
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=happy-pet&mouth=smile&eyes=happy";
    }
  };

  // Get status message based on food and health levels
  const getStatusMessage = () => {
    if (foodLevel < 30) return "I'm hungry!";
    if (healthLevel < 30) return "I need attention!";
    if (foodLevel >= 80 && healthLevel >= 80) return "I feel great!";
    return "I'm doing okay!";
  };

  // Get color for progress bars
  const getFoodColor = () => {
    if (foodLevel < 30) return "bg-red-500";
    if (foodLevel < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getHealthColor = () => {
    if (healthLevel < 30) return "bg-red-500";
    if (healthLevel < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <View className="w-full bg-white p-4 rounded-xl shadow-md">
      {/* Pet name and streak */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xl font-bold text-gray-800">{name}</Text>
        <View className="flex-row items-center">
          <Award size={18} color="#f59e0b" />
          <Text className="ml-1 text-amber-600 font-medium">
            {streakDays} day streak
          </Text>
        </View>
      </View>

      {/* Pet display area */}
      <View className="items-center justify-center py-2">
        <Animated.View style={{ transform: [{ translateY: bounce }] }}>
          <Image
            source={{ uri: getPetImage() }}
            style={{ width: 150, height: 150 }}
            contentFit="contain"
          />
        </Animated.View>
        <Text className="text-center mt-2 text-gray-600 italic">
          "{getStatusMessage()}"
        </Text>
      </View>

      {/* Status bars */}
      <View className="mt-4">
        {/* Food level */}
        <View className="mb-3">
          <View className="flex-row items-center mb-1">
            <Utensils size={16} color="#4b5563" />
            <Text className="ml-2 text-gray-700">Food</Text>
            <Text className="ml-auto text-gray-600">{foodLevel}%</Text>
          </View>
          <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <View
              className={`h-full ${getFoodColor()}`}
              style={{ width: `${foodLevel}%` }}
            />
          </View>
        </View>

        {/* Health level */}
        <View>
          <View className="flex-row items-center mb-1">
            <Heart size={16} color="#4b5563" />
            <Text className="ml-2 text-gray-700">Health</Text>
            <Text className="ml-auto text-gray-600">{healthLevel}%</Text>
          </View>
          <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <View
              className={`h-full ${getHealthColor()}`}
              style={{ width: `${healthLevel}%` }}
            />
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-around mt-4">
        <TouchableOpacity
          className="bg-amber-500 py-2 px-6 rounded-full flex-row items-center"
          onPress={onFeed}
        >
          <Utensils size={16} color="#ffffff" />
          <Text className="ml-2 text-white font-medium">Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-indigo-500 py-2 px-6 rounded-full flex-row items-center"
          onPress={onPlay}
        >
          <Award size={16} color="#ffffff" />
          <Text className="ml-2 text-white font-medium">Play</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VirtualPet;
