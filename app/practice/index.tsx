import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, BookOpen, Clock, Award, Zap, AlertTriangle, TrendingUp } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { useUser, useAuth } from "@clerk/clerk-expo";
import ProgressBar from "../components/ProgressBar";
import { hasAtLeastOneTopic } from "../utils/chapterUtils";
import { hasCompletedEvaluation } from "../utils/evaluationUtils";

interface Subject {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

const subjects: Subject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
  },
  {
    id: "physics",
    name: "Physics",
  },
  {
    id: "chemistry",
    name: "Chemistry",
  },
];

const PracticeHomeScreen = () => {
  const router = useRouter();
  const { isFirstPracticeSession, setPracticeStep, updatePracticeStepInfo, practiceProgress } = useAppContext();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingTopics, setCheckingTopics] = useState(true);
  const [hasTopics, setHasTopics] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [evaluationCompleted, setEvaluationCompleted] = useState(true); // Default to true to avoid showing evaluation unnecessarily

  // Set initial step when component loads
  useEffect(() => {
    setPracticeStep(1, 4); // Step 1 of 4 in the practice flow
  }, []);

  // Check if the user has at least one topic and if evaluation is completed
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!clerkUser?.id) return;
      
      try {
        setCheckingTopics(true);
        const token = await getToken({ template: 'supabase' });
        
        // Check for topics in parallel
        const [topicsExist, evalCompleted] = await Promise.all([
          hasAtLeastOneTopic(clerkUser.id, token || undefined),
          hasCompletedEvaluation(clerkUser.id, token || undefined)
        ]);
        
        setHasTopics(topicsExist);
        setEvaluationCompleted(evalCompleted);
        console.log("User status:", { topicsExist, evalCompleted });
      } catch (error) {
        console.error("Error checking user status:", error);
      } finally {
        setCheckingTopics(false);
        setIsFirstLoad(false);
      }
    };
    
    checkUserStatus();
  }, [clerkUser?.id, getToken]);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleContinue = () => {
    if (!selectedSubject) return;

    // Update practice progress in context
    updatePracticeStepInfo({
      subject: selectedSubject,
      currentStep: 2 // Moving to step 2
    });

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/practice/type");
    }, 300);
  };

  const handleAddTopics = () => {
    router.push("/");
  };

  const handleEvaluationStart = () => {
    // Use a different approach to navigate to evaluation
    router.push({
      pathname: "/",
      params: { showEvaluation: "true" }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <ProgressBar 
              currentStep={practiceProgress.currentStep} 
              totalSteps={practiceProgress.totalSteps}
              style={styles.progressBar}
            />
          </View>
          <View style={styles.placeholder} />
        </View>

        {checkingTopics ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED7930" />
            <Text style={styles.loadingText}>Checking your progress...</Text>
          </View>
        ) : !hasTopics ? (
          <ScrollView style={styles.content}>
            <Text style={styles.title}>Add Topics First</Text>
            <Text style={styles.subtitle}>
              Please select at least one topic from the home screen before starting a practice session.
            </Text>

            <View style={styles.noTopicsCard}>
              <AlertTriangle size={32} color="#ED7930" style={styles.warningIcon} />
              <Text style={styles.noTopicsTitle}>No Topics Selected</Text>
              <Text style={styles.noTopicsDescription}>
                You need to add topics you've studied before you can practice. This helps us personalize your learning experience.
              </Text>
              
              <TouchableOpacity 
                style={styles.addTopicsButton}
                onPress={handleAddTopics}
              >
                <Text style={styles.addTopicsButtonText}>Add Topics</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : !evaluationCompleted ? (
          <ScrollView style={styles.content}>
            <Text style={styles.title}>Initial Evaluation</Text>
            <Text style={styles.subtitle}>
              Complete a quick evaluation to help us personalize your learning experience.
            </Text>

            <View style={styles.evaluationCard}>
              <TrendingUp size={28} color="#4F46E5" style={styles.evaluationIcon} />
              <Text style={styles.evaluationTitle}>Start Your Evaluation</Text>
              <Text style={styles.evaluationDescription}>
                Answer a few questions based on your selected topics. This will help us understand your current knowledge level.
              </Text>
              
              <TouchableOpacity 
                style={styles.evaluationButton}
                onPress={handleEvaluationStart}
              >
                <Text style={styles.evaluationButtonText}>Start Evaluation</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.content}>
            <Text style={styles.title}>Subjects</Text>
            <Text style={styles.subtitle}>
              Select any one Subject to start practicing
            </Text>

            <View style={styles.subjectsContainer}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectItem,
                    selectedSubject === subject.id && styles.selectedSubjectItem,
                  ]}
                  onPress={() => handleSubjectSelect(subject.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioButton}>
                    {selectedSubject === subject.id && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {!checkingTopics && hasTopics && evaluationCompleted && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedSubject && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={!selectedSubject || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PracticeHomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressBar: {
    height: 4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  subjectsContainer: {
    marginBottom: 40,
  },
  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  selectedSubjectItem: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4F46E5",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5",
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  noTopicsCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  warningIcon: {
    marginBottom: 12,
  },
  noTopicsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  noTopicsDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
  },
  addTopicsButton: {
    backgroundColor: "#ED7930",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
  },
  addTopicsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  evaluationCard: {
    backgroundColor: "#E0E7FF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  evaluationIcon: {
    marginBottom: 12,
  },
  evaluationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  evaluationDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
  },
  evaluationButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
  },
  evaluationButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
