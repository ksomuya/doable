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
      // Navigate to study progress flow instead of home
      router.replace("/study-progress");
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

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
