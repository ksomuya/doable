import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import OnboardingSurvey from "../components/OnboardingSurvey";
import { useAppContext } from "../context/AppContext";
import { SurveyData } from "../components/OnboardingSurvey";

const OnboardingScreen = () => {
  const router = useRouter();
  const { completeSurvey } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1); // Start with first intro screen
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);

  const handleSurveyComplete = (data: SurveyData) => {
    // Save the survey data to local state first
    setSurveyData(data);
    // Move to the next screen
    setCurrentStep(4);
  };

  const handleFinalContinue = () => {
    // Save the survey data to context
    if (surveyData) {
      completeSurvey(surveyData);
    }
    // Navigate to study progress flow
    router.replace("/study-progress");
  };

  const renderPenguinIntroScreen = (
    message: string,
    onContinue: () => void,
  ) => (
    <View className="flex-1 items-center justify-between px-6 py-10">
      <View className="flex-1 items-center justify-center">
        {/* Speech Bubble */}
        <View className="bg-white border border-gray-300 rounded-3xl p-4 mb-8 w-full max-w-xs">
          <Text className="text-center text-xl font-medium">{message}</Text>
        </View>

        {/* Penguin Image */}
        <View className="w-60 h-60 items-center justify-center">
          <Image
            source={{
              uri: "https://api.dicebear.com/7.x/bottts/svg?seed=penguin&backgroundColor=orange",
            }}
            style={{ width: 240, height: 240 }}
            contentFit="contain"
          />
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        className="bg-[#ED7930] w-full py-4 rounded-xl items-center justify-center mb-4"
        onPress={onContinue}
      >
        <Text className="text-white text-xl font-semibold">Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1: // First intro screen
        return renderPenguinIntroScreen("Hi there! i am dodo", () =>
          setCurrentStep(2),
        );
      case 2: // Second intro screen
        return renderPenguinIntroScreen(
          "Just a few quick questions before our first practice session",
          () => setCurrentStep(3),
        );
      case 3: // Survey
        return (
          <View className="flex-1">
            <OnboardingSurvey onComplete={handleSurveyComplete} />
          </View>
        );
      case 4: // After survey - first message
        return renderPenguinIntroScreen("Great! We're almost there!", () =>
          setCurrentStep(5),
        );
      case 5: // After survey - second message
        return renderPenguinIntroScreen(
          "One last very important thing to start your practice session...",
          () => setCurrentStep(6),
        );
      case 6: // After survey - third message
        return renderPenguinIntroScreen(
          "Tell us which chapters you've studied in your class so we can create the best practice session for you!",
          handleFinalContinue,
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {renderContent()}
    </SafeAreaView>
  );
};

export default OnboardingScreen;
