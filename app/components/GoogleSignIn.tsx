import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";

interface GoogleSignInProps {
  onSignIn?: () => void;
  isLoading?: boolean;
}

const GoogleSignIn = ({
  onSignIn = () => {},
  isLoading = false,
}: GoogleSignInProps) => {
  const handleSignIn = () => {
    if (isLoading) return;
    // In a real implementation, this would trigger Google authentication
    // For now, we'll just simulate the sign-in process
    onSignIn();
  };

  return (
    <View className="w-full max-w-xs bg-white">
      <TouchableOpacity
        className="flex-row items-center justify-center px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm"
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#4285F4" className="mr-2" />
        ) : (
          <Image
            source={{
              uri: "https://developers.google.com/identity/images/g-logo.png",
            }}
            style={{ width: 24, height: 24 }}
            contentFit="contain"
            className="mr-3"
          />
        )}
        <Text className="text-gray-700 font-medium text-base">
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GoogleSignIn;
