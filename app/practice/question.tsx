import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ArrowLeft, Flag, Bookmark } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppContext } from "../context/AppContext";

import QuestionDisplay from "../components/QuestionDisplay";
import AnswerOptions from "../components/AnswerOptions";
import ProgressBar from "../components/ProgressBar";
import AnswerFeedbackModal from "../components/AnswerFeedbackModal";
import QuestionReportModal from "../components/QuestionReportModal";
import BookmarkButton from "../components/BookmarkButton";
import StreakIndicator from "../components/StreakIndicator";

const QuestionScreen = () => {
  const { subject, goal, xp, type } = useLocalSearchParams();
  const { user, updatePracticeProgress } = useAppContext();

  const [currentXP, setCurrentXP] = useState(0);
  const [goalXP, setGoalXP] = useState(parseInt(xp as string) || 200);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreakIndicator, setShowStreakIndicator] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Mock questions data - in a real app, this would come from an API or database
  const questions = [
    {
      id: "q1",
      questionNumber: 1,
      totalQuestions: 10,
      questionText:
        "A particle moves in a straight line with constant acceleration. If it covers distances s₁ and s₂ in the first t₁ and t₂ seconds respectively from the beginning of the motion, then its initial velocity is:",
      difficultyLevel: "Medium",
      timeRemaining: 120,
      subject: "Physics",
      topic: "Kinematics",
      options: [
        { id: "A", text: "2(s₁t₂ - s₂t₁)/(t₁t₂(t₂ - t₁))", isCorrect: false },
        { id: "B", text: "2(s₂t₁ - s₁t₂)/(t₁t₂(t₂ - t₁))", isCorrect: true },
        { id: "C", text: "(s₁t₂² - s₂t₁²)/(t₁t₂(t₂ - t₁))", isCorrect: false },
        { id: "D", text: "(s₂t₁² - s₁t₂²)/(t₁t₂(t₂ - t₁))", isCorrect: false },
      ],
      explanation:
        "The initial velocity v₀ can be found using the equation of motion s = v₀t + (1/2)at². By solving the system of equations for s₁ and s₂, we can eliminate a and solve for v₀, which gives us the formula 2(s₂t₁ - s₁t₂)/(t₁t₂(t₂ - t₁)).",
      hint: "Try using the equation of motion and create a system of equations for both distances.",
    },
    {
      id: "q2",
      questionNumber: 2,
      totalQuestions: 10,
      questionText:
        "A ball is thrown vertically upward with an initial velocity of 20 m/s. How high will it go before it starts falling back down? (Take g = 10 m/s²)",
      difficultyLevel: "Easy",
      timeRemaining: 90,
      subject: "Physics",
      topic: "Kinematics",
      options: [
        { id: "A", text: "10 m", isCorrect: false },
        { id: "B", text: "20 m", isCorrect: true },
        { id: "C", text: "40 m", isCorrect: false },
        { id: "D", text: "100 m", isCorrect: false },
      ],
      explanation:
        "At the highest point, the velocity becomes zero. Using the equation v² = u² + 2as, where v = 0, u = 20 m/s, and a = -g = -10 m/s², we get: 0 = 20² + 2(-10)s, which gives s = 20 m.",
      hint: "At the highest point, what is the velocity of the ball?",
    },
    {
      id: "q3",
      questionNumber: 3,
      totalQuestions: 10,
      questionText:
        "Two cars A and B are traveling in the same direction with speeds of 30 m/s and 20 m/s respectively. Car A is 100 m behind car B. How long will it take for car A to catch up with car B?",
      difficultyLevel: "Medium",
      timeRemaining: 120,
      subject: "Physics",
      topic: "Kinematics",
      options: [
        { id: "A", text: "5 seconds", isCorrect: false },
        { id: "B", text: "10 seconds", isCorrect: true },
        { id: "C", text: "15 seconds", isCorrect: false },
        { id: "D", text: "20 seconds", isCorrect: false },
      ],
      explanation:
        "The relative speed of car A with respect to car B is 30 - 20 = 10 m/s. The distance to be covered is 100 m. Using the formula time = distance/speed, we get time = 100/10 = 10 seconds.",
      hint: "Think about the relative speed between the two cars.",
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  // Handle answer selection
  const handleAnswerSelected = (optionId: string) => {
    setSelectedAnswer(optionId);
    setAttemptCount((prev) => prev + 1);
    setQuestionsAnswered((prev) => prev + 1);

    const selectedOption = currentQuestion.options.find(
      (option) => option.id === optionId,
    );
    const isCorrect = selectedOption?.isCorrect || false;
    setIsAnswerCorrect(isCorrect);

    // Show feedback modal
    setShowFeedbackModal(true);

    // Update XP and streak
    if (isCorrect) {
      // Award more XP for correct answers
      const xpEarned = 25;
      setCurrentXP((prev) => Math.min(prev + xpEarned, goalXP));
      setStreak((prev) => prev + 1);
      setShowStreakIndicator(true);
      setCorrectAnswers((prev) => prev + 1);

      // Update practice progress in context
      updatePracticeProgress(xpEarned, true, 30); // 30 seconds is a placeholder for time spent
    } else {
      // Award some XP for attempting
      const xpEarned = 5;
      setCurrentXP((prev) => Math.min(prev + xpEarned, goalXP));
      setStreak(0); // Reset streak on wrong answer

      // Update practice progress in context
      updatePracticeProgress(xpEarned, false, 30);
    }

    // Hide streak indicator after a delay
    if (isCorrect) {
      setTimeout(() => {
        setShowStreakIndicator(false);
      }, 3000);
    }
  };

  // Handle navigation back to practice selection
  const handleGoBack = () => {
    router.back();
  };

  // Handle navigation to next question
  const handleNextQuestion = () => {
    // Close feedback modal
    setShowFeedbackModal(false);
    setSelectedAnswer(null);
    setAttemptCount(0);

    // Check if we've reached the goal XP
    if (currentXP >= goalXP) {
      // Navigate to summary screen
      router.push({
        pathname: "/practice/summary",
        params: {
          questionsAnswered: questionsAnswered.toString(),
          correctAnswers: correctAnswers.toString(),
          xpEarned: currentXP.toString(),
          goalXP: goalXP.toString(),
        },
      });
    } else {
      // Load next question
      setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    }
  };

  // Handle try again
  const handleTryAgain = () => {
    setShowFeedbackModal(false);
    setSelectedAnswer(null);
  };

  // Handle see answer
  const handleSeeAnswer = () => {
    setAttemptCount(2); // Force showing the answer
    setShowFeedbackModal(true);
  };

  // Handle report submission
  const handleReportSubmit = (reason: string, details: string) => {
    console.log(`Question reported: ${currentQuestion.id}`);
    console.log(`Reason: ${reason}`);
    console.log(`Details: ${details}`);
    // In a real app, this would send the report to a server
  };

  // Handle bookmark toggle
  const handleToggleBookmark = (questionId: string, isBookmarked: boolean) => {
    if (isBookmarked) {
      setBookmarkedQuestions((prev) => [...prev, questionId]);
    } else {
      setBookmarkedQuestions((prev) => prev.filter((id) => id !== questionId));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Practice Session</Text>
          <View style={styles.headerActions}>
            <BookmarkButton
              questionId={currentQuestion.id}
              isBookmarked={bookmarkedQuestions.includes(currentQuestion.id)}
              onToggleBookmark={handleToggleBookmark}
            />
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => setShowReportModal(true)}
            >
              <Flag size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            currentXP={currentXP}
            goalXP={goalXP}
            color="#4F46E5"
            height={8}
            showLabel={true}
          />
        </View>

        {/* Streak Indicator */}
        <StreakIndicator streak={streak} visible={showStreakIndicator} />

        <ScrollView style={styles.content}>
          {/* Question display */}
          <QuestionDisplay
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={Math.ceil(goalXP / 25)}
            questionText={currentQuestion.questionText}
            difficultyLevel={currentQuestion.difficultyLevel}
            timeRemaining={currentQuestion.timeRemaining}
            subject={currentQuestion.subject}
            topic={currentQuestion.topic}
          />

          {/* Answer options */}
          <View style={styles.answerContainer}>
            <AnswerOptions
              options={currentQuestion.options}
              onAnswerSelected={handleAnswerSelected}
              showExplanation={false}
              selectedOption={selectedAnswer}
              disabled={showFeedbackModal}
            />
          </View>
        </ScrollView>

        {/* Answer Feedback Modal */}
        <AnswerFeedbackModal
          visible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          isCorrect={isAnswerCorrect}
          explanation={currentQuestion.explanation}
          correctAnswer={
            currentQuestion.options.find((o) => o.isCorrect)?.text || ""
          }
          hint={currentQuestion.hint}
          onTryAgain={handleTryAgain}
          onSeeAnswer={handleSeeAnswer}
          onNextQuestion={handleNextQuestion}
          attemptCount={attemptCount}
        />

        {/* Question Report Modal */}
        <QuestionReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          questionId={currentQuestion.id}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  answerContainer: {
    marginTop: 16,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default QuestionScreen;
