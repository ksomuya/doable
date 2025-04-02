import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, BookOpen, Clock, Award, Zap } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import ProgressBar from "../components/ProgressBar";

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
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set initial step when component loads
  useEffect(() => {
    setPracticeStep(1, 4); // Step 1 of 4 in the practice flow
  }, []);

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
});
