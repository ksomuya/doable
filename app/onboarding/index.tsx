import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import OnboardingSurvey from "../components/OnboardingSurvey";
import { useAppContext } from "../context/AppContext";
import { SurveyData } from "../components/OnboardingSurvey";

const OnboardingScreen = () => {
  const router = useRouter();
  const { completeSurvey } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSurveyComplete = (surveyData: SurveyData) => {
    setIsLoading(true);
    // Here you would typically send the survey data to your backend
    console.log("Survey completed with data:", surveyData);

    // Simulate API call delay
    setTimeout(() => {
      completeSurvey(surveyData);
      setIsLoading(false);
      router.replace("/");
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-3xl font-bold text-blue-600">Doable</Text>
        <Text className="text-lg text-gray-600 mt-1">
          Let's personalize your study experience
        </Text>
      </View>

      {/* App Logo */}
      <View className="items-center justify-center py-4">
        <Image
          source={{
            uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=doable-pet",
          }}
          className="w-32 h-32 rounded-full bg-blue-100"
          resizeMode="contain"
        />
        <Text className="text-center text-gray-500 mt-2">
          Your study buddy is waiting for you!
        </Text>
      </View>

      {/* Survey Component */}
      <View className="flex-1">
        <OnboardingSurvey onComplete={handleSurveyComplete} />
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center">
          <View className="bg-white p-6 rounded-xl items-center">
            <ActivityIndicator size="large" color="#4F46E5" className="mb-4" />
            <Text className="text-lg font-medium mb-2">
              Creating your study plan...
            </Text>
            <Text className="text-gray-500 text-center">
              We're personalizing your experience based on your preferences
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OnboardingScreen;
