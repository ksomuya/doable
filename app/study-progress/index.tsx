import React, { useState } from "react";
import { View, Text, SafeAreaView, StatusBar } from "react-native";
import { router } from "expo-router";
import SubjectSelection from "../components/SubjectSelection";
import { useAppContext } from "../context/AppContext";

const StudyProgressScreen = () => {
  const { surveyData } = useAppContext();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    // Navigate to chapter selection screen with the selected subject
    router.push({
      pathname: "/study-progress/chapters",
      params: { subject },
    });
  };

  const handleSkip = () => {
    // Skip to the completion screen
    router.push("/study-progress/completion");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            What have you already studied?
          </Text>
          <Text className="text-base text-gray-600">
            Select one subject to start tracking your progress. You'll be able
            to select specific chapters next.
          </Text>
        </View>

        <SubjectSelection
          onSelectSubject={handleSubjectSelect}
          selectedExam={surveyData.examType || "JEE"}
        />

        <View className="mt-auto pb-6">
          <Text
            className="text-center text-indigo-600 font-medium text-base"
            onPress={handleSkip}
          >
            Skip for now
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StudyProgressScreen;
