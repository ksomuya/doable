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
import PenguinImage from "../components/PenguinImage";
import TypingText from "../components/TypingText";
import { supabase } from "../utils/supabase";
import { getSupabaseWithAuth } from "../utils/supabaseAuth";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Alert } from "react-native";

// Remove the direct import since we now have a component
// const penguineImage = require("../../assets/images/penguine.svg");

const OnboardingScreen = () => {
  const router = useRouter();
  const { completeSurvey } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1); // Start with first intro screen
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [typingComplete, setTypingComplete] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();

  const saveOnboardingSurvey = async (data: SurveyData) => {
    if (!user) {
      console.error('No user is signed in');
      return false;
    }

    setSavingData(true);
    try {
      // Get the user's JWT token from Clerk for Supabase auth
      const token = await getToken({ template: "supabase" });
      
      if (!token) {
        console.error('Could not get authentication token');
        Alert.alert('Authentication Error', 'Failed to authenticate with the server.');
        return false;
      }
      
      // Create an authenticated Supabase client
      const supabaseWithAuth = await getSupabaseWithAuth(token);
      
      // Format survey data for Supabase
      const surveyRecord = {
        user_id: user.id,
        exam_type: data.examType,
        current_class: data.currentClass,
        preparation_level: data.preparationLevel,
        daily_study_time: data.dailyStudyTime,
      };

      // Check if a record already exists for this user
      const { data: existingSurvey, error: checkError } = await supabaseWithAuth
        .from('onboarding_surveys')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing survey:', checkError);
        Alert.alert('Error', 'Failed to save your survey data. Please try again.');
        return false;
      }

      // Update or insert based on whether a record exists
      let error;
      if (existingSurvey) {
        // Update existing record
        const { error: updateError } = await supabaseWithAuth
          .from('onboarding_surveys')
          .update({
            ...surveyRecord,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabaseWithAuth
          .from('onboarding_surveys')
          .insert(surveyRecord);
          
        error = insertError;
      }

      if (error) {
        console.error('Error saving survey data:', error);
        Alert.alert('Error', 'Failed to save your survey data. Please try again.');
        return false;
      }

      // Save study preferences separately
      if (data.studyPreferences && data.studyPreferences.length > 0) {
        // Delete any existing preferences first
        await supabaseWithAuth
          .from('study_preferences')
          .delete()
          .eq('user_id', user.id);
          
        // Insert each preference as a separate record
        const preferenceRecords = data.studyPreferences.map(preference => ({
          user_id: user.id,
          preference: preference
        }));
        
        const { error: prefError } = await supabaseWithAuth
          .from('study_preferences')
          .insert(preferenceRecords);
          
        if (prefError) {
          console.error('Error saving study preferences:', prefError);
          // Continue anyway, as the main survey data was saved
        }
      }

      console.log('Survey data saved successfully');
      return true;
    } catch (error) {
      console.error('Exception saving survey data:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      return false;
    } finally {
      setSavingData(false);
    }
  };

  const handleSurveyComplete = async (data: SurveyData) => {
    // Save the survey data to local state first
    setSurveyData(data);
    
    // Save to Supabase
    const saved = await saveOnboardingSurvey(data);
    
    if (saved) {
      // Save the survey data to context
      completeSurvey(data);
      
      // Mark user as onboarded and profile setup in Supabase
      if (user) {
        try {
          // Get the user's JWT token from Clerk
          const token = await getToken({ template: "supabase" });
          
          if (token) {
            // Create an authenticated Supabase client
            const supabaseWithAuth = await getSupabaseWithAuth(token);
            
            // Update both is_onboarded and is_profile_setup flags to true
            const { error } = await supabaseWithAuth
              .from('users')
              .update({ 
                is_onboarded: true,
                is_profile_setup: true 
              })
              .eq('id', user.id);
              
            if (error) {
              console.error('Error updating user status:', error);
            }
          }
        } catch (err) {
          console.error('Failed to update user status:', err);
        }
      }
      
      // Navigate directly to home page instead of paywall/study progress
      router.replace("/home" as any);
    }
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
