import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import OnboardingSurvey from "../components/OnboardingSurvey";
import { useAppContext } from "../context/AppContext";
import { SurveyData } from "../components/OnboardingSurvey";
import PaywallScreen from "./paywall";
import PenguinImage from "../components/PenguinImage";

// Remove the direct import since we now have a component
// const penguineImage = require("../../assets/images/penguine.svg");

const OnboardingScreen = () => {
  const router = useRouter();
  const { completeSurvey } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1); // Start with first intro screen
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSurveyComplete = (data: SurveyData) => {
    // Save the survey data to local state first
    setSurveyData(data);
    
    // Show paywall instead of going to next screen
    setShowPaywall(true);
  };

  const handleFinalContinue = () => {
    // Navigate to study progress flow
    setCurrentStep(7);
  };

  const handlePaywallComplete = () => {
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

        {/* Penguin Image - using our new component */}
        <View className="w-60 h-60 items-center justify-center">
          <PenguinImage size={240} />
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
    // If showPaywall is true, show the paywall screen
    if (showPaywall) {
      return <PaywallScreen onComplete={handlePaywallComplete} />;
    }

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
      case 7: // Paywall screen - this is now just a fallback
        return <PaywallScreen onComplete={handlePaywallComplete} />;
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
