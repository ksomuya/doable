import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { ArrowLeft, Flag, Bookmark, CheckCircle, Clock, Award, Zap, ChevronRight, HelpCircle, X } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { LinearGradient } from "expo-linear-gradient";

import QuestionDisplay from "../components/QuestionDisplay";
import AnswerOptions from "../components/AnswerOptions";
import ProgressBar from "../components/ProgressBar";
import AnswerFeedbackModal from "../components/AnswerFeedbackModal";
import QuestionReportModal from "../components/QuestionReportModal";
import BookmarkButton from "../components/BookmarkButton";
import StreakIndicator from "../components/StreakIndicator";

type QuestionDifficulty = "Easy" | "Medium" | "Hard";

const QuestionScreen = () => {
  const { subject, goal, xp, type } = useLocalSearchParams();
  const { user, updatePracticeProgress, isFirstPracticeSession, practiceProgress } = useAppContext();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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
  const [timeSpent, setTimeSpent] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [timerStart, setTimerStart] = useState(Date.now());

  // Screen width for responsive styling
  const screenWidth = Dimensions.get('window').width;

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setAttemptCount(0);
    
    // Reset timer for new question
    setTimerStart(Date.now());
    if (timer) clearInterval(timer);
    
    const newTimer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - timerStart) / 1000));
    }, 1000);
    
    setTimer(newTimer);
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentQuestionIndex]);

  // Animate progress bar when XP changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentXP / goalXP,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentXP, goalXP]);

  // Mock questions data - in a real app, this would come from an API or database
  const questions = [
    {
      id: "q1",
      questionNumber: 1,
      totalQuestions: 10,
      questionText:
        "A particle moves in a straight line with constant acceleration. If it covers distances s₁ and s₂ in the first t₁ and t₂ seconds respectively from the beginning of the motion, then its initial velocity is:",
      difficultyLevel: "Medium" as QuestionDifficulty,
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
      difficultyLevel: "Easy" as QuestionDifficulty,
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
      difficultyLevel: "Medium" as QuestionDifficulty,
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
  };
  
  // Handle check answer
  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = currentQuestion.options.find(
      (option) => option.id === selectedAnswer
    )?.isCorrect || false;
    
    setAttemptCount((prev) => prev + 1);
    setQuestionsAnswered((prev) => prev + 1);
    
    setIsAnswerCorrect(isCorrect);
    
    // Show feedback modal
    setShowFeedbackModal(true);
    
    // Calculate time spent on this question
    const questionTimeSpent = Math.floor((Date.now() - timerStart) / 1000);
    
    // Update XP and streak
    if (isCorrect) {
      // Award more XP for correct answers
      const xpEarned = 25;
      setCurrentXP((prev) => Math.min(prev + xpEarned, goalXP));
      setStreak((prev) => prev + 1);
      setShowStreakIndicator(true);
      setCorrectAnswers((prev) => prev + 1);
      
      // Update practice progress in context
      updatePracticeProgress(xpEarned, true, questionTimeSpent);
    } else {
      // Award some XP for attempting
      const xpEarned = 5;
      setCurrentXP((prev) => Math.min(prev + xpEarned, goalXP));
      setStreak(0); // Reset streak on wrong answer
      
      // Update practice progress in context
      updatePracticeProgress(xpEarned, false, questionTimeSpent);
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
    setIsAnswerCorrect(false); // Reset the answer correctness state too

    // Check if we've reached the goal XP
    if (currentXP >= goalXP) {
      navigateToSummary();
    } else {
      // Reset animations for next question
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      
      // Load next question
      setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    }
  };

  // Navigate to rewards chest screen
  const navigateToSummary = () => {
    // For first-time users, go to streak setup
    if (isFirstPracticeSession()) {
      router.push({
        pathname: "/practice/streak-setup" as any,
        params: {
          questionsAnswered: questionsAnswered.toString(),
          correctAnswers: correctAnswers.toString(),
          xpEarned: currentXP.toString(),
          goalXP: goalXP.toString(),
        },
      });
    } else {
      // For returning users, go to rewards chest
      router.push({
        pathname: "/practice/rewards-chest" as any,
        params: {
          questionsAnswered: questionsAnswered.toString(),
          correctAnswers: correctAnswers.toString(),
          xpEarned: currentXP.toString(),
          goalXP: goalXP.toString(),
        },
      });
    }
  };

  // Handle try again
  const handleTryAgain = () => {
    // Reset states properly to allow retry
    setShowFeedbackModal(false);
    setSelectedAnswer(null);
    setAttemptCount(0);
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

  // Format the time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.container}>
        {/* End session button at top right */}
        <TouchableOpacity
          style={styles.endSessionButton}
          onPress={navigateToSummary}
        >
          <X size={20} color="#1F2937" />
          <Text style={styles.endSessionButtonText}>End Session</Text>
        </TouchableOpacity>

        <View style={styles.wrapper}>
          {/* Subject and session info */}
          <View style={styles.sessionInfo}>
            <LinearGradient
              colors={['#EEF2FF', '#C7D2FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sessionInfoGradient}
            >
              <View style={styles.sessionInfoContent}>
                <View style={styles.sessionSubject}>
                  <Text style={styles.subjectText}>{(subject as string) || "Physics"}</Text>
                  <Text style={styles.sessionTypeText}>
                    {(type as string)?.charAt(0).toUpperCase() + (type as string)?.slice(1) || "Practice"}
                  </Text>
                </View>
                <View style={styles.sessionStats}>
                  <View style={styles.statItem}>
                    <Clock size={16} color="#4F46E5" />
                    <Text style={styles.statText}>{formatTime(timeSpent)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Award size={16} color="#4F46E5" />
                    <Text style={styles.statText}>{streak} streak</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Zap size={16} color="#4F46E5" />
                    <Text style={styles.statText}>{currentXP}/{goalXP} XP</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* XP Progress bar */}
          <View style={styles.xpProgressContainer}>
            <View style={styles.xpLabelContainer}>
              <Text style={styles.xpLabel}>XP Progress</Text>
              <Text style={styles.xpValue}>{currentXP}/{goalXP}</Text>
            </View>
            <View style={styles.xpProgressBarContainer}>
              <Animated.View 
                style={[
                  styles.xpProgressFill,
                  { width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })}
                ]}
              />
            </View>
          </View>

          {/* Streak Indicator */}
          <StreakIndicator streak={streak} visible={showStreakIndicator} />

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.topSpacing} />
            {/* Question display with bookmark button */}
            <Animated.View style={[
              styles.questionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}>
              <View style={styles.questionCardHeader}>
                <View style={styles.questionNumberContainer}>
                  <Text style={styles.questionNumberText}>
                    Question {currentQuestionIndex + 1}/{Math.ceil(goalXP / 25)}
                  </Text>
                  <Text style={styles.questionDifficultyText}>
                    {currentQuestion.difficultyLevel}
                  </Text>
                </View>
                <View style={styles.questionActions}>
                  <BookmarkButton
                    questionId={currentQuestion.id}
                    isBookmarked={bookmarkedQuestions.includes(currentQuestion.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                  <TouchableOpacity
                    style={styles.reportIcon}
                    onPress={() => setShowReportModal(true)}
                  >
                    <Flag size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.questionContent}>
                <View style={styles.subjectTopicContainer}>
                  <Text style={styles.subjectTopicText}>
                    {currentQuestion.subject} • {currentQuestion.topic}
                  </Text>
                </View>
                <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
              </View>
            </Animated.View>

            {/* Answer options */}
            <Animated.View style={[
              styles.answerContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}>
              <AnswerOptions
                options={currentQuestion.options}
                onAnswerSelected={handleAnswerSelected}
                showExplanation={false}
                selectedOption={selectedAnswer}
                disabled={showFeedbackModal}
              />
            </Animated.View>
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
          
          {/* Check Answer Button */}
          <View style={styles.bottomActions}>
            {selectedAnswer ? (
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkAnswerButtonGradient}
              >
                <TouchableOpacity
                  style={styles.checkAnswerButton}
                  onPress={handleCheckAnswer}
                >
                  <Text style={styles.checkAnswerButtonText}>Check Answer</Text>
                  <CheckCircle size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <View style={styles.checkAnswerButtonDisabled}>
                <Text style={styles.checkAnswerButtonTextDisabled}>Select an Answer</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    // Add padding to avoid status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  wrapper: {
    flex: 1,
  },
  endSessionButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  endSessionButtonText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  sessionInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    marginTop: 50, // Add space for the top button
  },
  sessionInfoGradient: {
    borderRadius: 12,
    overflow: "hidden",
  },
  sessionInfoContent: {
    padding: 12,
  },
  sessionSubject: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  sessionTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4F46E5",
  },
  sessionStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  xpProgressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  xpLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  xpValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  xpProgressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpProgressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  topSpacing: {
    height: 8,
  },
  questionContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 8,
  },
  questionDifficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  questionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    marginLeft: 12,
    padding: 4,
  },
  questionContent: {
    marginTop: 4,
  },
  subjectTopicContainer: {
    marginBottom: 8,
  },
  subjectTopicText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  answerContainer: {
    marginBottom: 32,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  checkAnswerButtonGradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  checkAnswerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    width: "100%",
    gap: 8,
  },
  checkAnswerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  checkAnswerButtonDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
  },
  checkAnswerButtonTextDisabled: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default QuestionScreen;
