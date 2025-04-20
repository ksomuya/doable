import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, AlertTriangle, Lock, BookOpen, Atom, Beaker, BookOpenCheck } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { useUser } from "@clerk/clerk-expo";
import ProgressBar from "../components/ProgressBar";
import { getAvailableSubjects } from "../utils/practiceUtils";
import { Subject } from "../utils/types";
import { LinearGradient } from "expo-linear-gradient";

// Subject icons mapping
const SubjectIcons = {
  Mathematics: (color: string) => <BookOpen size={24} color={color} />,
  Physics: (color: string) => <Atom size={24} color={color} />,
  Chemistry: (color: string) => <Beaker size={24} color={color} />,
};

// Subject gradient colors
const SubjectGradients = {
  Mathematics: ["#EEF2FF", "#C7D2FE"] as [string, string],
  Physics: ["#F0FDFA", "#99F6E4"] as [string, string],
  Chemistry: ["#FEF3C7", "#FDE68A"] as [string, string],
};

// Subject border colors
const SubjectBorders = {
  Mathematics: "#818CF8",
  Physics: "#2DD4BF",
  Chemistry: "#F59E0B",
};

// Replace the image with an icon in the noTopicsCard
const NoTopicsCard = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.noTopicsCard}>
    <View style={styles.emptyStateIconContainer}>
      <BookOpenCheck size={64} color="#4F46E5" />
    </View>
    <Text style={styles.noTopicsTitle}>No Topics Selected</Text>
    <Text style={styles.noTopicsDescription}>
      You need to add topics you've studied before you can practice. This helps us personalize your learning experience.
    </Text>
    
    <TouchableOpacity 
      style={styles.addTopicsButton}
      onPress={onPress}
    >
      <Text style={styles.addTopicsButtonText}>Add Topics</Text>
    </TouchableOpacity>
  </View>
);

