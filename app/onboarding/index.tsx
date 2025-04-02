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
import TypingText from "../components/TypingText";

// Remove the direct import since we now have a component
// const penguineImage = require("../../assets/images/penguine.svg");

const OnboardingScreen = () => {
  const router = useRouter();
  const { completeSurvey } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1); // Start with first intro screen
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);

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
  
  // Reset typing complete state when step changes
  React.useEffect(() => {
    setTypingComplete(false);
  }, [currentStep]);

  const renderPenguinIntroScreen = (
    message: string,
    onContinue: () => void,
    animation: 'waving' | 'excited' | 'walking' | 'writing' | 'sleeping' = 'waving'
  ) => {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6 pt-10">
          {/* Speech Bubble */}
          <View className="bg-[#F9FAFB] border border-gray-300 rounded-3xl p-4 mb-2 w-full max-w-xs relative">
            <TypingText 
              text={message} 
              className="text-center text-xl font-medium text-[#1F2937]"
              typingSpeed={40} 
              onTypingComplete={() => setTypingComplete(true)}
            />
            {/* Speech Bubble Tail */}
            <View className="absolute -bottom-3 left-1/2 -ml-3 h-0 w-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#F9FAFB]" />
          </View>

          {/* Penguin Image - using our new component */}
          <View className="w-60 h-60 items-center justify-center mt-4">
            <PenguinImage size={240} animation={animation} />
          </View>
        </View>

        {/* Continue Button - now in a separate fixed bottom container */}
        <View className="px-6 pb-8 w-full">
          <TouchableOpacity
            className={`${typingComplete ? 'bg-[#ED7930]' : 'bg-gray-400'} w-full py-4 rounded-xl items-center justify-center`}
            onPress={onContinue}
            disabled={!typingComplete}
          >
            <Text className="text-white text-xl font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          "writing"
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
