import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, AlertTriangle, Lock } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { useUser } from "@clerk/clerk-expo";
import ProgressBar from "../components/ProgressBar";
import { getAvailableSubjects } from "../utils/practiceUtils";
import { Subject } from "../utils/types";

const PracticeHomeScreen = () => {
  const router = useRouter();
  const { setPracticeStep, updatePracticeStepInfo, practiceProgress, hasStudyTopics } = useAppContext();
  const { user: clerkUser } = useUser();
  
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [selectedLockedSubject, setSelectedLockedSubject] = useState<string>("");

  // Fetch available subjects when component loads
  useEffect(() => {
    setPracticeStep(1, 4); // Step 1 of 4 in the practice flow
    
    if (clerkUser?.id) {
      fetchAvailableSubjects();
    } else {
      setTimeout(() => {
        setInitialLoading(false);
      }, 300);
    }
  }, [clerkUser?.id]);

  // Fetch available subjects based on user exam type
  const fetchAvailableSubjects = async () => {
    try {
      setError(null);
      
      // Use default exam type as JEE if not available
      const examType = "JEE"; // This should ideally come from user preferences
      
      const { subjects, error } = await getAvailableSubjects(
        clerkUser?.id || "", 
        examType
      );
      
      if (error) {
        setError(error);
      } else {
        setSubjectsData(subjects);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch subjects");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubjectSelect = (subjectId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      // Find the subject name
      const subject = subjectsData.find(s => s.id === subjectId);
      if (subject) {
        setSelectedLockedSubject(subject.name);
        setShowLockedModal(true);
      }
      return;
    }
    
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

        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED7930" />
            <Text style={styles.loadingText}>Loading practice session...</Text>
          </View>
        ) : !hasStudyTopics ? (
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
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertTriangle size={32} color="#EF4444" style={styles.warningIcon} />
            <Text style={styles.errorTitle}>Error Loading Subjects</Text>
            <Text style={styles.errorDescription}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchAvailableSubjects}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            <Text style={styles.title}>Subjects</Text>
            <Text style={styles.subtitle}>
              Select any one Subject to start practicing
            </Text>

            <View style={styles.subjectsContainer}>
              {subjectsData.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectItem,
                    selectedSubject === subject.id && subject.is_unlocked && styles.selectedSubjectItem,
                    !subject.is_unlocked && styles.lockedSubjectItem,
                  ]}
                  onPress={() => handleSubjectSelect(subject.id, subject.is_unlocked)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioButton}>
                    {selectedSubject === subject.id && subject.is_unlocked ? (
                      <View style={styles.radioButtonSelected} />
                    ) : !subject.is_unlocked ? (
                      <Lock size={16} color="#9CA3AF" />
                    ) : null}
                  </View>
                  <Text 
                    style={[
                      styles.subjectName,
                      !subject.is_unlocked && styles.lockedSubjectName
                    ]}
                  >
                    {subject.name}
                  </Text>
                  
                  {!subject.is_unlocked && (
                    <Text style={styles.lockedLabel}>Locked</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {!initialLoading && hasStudyTopics && !error && (
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

        {/* Locked Subject Modal */}
        <Modal
          visible={showLockedModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLockedModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Lock size={32} color="#4F46E5" style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Subject Locked</Text>
              <Text style={styles.modalDescription}>
                You need to add at least one topic from {selectedLockedSubject} to unlock this subject for practice.
              </Text>
              <TouchableOpacity 
                style={styles.addTopicsModalButton}
                onPress={() => {
                  setShowLockedModal(false);
                  router.push("/");
                }}
              >
                <Text style={styles.addTopicsModalButtonText}>Go to Add Topics</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLockedModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

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
  lockedSubjectItem: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
    opacity: 0.8,
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
    flex: 1,
  },
  lockedSubjectName: {
    color: "#9CA3AF",
  },
  lockedLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  addTopicsModalButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  addTopicsModalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
    width: "100%",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PracticeHomeScreen;
