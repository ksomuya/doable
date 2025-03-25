import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";

import QuestionDisplay from "../components/QuestionDisplay";
import AnswerOptions from "../components/AnswerOptions";
import ProgressBar from "../components/ProgressBar";

const QuestionScreen = () => {
  const [currentXP, setCurrentXP] = useState(75);
  const [goalXP, setGoalXP] = useState(200);
  const [showExplanation, setShowExplanation] = useState(false);

  // Mock question data
  const questionData = {
    questionNumber: 3,
    totalQuestions: 10,
    questionText:
      "A particle moves in a straight line with constant acceleration. If it covers distances s₁ and s₂ in the first t₁ and t₂ seconds respectively from the beginning of the motion, then its initial velocity is:",
    difficultyLevel: "Medium",
    timeRemaining: 120,
    subject: "Physics",
    topic: "Kinematics",
  };

  // Mock answer options
  const answerOptions = [
    { id: "A", text: "2(s₁t₂ - s₂t₁)/(t₁t₂(t₂ - t₁))", isCorrect: false },
    { id: "B", text: "2(s₂t₁ - s₁t₂)/(t₁t₂(t₂ - t₁))", isCorrect: true },
    { id: "C", text: "(s₁t₂² - s₂t₁²)/(t₁t₂(t₂ - t₁))", isCorrect: false },
    { id: "D", text: "(s₂t₁² - s₁t₂²)/(t₁t₂(t₂ - t₁))", isCorrect: false },
  ];

  // Handle answer selection
  const handleAnswerSelected = (optionId, isCorrect) => {
    setShowExplanation(true);

    // Update XP based on answer correctness
    if (isCorrect) {
      // Award more XP for correct answers
      setCurrentXP((prev) => Math.min(prev + 25, goalXP));
    } else {
      // Award some XP for attempting
      setCurrentXP((prev) => Math.min(prev + 5, goalXP));
    }
  };

  // Handle navigation back to practice selection
  const handleGoBack = () => {
    router.back();
  };

  // Handle navigation to next question
  const handleNextQuestion = () => {
    // Reset explanation state for next question
    setShowExplanation(false);

    // Check if we've reached the goal XP
    if (currentXP >= goalXP) {
      // Navigate to summary screen
      router.push("/practice/summary");
    } else {
      // In a real app, we would load the next question here
      // For now, we'll just simulate it by resetting the explanation
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header with back button */}
        <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={handleGoBack} className="mr-4">
            <ArrowLeft size={24} color="#334155" />
          </TouchableOpacity>
          <Text className="text-lg font-medium text-gray-800">
            Practice Session
          </Text>
        </View>

        {/* Progress bar */}
        <View className="px-4 py-3 bg-white">
          <ProgressBar
            currentXP={currentXP}
            goalXP={goalXP}
            color="#4F46E5"
            height={12}
            showLabel={true}
          />
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Question display */}
          <QuestionDisplay
            questionNumber={questionData.questionNumber}
            totalQuestions={questionData.totalQuestions}
            questionText={questionData.questionText}
            difficultyLevel={questionData.difficultyLevel}
            timeRemaining={questionData.timeRemaining}
            subject={questionData.subject}
            topic={questionData.topic}
          />

          {/* Answer options */}
          <View className="mt-4">
            <AnswerOptions
              options={answerOptions}
              onAnswerSelected={handleAnswerSelected}
              showExplanation={showExplanation}
              explanation="The initial velocity v₀ can be found using the equation of motion s = v₀t + (1/2)at². By solving the system of equations for s₁ and s₂, we can eliminate a and solve for v₀, which gives us the formula 2(s₂t₁ - s₁t₂)/(t₁t₂(t₂ - t₁))."
            />
          </View>
        </ScrollView>

        {/* Next question button (only shown after answering) */}
        {showExplanation && (
          <View className="p-4 border-t border-gray-200 bg-white">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-blue-600 py-3 px-4 rounded-lg"
              onPress={handleNextQuestion}
            >
              <Text className="text-white font-medium mr-2">
                {currentXP >= goalXP ? "See Results" : "Next Question"}
              </Text>
              <ChevronRight size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default QuestionScreen;
