import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";

interface FloatingActionButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  iconColor?: string;
}

const FloatingActionButton = ({
  onPress,
  color = "#6366F1", // Indigo color by default
  size = 60,
  iconColor = "white",
}: FloatingActionButtonProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default behavior: navigate to practice screen
      router.push("/practice");
    }
  };

  return (
    <View className="absolute bottom-6 right-6 z-10">
      <TouchableOpacity
        onPress={handlePress}
        className="items-center justify-center rounded-full shadow-lg bg-indigo-500"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          elevation: 5,
        }}
        activeOpacity={0.8}
      >
        <Plus size={size * 0.5} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingActionButton;
