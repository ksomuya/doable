import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import SubjectSelection from "../components/SubjectSelection";
import PracticeTypeSelection from "../components/PracticeTypeSelection";
import XPGoalSetting from "../components/XPGoalSetting";
import { useAppContext } from "../context/AppContext";

type PracticeType = "refine" | "recall" | "conquer";

const PracticePage = () => {
  const router = useRouter();
  const { startPracticeSession } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedPracticeType, setSelectedPracticeType] =
    useState<PracticeType | null>(null);
  const [selectedXPGoal, setSelectedXPGoal] = useState<number>(100);
  const [selectedExam, setSelectedExam] = useState<"JEE" | "NEET">("JEE");

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handlePracticeTypeSelect = (type: PracticeType) => {
    setSelectedPracticeType(type);
  };

  const handleXPGoalSelect = (goal: number) => {
    setSelectedXPGoal(goal);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Start practice session and navigate to question screen
      if (selectedSubject && selectedPracticeType) {
        startPracticeSession(
          selectedSubject,
          selectedPracticeType,
          selectedXPGoal,
        );
        router.push("/practice/question");
      }
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SubjectSelection
            onSelectSubject={handleSubjectSelect}
            selectedExam={selectedExam}
          />
        );
      case 2:
        return <PracticeTypeSelection onSelect={handlePracticeTypeSelect} />;
      case 3:
        return (
          <XPGoalSetting
            onGoalSelected={handleXPGoalSelect}
            defaultSelectedGoal={selectedXPGoal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-medium text-gray-800">
          {currentStep === 1
            ? "Select Subject"
            : currentStep === 2
              ? "Practice Mode"
              : "Set XP Goal"}
        </Text>
      </View>

      {/* Progress Indicator */}
      <View className="flex-row justify-between px-4 py-3">
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            className={`h-1 flex-1 mx-1 rounded-full ${step <= currentStep ? "bg-purple-600" : "bg-gray-200"}`}
          />
        ))}
      </View>

      <ScrollView className="flex-1 p-4">
        {renderStepContent()}

        {/* Next Button */}
        {(currentStep === 1 && selectedSubject) ||
        (currentStep === 2 && selectedPracticeType) ||
        currentStep === 3 ? (
          <TouchableOpacity
            className="mt-6 bg-purple-600 py-3 rounded-lg flex-row justify-center items-center"
            onPress={handleNextStep}
          >
            <Text className="text-white font-bold text-lg mr-2">
              {currentStep === 3 ? "Start Practice" : "Continue"}
            </Text>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View className="p-4 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          {currentStep === 1 && "Choose the subject you want to practice"}
          {currentStep === 2 && "Select how you want to practice today"}
          {currentStep === 3 && "Set your XP goal for this session"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default PracticePage;
