import React, { useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import GoogleSignIn from "../components/GoogleSignIn";
import { useAppContext } from "../context/AppContext";

const AuthScreen = () => {
  const { signIn } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInSuccess = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      signIn();
      setIsLoading(false);
      router.replace("/onboarding");
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6 bg-white">
        {/* App Logo */}
        <View className="mb-8 items-center">
          <Image
            source={{
              uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=doable",
            }}
            className="w-32 h-32 mb-4"
            style={{ width: 128, height: 128 }}
          />
          <Text className="text-3xl font-bold text-indigo-600">Doable</Text>
          <Text className="text-lg text-gray-600 text-center mt-2">
            Ace your competitive exams with your study buddy
          </Text>
        </View>

        {/* App Description */}
        <View className="mb-10 px-4">
          <Text className="text-center text-gray-700 mb-2">
            Personalized study plans for JEE & NEET
          </Text>
          <Text className="text-center text-gray-700 mb-2">
            Adaptive question engine to maximize learning
          </Text>
          <Text className="text-center text-gray-700">
            Virtual pet companion that grows with your progress
          </Text>
        </View>

        {/* Sign In Button */}
        <View className="w-full items-center">
          <GoogleSignIn onSignIn={handleSignInSuccess} isLoading={isLoading} />
        </View>

        {/* Terms and Privacy */}
        <Text className="text-xs text-gray-500 mt-8 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center">
          <View className="bg-white p-6 rounded-xl items-center">
            <ActivityIndicator size="large" color="#4F46E5" className="mb-4" />
            <Text className="text-lg font-medium mb-2">Signing in...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AuthScreen;
