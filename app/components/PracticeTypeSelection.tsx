import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Brain, Repeat, Zap } from "lucide-react-native";

type PracticeType = "refine" | "recall" | "conquer";

interface Props {
  onSelect: (type: PracticeType) => void;
}

export default function PracticeTypeSelection({ onSelect }: Props) {
  const options = [
    {
      type: "refine" as PracticeType,
      icon: <Brain size={24} color="white" />,
      title: "Refine",
      description: "Focus on weak areas",
      colors: {
        bg: "bg-blue-100",
        icon: "bg-blue-500",
        border: "border-blue-300",
      },
    },
    {
      type: "recall" as PracticeType,
      icon: <Repeat size={24} color="white" />,
      title: "Recall",
      description: "Practice all topics",
      colors: {
        bg: "bg-green-100",
        icon: "bg-green-500",
        border: "border-green-300",
      },
    },
    {
      type: "conquer" as PracticeType,
      icon: <Zap size={24} color="white" />,
      title: "Conquer",
      description: "Challenge yourself",
      colors: {
        bg: "bg-purple-100",
        icon: "bg-purple-500",
        border: "border-purple-300",
      },
    },
  ];

  return (
    <View className="p-4 bg-white rounded-lg shadow-sm">
      <Text className="text-xl font-bold text-gray-800 mb-6">
        Choose Your Practice Mode
      </Text>

      {options.map((option) => (
        <TouchableOpacity
          key={option.type}
          className={`flex-row items-center p-4 rounded-xl mb-4 ${option.colors.bg} border ${option.colors.border}`}
          onPress={() => onSelect(option.type)}
        >
          <View className={`p-3 rounded-full mr-4 ${option.colors.icon}`}>
            {option.icon}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {option.title}
            </Text>
            <Text className="text-sm text-gray-600">{option.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
