import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useAppContext } from "./context/AppContext";
import {
  fetchEvaluationQuestions,
  saveEvaluationAttempt,
  markEvaluationCompleted,
} from "./utils/evaluationUtils";

// Interface for question object
interface Question {
  id: string;
  text: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty: number;
  topic_id?: string;
  chapter_id?: string;
}

interface EvaluationScreenProps {
  inModal?: boolean;
  onFinish?: () => void;
}

const EvaluationScreen: React.FC<EvaluationScreenProps> = ({ 
  inModal = false,
  onFinish
}) => {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { fetchUserProfile } = useAppContext();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isEvaluationComplete, setIsEvaluationComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  
  // Load questions when the component mounts
  useEffect(() => {
    const loadQuestions = async () => {
      if (!clerkUser?.id) return;
      
      try {
        setIsLoading(true);
        const token = await getToken({ template: 'supabase' });
        const evaluationQuestions = await fetchEvaluationQuestions(
          clerkUser.id,
          token || undefined
        );
        
        if (evaluationQuestions.length === 0) {
          Alert.alert(
            "No Questions Available",
            "We couldn't find any questions for your selected topics. Please add more topics and try again.",
            [
              { text: "OK", onPress: () => handleNavigateHome() }
            ]
          );
          return;
        }
        
        setQuestions(evaluationQuestions);
        setStartTime(Date.now());
      } catch (error) {
        console.error("Error loading evaluation questions:", error);
        Alert.alert(
          "Error",
          "Failed to load evaluation questions. Please try again later.",
          [
            { text: "OK", onPress: () => handleNavigateHome() }
          ]
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, [clerkUser?.id, getToken]);

  // Helper function to handle navigation back to home
  const handleNavigateHome = () => {
    if (inModal && onFinish) {
      onFinish();
    } else {
      router.push("/");
    }
  };
  
  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
  };
  
  // Submit answer for the current question
  const handleSubmitAnswer = async () => {
    if (!selectedOption || !clerkUser?.id || isAnswerSubmitted) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;
    
    // Calculate time spent on this question in seconds
    const endTime = Date.now();
    const questionTimeSpent = Math.round((endTime - startTime) / 1000);
    setTimeSpent(prevTime => prevTime + questionTimeSpent);
    
    try {
      setIsSubmitting(true);
      
      // Save attempt to Supabase
      const token = await getToken({ template: 'supabase' });
      await saveEvaluationAttempt(
        clerkUser.id,
        currentQuestion.id,
        isCorrect,
        selectedOption,
        questionTimeSpent,
        token || undefined
      );
      
      // Update UI state
      setIsAnswerSubmitted(true);
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Move to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setStartTime(Date.now());
    } else {
      completeEvaluation();
    }
  };
  
  // Complete the evaluation
  const completeEvaluation = async () => {
    if (!clerkUser?.id) return;
    
    try {
      setIsSubmitting(true);
      
      // Mark evaluation as completed in Supabase
      const token = await getToken({ template: 'supabase' });
      await markEvaluationCompleted(clerkUser.id, token || undefined);
      
      // Refresh user profile to get updated evaluation status
      await fetchUserProfile();
      
      // Update UI
      setIsEvaluationComplete(true);
    } catch (error) {
      console.error("Error completing evaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle finishing the evaluation
  const handleFinish = () => {
    handleNavigateHome();
  };
  
  // If still loading questions
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED7930" />
          <Text style={styles.loadingText}>Loading your evaluation questions...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // If evaluation is complete, show the summary
  if (isEvaluationComplete) {
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Evaluation Complete</Text>
          </View>
          
          <View style={styles.summaryContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}%</Text>
            </View>
            
            <Text style={styles.summaryTitle}>
              {score >= 70 ? "Great job!" : score >= 40 ? "Good effort!" : "Keep practicing!"}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Questions</Text>
                <Text style={styles.statValue}>{questions.length}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={styles.statValue}>{correctAnswers}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</Text>
              </View>
            </View>
            
            <Text style={styles.summaryDescription}>
              We'll use these results to personalize your practice sessions. 
              Keep practicing to improve your skills!
            </Text>
            
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.finishButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show current question
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrectAnswer = selectedOption === currentQuestion.answer;
  
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          {!inModal && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={22} color="#1F2937" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Initial Evaluation</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
        
        <ScrollView style={styles.content}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  selectedOption === option && styles.optionSelected,
                  isAnswerSubmitted && option === currentQuestion.answer && styles.optionCorrect,
                  isAnswerSubmitted && selectedOption === option && selectedOption !== currentQuestion.answer && styles.optionIncorrect,
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={isAnswerSubmitted}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option && styles.optionTextSelected,
                    isAnswerSubmitted && option === currentQuestion.answer && styles.optionTextCorrect,
                    isAnswerSubmitted && selectedOption === option && selectedOption !== currentQuestion.answer && styles.optionTextIncorrect,
                  ]}
                >
                  {option}
                </Text>
                
                {isAnswerSubmitted && option === currentQuestion.answer && (
                  <CheckCircle size={20} color="#10B981" style={styles.optionIcon} />
                )}
                
                {isAnswerSubmitted && selectedOption === option && selectedOption !== currentQuestion.answer && (
                  <XCircle size={20} color="#EF4444" style={styles.optionIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {isAnswerSubmitted && currentQuestion.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.footer}>
          {!isAnswerSubmitted ? (
            <TouchableOpacity
              style={[styles.submitButton, !selectedOption && styles.buttonDisabled]}
              onPress={handleSubmitAnswer}
              disabled={!selectedOption || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Evaluation"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EvaluationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ED7930",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  optionSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  optionCorrect: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  optionIncorrect: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  optionText: {
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
  },
  optionTextSelected: {
    color: "#4F46E5",
    fontWeight: "500",
  },
  optionTextCorrect: {
    color: "#10B981",
    fontWeight: "500",
  },
  optionTextIncorrect: {
    color: "#EF4444",
    fontWeight: "500",
  },
  optionIcon: {
    marginLeft: 8,
  },
  explanationContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#ED7930",
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  summaryContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ED7930",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  summaryDescription: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  finishButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 100,
  },
  finishButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
}); 