import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Bell, User } from "lucide-react-native";

interface HeaderProps {
  title?: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

const Header = ({
  title = "Doable",
  onProfilePress = () => {},
  onNotificationPress = () => {},
}: HeaderProps) => {
  return (
    <View className="w-full h-[60px] px-4 flex-row items-center justify-between bg-white shadow-sm">
      <TouchableOpacity
        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        onPress={onProfilePress}
      >
        <User size={24} color="#6366F1" />
      </TouchableOpacity>

      <Text className="text-xl font-bold text-indigo-600">{title}</Text>

      <TouchableOpacity
        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        onPress={onNotificationPress}
      >
        <Bell size={24} color="#6366F1" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
