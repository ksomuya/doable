import React from "react";
import { View, Text, Image } from "react-native";
import { Heart, Utensils, TrendingUp, Award } from "lucide-react-native";

interface PetStatusUpdateProps {
  petName?: string;
  healthIncrease?: number;
  foodIncrease?: number;
  xpEarned?: number;
  newLevel?: boolean;
  levelNumber?: number;
}

const PetStatusUpdate = ({
  petName = "Buddy",
  healthIncrease = 15,
  foodIncrease = 20,
  xpEarned = 150,
  newLevel = true,
  levelNumber = 3,
}: PetStatusUpdateProps) => {
  return (
    <View className="w-full bg-white p-4 rounded-xl shadow-md">
      {/* Pet Image and Status Title */}
      <View className="items-center mb-4">
        <Image
          source={require("../../assets/images/penguine.svg")}
          className="w-24 h-24 rounded-full bg-gray-100"
        />
        <Text className="text-xl font-bold mt-2 text-center text-purple-800">
          {petName} is growing stronger!
        </Text>
      </View>

      {/* Status Updates */}
      <View className="space-y-3">
        {/* Health Update */}
        <View className="flex-row items-center bg-green-50 p-3 rounded-lg">
          <Heart size={24} color="#16a34a" />
          <Text className="ml-3 text-green-800 font-medium">
            Health increased by {healthIncrease}%
          </Text>
        </View>

        {/* Food Update */}
        <View className="flex-row items-center bg-amber-50 p-3 rounded-lg">
          <Utensils size={24} color="#d97706" />
          <Text className="ml-3 text-amber-800 font-medium">
            Food level increased by {foodIncrease}%
          </Text>
        </View>

        {/* XP Update */}
        <View className="flex-row items-center bg-blue-50 p-3 rounded-lg">
          <TrendingUp size={24} color="#2563eb" />
          <Text className="ml-3 text-blue-800 font-medium">
            {petName} gained {xpEarned} XP from your session
          </Text>
        </View>

        {/* Level Up (Conditional) */}
        {newLevel && (
          <View className="flex-row items-center bg-purple-50 p-3 rounded-lg">
            <Award size={24} color="#7c3aed" />
            <Text className="ml-3 text-purple-800 font-medium">
              Congratulations! {petName} reached Level {levelNumber}!
            </Text>
          </View>
        )}
      </View>

      {/* Motivational Message */}
      <Text className="text-center mt-4 text-gray-600 italic">
        Keep studying to help {petName} grow even stronger!
      </Text>
    </View>
  );
};

export default PetStatusUpdate;
