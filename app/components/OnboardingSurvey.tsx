import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { useAppContext } from "../context/AppContext";

const { width } = Dimensions.get("window");

export interface SurveyData {
  examType: "JEE" | "NEET" | null;
  currentClass: "Class 11" | "Class 12" | "Dropper" | null;
  preparationLevel: "Beginner" | "Intermediate" | "Advanced" | null;
  studyPreferences: string[];
  dailyStudyTime: "1 hour" | "2-3 hours" | "4+ hours" | null;
}

interface OnboardingSurveyProps {
  onComplete?: (surveyData: SurveyData) => void;
}

const defaultSurveyData: SurveyData = {
  examType: null,
  currentClass: null,
  preparationLevel: null,
  studyPreferences: [],
  dailyStudyTime: null,
};

const OnboardingSurvey = ({ onComplete = () => {} }: OnboardingSurveyProps) => {
  const { partialSurveyData, surveyCurrStep, updateSurveyProgress } = useAppContext();
  
  // Ensure we have valid initial values
  const initialStep = surveyCurrStep ?? 0;
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [surveyData, setSurveyData] = useState<SurveyData>(() => {
    // Safely merge partial data with default values
    // Using a more defensive approach to handle potential null/undefined values
    const safePartialData = partialSurveyData || {};
    
    return {
      ...defaultSurveyData,
      examType: safePartialData.examType || null,
      currentClass: safePartialData.currentClass || null,
      preparationLevel: safePartialData.preparationLevel || null,
      studyPreferences: Array.isArray(safePartialData.studyPreferences) 
        ? safePartialData.studyPreferences 
        : [],
      dailyStudyTime: safePartialData.dailyStudyTime || null,
    };
  });
  
  // Use refs to track previous values to prevent infinite updates
  const prevStepRef = useRef(currentStep);
  const prevDataRef = useRef(surveyData);

  // Update context when survey data changes
  useEffect(() => {
    // Only update if there's an actual change in data or step
    const stepChanged = prevStepRef.current !== currentStep;
    const dataChanged = JSON.stringify(prevDataRef.current) !== JSON.stringify(surveyData);
    
    if (stepChanged || dataChanged) {
      prevStepRef.current = currentStep;
      prevDataRef.current = surveyData;
      
      // Ensure this only runs if updateSurveyProgress is available
      if (updateSurveyProgress) {
        console.log("Updating survey progress", { currentStep, surveyData });
        updateSurveyProgress(currentStep, surveyData);
      }
    }
  }, [currentStep, surveyData, updateSurveyProgress]);

  // Make sure we have valid steps to display
  const steps = [
    {
      title: "Which exam are you preparing for?",
      description: "Choose the exam you want to focus on",
      options: ["JEE", "NEET"],
      field: "examType",
      singleSelect: true,
    },
    {
      title: "Which class are you currently in?",
      description: "This helps us tailor content to your academic year",
      options: ["Class 11", "Class 12", "Dropper"],
      field: "currentClass",
      singleSelect: true,
    },
    {
      title: "What is your current preparation level?",
      description: "This helps us personalize your learning path",
      options: ["Beginner", "Intermediate", "Advanced"],
      field: "preparationLevel",
      singleSelect: true,
    },
    {
      title: "Select your practice preferences",
      description:
        "Choose up to 2 practice methods that suit your learning style best",
      options: [
        "Timed Practice Sessions",
        "Topic-wise Practice",
        "Mixed Questions (Interleaved Practice)",
        "Daily Quick Revision",
        "Full-Length Mock Tests",
      ],
      field: "studyPreferences",
      singleSelect: false,
      maxSelections: 2,
    },
    {
      title: "How much time can you commit daily?",
      description: "Be realistic with your time commitment",
      options: ["1 hour", "2-3 hours", "4+ hours"],
      field: "dailyStudyTime",
      singleSelect: true,
    },
  ];

  // Check if we have a valid step
  useEffect(() => {
    // Ensure currentStep is always within valid range
    if (currentStep < 0 || currentStep >= steps.length) {
      setCurrentStep(0);
    }
  }, [currentStep, steps.length]);

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
      const currentSelections = currentField === 'studyPreferences' 
        ? [...(surveyData.studyPreferences || [])] 
        : [];

      if (currentSelections.includes(option)) {
        setSurveyData({
          ...surveyData,
          [currentField]: currentSelections.filter((item) => item !== option),
        });
      } else if (currentSelections.length < maxSelections) {
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
      onComplete(surveyData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Ensure we have a valid step before rendering
  if (currentStep < 0 || currentStep >= steps.length) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar and Back Button */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.backButtonContainer,
            {
              width: currentStep === 0 ? 0 : 44,
              opacity: currentStep === 0 ? 0 : 1,
              marginRight: currentStep === 0 ? 0 : 12,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            disabled={currentStep === 0}
          >
            <ChevronLeft color="#000" size={24} />
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.stepCount}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInRight}
          exiting={FadeOutLeft}
          key={currentStep}
          style={styles.questionContainer}
        >
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>

          <View style={styles.optionsContainer}>
            {currentStepData.options.map((option, index) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  isOptionSelected(option) && styles.optionSelected,
                ]}
                onPress={() => handleOptionSelect(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    isOptionSelected(option) && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentStepData.field === "studyPreferences" && (
            <Text style={styles.helperText}>
              Select up to {currentStepData.maxSelections} options
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !canProceed() && styles.continueButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.continueButtonText}>
            {currentStep === steps.length - 1 ? "Complete" : "Continue"}
          </Text>
          <ChevronRight color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButtonContainer: {
    overflow: 'hidden',
    height: 40,
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
  },
  progressBackground: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#23CD57",
    borderRadius: 2,
  },
  stepCount: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  questionContainer: {
    minHeight: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  optionSelected: {
    borderColor: "#ED7930",
    backgroundColor: "#FEF3E8",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#ED7930",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 16,
    textAlign: "center",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueButton: {
    backgroundColor: "#ED7930",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  continueButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default OnboardingSurvey;
