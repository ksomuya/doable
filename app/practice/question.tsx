import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Flag, Bookmark, CheckCircle, Clock, Award, Zap, ChevronRight, HelpCircle, X, AlertTriangle } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/clerk-expo";
import { PracticeType } from "../utils/types";
import { Database } from "../../supabase/functions/_shared/database.types"; // Import Database type

import QuestionDisplay from "../components/QuestionDisplay";
import AnswerOptions from "../components/AnswerOptions";
import ProgressBar from "../components/ProgressBar";
import AnswerFeedbackModal from "../components/AnswerFeedbackModal";
import QuestionReportModal from "../components/QuestionReportModal";
import BookmarkButton from "../components/BookmarkButton";
import StreakIndicator from "../components/StreakIndicator";
import usePracticeTracker from "../hooks/usePracticeTracker";

// --- Type Definitions ---
type QuestionDifficulty = "Easy" | "Medium" | "Hard";

// Use imported Database type
type ApiQuestion = Database["public"]["Tables"]["questions"]["Row"];

// --- Add types for API data ---
type PracticeNextResponse = {
  delivery_uuid: string;
  question: ApiQuestion;
  xp_so_far: number;
  xp_goal: number;
  bonus_active: boolean;
  mix_snapshot: Record<string, number>; // Placeholder
  error?: string; // Add optional error field from backend
};
type PracticeAnswerResponse = {
  success: boolean;
  is_correct: boolean;
  xp_awarded: number;
  error?: string; // Add optional error field from backend
};

// Helper function to safely parse question options
const parseOptions = (optionsJson: ApiQuestion['options']) => {
  if (!optionsJson) return [];
  try {
    const parsed = optionsJson as any;
    let optionsArray: any[];

    if (typeof parsed === 'string') {
      optionsArray = JSON.parse(parsed);
    } else if (Array.isArray(parsed)) {
      optionsArray = parsed;
    } else {
      console.warn("Options JSON is not an array or string:", parsed);
      return [];
    }

    // Check if it's already the correct format (array of objects)
    if (optionsArray.length > 0 && typeof optionsArray[0] === 'object' && optionsArray[0] !== null && 'id' in optionsArray[0] && 'text' in optionsArray[0]) {
      // Assume it's the correct format
      return optionsArray; 
    } 
    // Check if it's an array of strings
    else if (optionsArray.length > 0 && typeof optionsArray[0] === 'string') {
       console.log("Mapping array of strings to options objects...");
       // Map array of strings to the {id, text} format
       const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
       return optionsArray.map((text, index) => ({
         id: alphabet[index] || index.toString(), // Use A, B, C... or index as ID
         text: String(text) // Ensure text is a string
       }));
    } 
    // Otherwise, invalid structure
    else {
      console.warn("Parsed options array has invalid structure or is empty:", optionsArray);
      return [];
    }
  } catch (error) {
    console.error("Failed to parse question options JSON:", error, "Input:", optionsJson);
    return [];
  }
};

