import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Check, ChevronRight } from "lucide-react-native";

export interface SurveyData {
  examType: "JEE" | "NEET" | null;
  preparationLevel: "Beginner" | "Intermediate" | "Advanced" | null;
  studyPreferences: string[];
  dailyStudyTime: "1 hour" | "2-3 hours" | "4+ hours" | null;
}

interface OnboardingSurveyProps {
  onComplete?: (surveyData: SurveyData) => void;
}

const OnboardingSurvey = ({ onComplete = () => {} }: OnboardingSurveyProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    examType: null,
    preparationLevel: null,
    studyPreferences: [],
    dailyStudyTime: null,
  });

  const steps = [
    {
      title: "Which exam are you preparing for?",
      options: ["JEE", "NEET"],
      field: "examType",
      singleSelect: true,
    },
    {
      title: "What is your current preparation level?",
      options: ["Beginner", "Intermediate", "Advanced"],
      field: "preparationLevel",
      singleSelect: true,
    },
    {
      title: "Select your study preferences (up to 2)",
      options: [
        "Video-based Learning",
        "Practice with Questions",
        "Revision Notes",
        "Flashcards",
        "Peer Discussion Groups",
      ],
      field: "studyPreferences",
      singleSelect: false,
      maxSelections: 2,
    },
    {
      title: "How much time can you commit to studying daily?",
      options: ["1 hour", "2-3 hours", "4+ hours"],
      field: "dailyStudyTime",
      singleSelect: true,
    },
  ];

  const handleOptionSelect = (option: string) => {
    const currentField = steps[currentStep].field;
    const isSingleSelect = steps[currentStep].singleSelect;

    if (isSingleSelect) {
      setSurveyData({
        ...surveyData,
        [currentField]: option,
      });
    } else {
      const maxSelections = steps[currentStep].maxSelections || 1;
      const currentSelections = [
        ...surveyData[currentField as keyof SurveyData],
      ] as string[];

      if (currentSelections.includes(option)) {
        // Remove if already selected
        setSurveyData({
          ...surveyData,
          [currentField]: currentSelections.filter((item) => item !== option),
        });
      } else if (currentSelections.length < maxSelections) {
        // Add if under max selections
        setSurveyData({
          ...surveyData,
          [currentField]: [...currentSelections, option],
        });
      }
    }
  };

  const isOptionSelected = (option: string) => {
    const currentField = steps[currentStep].field;
    const value = surveyData[currentField as keyof SurveyData];

    if (Array.isArray(value)) {
      return value.includes(option);
    }
    return value === option;
  };

  const canProceed = () => {
    const currentField = steps[currentStep].field;
    const value = surveyData[currentField as keyof SurveyData];

    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Survey completed
      onComplete(surveyData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View className="flex-1 bg-white p-6">
      {/* Progress indicator */}
      <View className="flex-row justify-between mb-8">
        {steps.map((_, index) => (
          <View
            key={index}
            className={`h-1 flex-1 mx-1 rounded-full ${index <= currentStep ? "bg-blue-500" : "bg-gray-200"}`}
          />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Text className="text-2xl font-bold mb-6">{currentStepData.title}</Text>

        <View className="space-y-4">
          {currentStepData.options.map((option) => (
            <TouchableOpacity
              key={option}
              className={`p-4 rounded-lg border-2 flex-row justify-between items-center ${isOptionSelected(option) ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              onPress={() => handleOptionSelect(option)}
            >
              <Text
                className={`text-lg ${isOptionSelected(option) ? "font-medium text-blue-500" : "text-gray-700"}`}
              >
                {option}
              </Text>
              {isOptionSelected(option) && <Check size={20} color="#3b82f6" />}
            </TouchableOpacity>
          ))}
        </View>

        {currentStepData.field === "studyPreferences" && (
          <Text className="text-gray-500 mt-2 italic">
            Select up to {currentStepData.maxSelections} options
          </Text>
        )}
      </ScrollView>

      <View className="flex-row justify-between mt-6">
        <TouchableOpacity
          onPress={handleBack}
          className={`py-3 px-6 rounded-lg ${currentStep === 0 ? "opacity-50 bg-gray-200" : "bg-gray-200"}`}
          disabled={currentStep === 0}
        >
          <Text className="text-gray-700 font-medium">Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          className={`py-3 px-6 rounded-lg flex-row items-center ${canProceed() ? "bg-blue-500" : "opacity-50 bg-blue-300"}`}
          disabled={!canProceed()}
        >
          <Text className="text-white font-medium mr-2">
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Text>
          <ChevronRight size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingSurvey;