// Replace the image with an icon in the lockedModal
const LockedModal = ({ visible, subject, onCancel, onAddTopics }: { 
  visible: boolean; 
  subject: string; 
  onCancel: () => void; 
  onAddTopics: () => void; 
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.lockedIconContainer}>
          <Lock size={48} color="#4F46E5" />
        </View>
        <Text style={styles.modalTitle}>Subject Locked</Text>
        <Text style={styles.modalDescription}>
          You need to add at least one topic from {subject} to unlock this subject for practice.
        </Text>
        <TouchableOpacity 
          style={styles.addTopicsModalButton}
          onPress={onAddTopics}
        >
          <Text style={styles.addTopicsModalButtonText}>Go to Add Topics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const PracticeHomeScreen = () => {
  const router = useRouter();
  const { setPracticeStep, updatePracticeStepInfo, practiceProgress, hasStudyTopics } = useAppContext();
  const { user: clerkUser } = useUser();
  const { width } = Dimensions.get("window");
  
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [selectedLockedSubject, setSelectedLockedSubject] = useState<string>("");
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

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

  // Run entrance animation when data is loaded
  useEffect(() => {
    if (!initialLoading && !error) {
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
    }
  }, [initialLoading, error]);

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

  const handleCloseLockedModal = () => {
    setShowLockedModal(false);
  };

  const handleGoToAddTopics = () => {
    setShowLockedModal(false);
    router.push("/");
  };

  // Helper to get icon for subject
  const getSubjectIcon = (subjectName: string, isUnlocked: boolean) => {
    const color = isUnlocked ? "#FFFFFF" : "#9CA3AF";
    const IconComponent = SubjectIcons[subjectName as keyof typeof SubjectIcons];
    return IconComponent ? IconComponent(color) : <BookOpen size={24} color={color} />;
  };

  // Helper to get gradient colors for subject
  const getSubjectGradient = (subjectName: string) => {
    return SubjectGradients[subjectName as keyof typeof SubjectGradients] || ["#F9FAFB", "#F3F4F6"];
  };

  // Helper to get border color for subject
  const getSubjectBorder = (subjectName: string) => {
    return SubjectBorders[subjectName as keyof typeof SubjectBorders] || "#E5E7EB";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={["#FFFFFF", "#F9FAFB"]}
        style={styles.container}
      >
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
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading practice session...</Text>
          </View>
        ) : !hasStudyTopics ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Add Topics First</Text>
            <Text style={styles.subtitle}>
              Please select at least one topic from the home screen before starting a practice session.
            </Text>

            <NoTopicsCard onPress={handleAddTopics} />
          </ScrollView>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertTriangle size={48} color="#EF4444" style={styles.warningIcon} />
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
          <Animated.ScrollView 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]} 
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Choose a Subject</Text>
            <Text style={styles.subtitle}>
              Select any one subject to start practicing
            </Text>

            <View style={styles.subjectsContainer}>
              {subjectsData.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectItem,
                    subject.is_unlocked ? styles.unlockedSubjectItem : styles.lockedSubjectItem,
                    selectedSubject === subject.id && subject.is_unlocked && {
                      borderColor: getSubjectBorder(subject.name),
                      borderWidth: 2,
                    }
                  ]}
                  onPress={() => handleSubjectSelect(subject.id, subject.is_unlocked)}
                  activeOpacity={subject.is_unlocked ? 0.7 : 1}
                >
                  <LinearGradient
                    colors={subject.is_unlocked ? getSubjectGradient(subject.name) : ["#F3F4F6", "#E5E7EB"]}
                    style={[
                      styles.subjectItemContent,
                      !subject.is_unlocked && styles.lockedSubjectItemContent
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={[
                      styles.iconContainer,
                      {
                        backgroundColor: subject.is_unlocked 
                          ? getSubjectBorder(subject.name)
                          : "#9CA3AF"
                      }
                    ]}>
                      {!subject.is_unlocked ? (
                        <Lock size={22} color="#FFFFFF" />
                      ) : (
                        getSubjectIcon(subject.name, true)
                      )}
                    </View>
                    
                    <View style={styles.subjectTextContainer}>
                      <Text 
                        style={[
                          styles.subjectName,
                          !subject.is_unlocked && styles.lockedSubjectName
                        ]}
                      >
                        {subject.name}
                      </Text>
                      
                      {!subject.is_unlocked && (
                        <View style={styles.lockedBadgeContainer}>
                          <Lock size={12} color="#9CA3AF" />
                          <Text style={styles.lockedLabel}>Locked</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.radioButton}>
                      {selectedSubject === subject.id && subject.is_unlocked && (
                        <View style={[
                          styles.radioButtonSelected,
                          { backgroundColor: getSubjectBorder(subject.name) }
                        ]} />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.bottomSpacing} />
          </Animated.ScrollView>
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

        {/* Use the LockedModal component */}
        <LockedModal
          visible={showLockedModal}
          subject={selectedLockedSubject}
          onCancel={handleCloseLockedModal}
          onAddTopics={handleGoToAddTopics}
        />
      </LinearGradient>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
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
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "transparent",
  },
  unlockedSubjectItem: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lockedSubjectItem: {
    borderColor: "#E5E7EB",
    opacity: 0.8,
  },
  subjectItemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  lockedSubjectItemContent: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  subjectTextContainer: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  lockedSubjectName: {
    color: "#6B7280",
  },
  lockedBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lockedLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginLeft: 4,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4F46E5",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    backgroundColor: "#4F46E5",
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
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#EEF2FF",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  warningIcon: {
    marginBottom: 20,
  },
  noTopicsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  noTopicsDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  addTopicsButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
    width: "100%",
  },
  addTopicsButtonText: {
    color: "white",
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 100,
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
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
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  lockedIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#EEF2FF",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  addTopicsModalButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  addTopicsModalButtonText: {
    color: "white",
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 40,
  }
});

export default PracticeHomeScreen;