const QuestionScreen = () => {
  const { subject, type, sessionId: sessionIdParam } = useLocalSearchParams<{ subject: string; type: string; sessionId: string }>();
  const { 
    updatePracticeStepInfo, 
    practiceProgress, 
    isFirstPracticeSession, 
  } = useAppContext();

  const practiceTracker = usePracticeTracker(type as PracticeType || 'recall');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // --- State Management ---
  const [currentQuestion, setCurrentQuestion] = useState<ApiQuestion | null>(null);
  const [deliveryUuid, setDeliveryUuid] = useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const [currentXP, setCurrentXP] = useState(0);
  const [goalXP, setGoalXP] = useState(practiceProgress.goal || 200); // Get goal from context
  const [isBonusActive, setIsBonusActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false); // Will be set by API response
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0); // Maybe remove if answer check is backend only
  const [streak, setStreak] = useState(0); // Needs to be updated based on API response
  const [showStreakIndicator, setShowStreakIndicator] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [timerStart, setTimerStart] = useState(Date.now());
  const [showNewUnlockAlert, setShowNewUnlockAlert] = useState(false);
  const [newUnlockType, setNewUnlockType] = useState<string>("");
  const [parsedOptions, setParsedOptions] = useState(() => parseOptions(null));

  const { userId } = useAuth(); // Get userId directly

  // Screen width for responsive styling
  const screenWidth = Dimensions.get('window').width;

  // --- API Call Logic ---
  const fetchNextQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    setQuestionError(null);
    setSelectedAnswer(null); // Reset selection for new question
    setAnswerError(null); // Clear previous answer errors
    fadeAnim.setValue(0); // Reset animation
    slideAnim.setValue(20);

    // Check for userId and sessionIdParam directly
    if (!userId) {
      setQuestionError("User not authenticated.");
      setIsLoadingQuestion(false);
      return;
    }
    if (!sessionIdParam) {
      setQuestionError("Session ID is missing. Please restart the practice.");
      setIsLoadingQuestion(false);
      return;
    }

    try {
      const functionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/practice-next`;
      console.log(`Fetching next question from ${functionUrl} for session ${sessionIdParam}`);

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          user_id: userId, // Add userId
          session_id: sessionIdParam // Add sessionId
         }), 
      });

      const result: PracticeNextResponse = await response.json();

      if (!response.ok) {
        console.error("Practice next API error:", result);
        // Use optional chaining for error property or construct message
        throw new Error(result?.error || `Failed to fetch next question (${response.status})`); 
      }

      console.log("Received question:", result.question.id, "Delivery UUID:", result.delivery_uuid);
      setCurrentQuestion(result.question);
      setParsedOptions(parseOptions(result.question.options)); // Set state, type inference handles it
      setDeliveryUuid(result.delivery_uuid);
      // Update progress based on response
      setCurrentXP(result.xp_so_far);
      setGoalXP(result.xp_goal);
      setIsBonusActive(result.bonus_active);
      // TODO: Use mix_snapshot if needed

      // Reset timer for new question
      setTimerStart(Date.now());
      if (timer) clearInterval(timer);
      const newTimer = setInterval(() => {
        // Calculate total time, might need adjustment based on how you track session time
         setTimeSpent((prev) => prev + 1);
      }, 1000);
      setTimer(newTimer);

      // Start animations for the new question
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (error: any) {
      console.error("Error fetching next question:", error);
      setQuestionError(error.message || "Could not load the next question.");
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [userId, sessionIdParam, timer]);

  // Fetch the first question when the component mounts
  useEffect(() => {
    if (sessionIdParam) { // Ensure we have the session ID from navigation
        console.log("Question screen mounted for session:", sessionIdParam);
        fetchNextQuestion();
    }

    // Update context step if needed
    if (practiceProgress.currentStep !== 4) {
      updatePracticeStepInfo({
        currentStep: 4 // This is the question step
      });
    }

    return () => {
      // Cleanup timer on unmount
      if (timer) clearInterval(timer);
    };
  }, [sessionIdParam]); // Depend on sessionIdParam from navigation

  // Check for new practice type unlocks
  useEffect(() => {
    if (practiceTracker.newUnlocks.length > 0) {
      const latestUnlock = practiceTracker.newUnlocks[0];
      setNewUnlockType(latestUnlock);
      setShowNewUnlockAlert(true);
    }
  }, [practiceTracker.newUnlocks]);

  // Show alert for new practice type unlocks
  useEffect(() => {
    if (showNewUnlockAlert && newUnlockType) {
      const unlockName = newUnlockType.charAt(0).toUpperCase() + newUnlockType.slice(1);
      Alert.alert(
        `🎉 ${unlockName} Mode Unlocked!`,
        `You've unlocked the ${unlockName} practice mode! Try it out in your next session.`,
        [{ text: "Awesome!", onPress: () => setShowNewUnlockAlert(false) }]
      );
    }
  }, [showNewUnlockAlert, newUnlockType]);

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
  }, [currentQuestion]);

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

  // Handle answer selection
  const handleAnswerSelected = (optionId: string) => {
    setSelectedAnswer(optionId);
  };
  
  // Handle check answer - NOW CALLS API (modified)
  const handleCheckAnswer = async () => {
    // Check for userId and sessionIdParam
    if (!userId) { setAnswerError("User not authenticated."); return; }
    if (!sessionIdParam) { setAnswerError("Session ID missing."); return; }
    if (!selectedAnswer || !deliveryUuid) {
        setAnswerError("Please select an answer.");
        return;
    }

    setIsSubmittingAnswer(true);
    setAnswerError(null);
    const questionTimeSpent = Math.floor((Date.now() - timerStart) / 1000);

    try {
        const functionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/practice-answer`;
        console.log(`Submitting answer for delivery ${deliveryUuid} to ${functionUrl}`);

        const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId, // Add userId
                session_id: sessionIdParam, // Add sessionId
                delivery_uuid: deliveryUuid,
                answer: selectedAnswer,
                time_taken_seconds: questionTimeSpent,
            }),
        });

        const result: PracticeAnswerResponse = await response.json();

        if (!response.ok || !result.success) {
            console.error("Practice answer API error:", result);
             // Use optional chaining for error property or construct message
            throw new Error(result?.error || `Failed to submit answer (${response.status})`);
        }

        console.log("Answer submitted successfully:", result);

        // --- Update state based on API response --- //
        setIsAnswerCorrect(result.is_correct);
        setQuestionsAnswered((prev) => prev + 1);

        if (result.is_correct) {
            setCorrectAnswers((prev) => prev + 1);
            setStreak((prev) => prev + 1);
            setShowStreakIndicator(true);
            // Hide streak indicator after a delay
            setTimeout(() => {
                setShowStreakIndicator(false);
            }, 3000);
        } else {
            setStreak(0); // Reset streak
        }

        // Update XP - Use XP from response and add to previous XP state
        // Fetching the total XP from /practice/next might be more reliable
        // For now, just update based on award:
        const newXp = currentXP + (result.xp_awarded || 0);
        setCurrentXP(Math.min(newXp, goalXP));

        // TODO: Update context with progress more accurately?
        // updatePracticeProgress(result.xp_awarded || 0, result.is_correct, questionTimeSpent);

        // Track attempt using practice tracker hook (optional, depends if backend does all tracking)
        // practiceTracker.trackAttempt({ ... });

        setShowFeedbackModal(true); // Show feedback modal

    } catch (error: any) {
        console.error("Error submitting answer:", error);
        setAnswerError(error.message || "Could not submit your answer.");
    } finally {
        setIsSubmittingAnswer(false);
    }
  };

  // Handle navigation back to practice selection
  const handleGoBack = () => {
    router.back();
  };

  // Handle navigation to next question - NOW FETCHES FROM API (no change needed here)
  const handleNextQuestion = () => {
    setShowFeedbackModal(false);
    // Reset local state for the next question
    setSelectedAnswer(null);
    setIsAnswerCorrect(false);
    setAnswerError(null);

    // Check if goal XP is reached based on latest state
    if (currentXP >= goalXP) {
      console.log("XP goal reached, navigating to summary.");
      handleEndSession(true); // End session before navigating
    } else {
      console.log("Fetching next question...");
      fetchNextQuestion(); // Fetch the next question from the API
    }
  };

  // Handle ending the session (modified)
  const handleEndSession = useCallback(async (goalReached = false) => {
      // Check for userId and sessionIdParam
      if (!userId) {
          console.warn("Cannot end session: No user ID.");
          navigateToSummary(goalReached);
          return;
      }
      if (!sessionIdParam) {
          console.warn("Cannot end session: No session ID.");
          navigateToSummary(goalReached);
          return;
      }

      console.log(`Attempting to end session ${sessionIdParam}...`);
      // Stop the timer
      if (timer) clearInterval(timer);
      setTimer(null);

      try {
          const functionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/practice-end`;
          const response = await fetch(functionUrl, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                 user_id: userId, // Add userId
                 session_id: sessionIdParam // Add sessionId
              }),
          });

          const result = await response.json();

          if (!response.ok) {
              console.error("Practice end API error:", result);
          } else {
              console.log("Session ended successfully on backend.");
          }
      } catch (error: any) {
          console.error("Error ending session via API:", error);
      } finally {
          // Navigate regardless of API call success/failure
          navigateToSummary(goalReached);
      }
  }, [userId, sessionIdParam, timer]);

  // Navigate to summary screen
  const navigateToSummary = (goalReached: boolean) => {
    console.log("Navigating to summary/rewards...");
    // Reset practice tracker
    practiceTracker.resetTracker();

    const sessionStats = practiceTracker.getSessionStats(); // Use tracker stats for summary

    // Determine destination based on first session or not
    const destination = isFirstPracticeSession()
      ? "/practice/streak-setup"
      : "/practice/rewards-chest";

    router.push({
      pathname: destination as any,
      params: {
        questionsAnswered: questionsAnswered.toString(),
        correctAnswers: correctAnswers.toString(),
        xpEarned: currentXP.toString(), // Send final XP
        goalXP: goalXP.toString(),
        averageTime: Math.round(sessionStats.averageTime).toString(),
        accuracy: Math.round(sessionStats.accuracy).toString(),
        goalReached: goalReached.toString(),
        subject: subject as string,
        type: type as string,
      },
    });
  };

  // Handle try again
  const handleTryAgain = () => {
    setShowFeedbackModal(false);
    setSelectedAnswer(null);
    // Reset attempt count? Might not be needed if backend validates
    // setAttemptCount(0);
  };

  // Handle see answer - Needs parsed options
  const handleSeeAnswer = () => {
    setShowFeedbackModal(true);
    // Correct answer text retrieval uses parsedOptions
    const correctAnswerText = parsedOptions.find(o => o.id === currentQuestion?.correct_answer)?.text || "N/A";
    console.log("Showing correct answer:", correctAnswerText); // For debugging
    // The modal itself needs updating to potentially display this directly
  };

  // Handle report submission
  const handleReportSubmit = (reason: string, details: string) => {
    console.log(`Question reported: ${currentQuestion?.id}`);
    console.log(`Reason: ${reason}`);
    console.log(`Details: ${details}`);
    // TODO: Implement actual API call to report question
  };

  // Handle bookmark toggle
  const handleToggleBookmark = (questionId: string, isBookmarked: boolean) => {
    // TODO: Implement API call to save/remove bookmark
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

  if (isLoadingQuestion && !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questionError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorDescription}>{questionError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNextQuestion}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.endButton} onPress={() => handleEndSession(false)}>
            <Text style={styles.endButtonText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
     return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <HelpCircle size={48} color="#6B7280" />
          <Text style={styles.errorTitle}>No Question Loaded</Text>
          <Text style={styles.errorDescription}>Could not load a question. Please try ending the session.</Text>
          <TouchableOpacity style={styles.endButton} onPress={() => handleEndSession(false)}>
            <Text style={styles.endButtonText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Find correct answer text using parsed options for the modal
  const correctAnswerText = parsedOptions.find(o => o.id === currentQuestion?.correct_answer)?.text || "N/A";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.container}>
        {/* End session button at top right */}
        <TouchableOpacity
          style={styles.endSessionButton}
          onPress={() => handleEndSession(false)}
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
                    Question {questionsAnswered + 1}
                  </Text>
                  <Text style={styles.questionDifficultyText}>
                    {currentQuestion.difficulty}
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
                    {subject as string} • {type as string}
                  </Text>
                </View>
                <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
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
                options={parsedOptions}
                onAnswerSelected={handleAnswerSelected}
                showExplanation={false}
                selectedOption={selectedAnswer}
                disabled={showFeedbackModal || isSubmittingAnswer}
              />
             {answerError && <Text style={styles.errorText}>{answerError}</Text>}
            </Animated.View>
          </ScrollView>

          {/* Answer Feedback Modal */}
          <AnswerFeedbackModal
            visible={showFeedbackModal}
            onClose={handleNextQuestion}
            isCorrect={isAnswerCorrect}
            explanation={currentQuestion.explanation || "Explanation not available."}
            correctAnswer={correctAnswerText}
            hint={currentQuestion.hint || "Hint not available."}
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
            <View style={styles.checkButtonContainer}>
              <TouchableOpacity
                style={[styles.checkButton, (!selectedAnswer || showFeedbackModal || isSubmittingAnswer) && styles.disabledButton]}
                onPress={handleCheckAnswer}
                disabled={!selectedAnswer || showFeedbackModal || isSubmittingAnswer}
              >
                {isSubmittingAnswer ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.checkAnswerButtonText}>Check Answer</Text>
                )}
              </TouchableOpacity>
            </View>
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
  checkButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16, // Adjust padding based on platform
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF' // Match footer background
  },
  checkButton: {
    backgroundColor: "#10B981", // Green color for check button
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  checkAnswerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB", // Gray out when disabled
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  bottomSpacing: { height: 40 }, // Add spacing at the bottom of scroll view
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  errorTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 12,
      textAlign: 'center',
  },
  errorDescription: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: 24,
  },
  retryButton: {
      backgroundColor: '#4F46E5',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 100,
      marginBottom: 12,
  },
  retryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
  },
    endButton: {
      backgroundColor: '#DC2626',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 100,
  },
  endButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
  },
});

export default QuestionScreen;
