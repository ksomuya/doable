import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Brain, Repeat, Zap, Check } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import ProgressBar from "../components/ProgressBar";
import { LinearGradient } from "expo-linear-gradient";

const PracticeTypeScreen = () => {
  const router = useRouter();
  const { practiceProgress, updatePracticeStepInfo } = useAppContext();
  const [selectedType, setSelectedType] = useState<string | null>("refine");
  const [isLoading, setIsLoading] = useState(false);

  // Update practice progress when screen loads
  useEffect(() => {
    if (practiceProgress.currentStep !== 2) {
      updatePracticeStepInfo({
        currentStep: 2 // Second step in practice flow
      });
    }
  }, []);

  const practiceTypes = [
    {
      id: "refine",
      title: "Refine",
      description: "Strengthen your weak areas",
      icon: (color: string) => <Brain size={24} color={color} />,
      gradientColors: ["#E0E7FF", "#C7D2FE"] as const,
      borderColor: "#818CF8",
      iconBgColor: "#4F46E5",
    },
    {
      id: "recall",
      title: "Recall",
      description: "Sharpen your skills with balanced practice",
      icon: (color: string) => <Repeat size={24} color={color} />,
      gradientColors: ["#FEF3C7", "#FDE68A"] as const,
      borderColor: "#F59E0B",
      iconBgColor: "#D97706",
    },
    {
      id: "conquer",
      title: "Conquer",
      description: "Test your limits with challenging problems",
      icon: (color: string) => <Zap size={24} color={color} />,
      gradientColors: ["#EDE9FE", "#DDD6FE"] as const,
      borderColor: "#A78BFA",
      iconBgColor: "#7C3AED",
    },
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleContinue = () => {
    if (!selectedType) return;

    // Update practice progress in context
    updatePracticeStepInfo({
      type: selectedType as "refine" | "recall" | "conquer",
      currentStep: 3 // Moving to step 3
    });

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/practice/goal");
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.title}>Practice Mode</Text>
        <Text style={styles.subtitle}>
          Select what you want to focus on in this practice session
        </Text>

        <View style={styles.typesContainer}>
          {practiceTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.typeCardContainer}
              onPress={() => handleTypeSelect(type.id)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={type.gradientColors}
                style={[
                  styles.typeCard,
                  selectedType === type.id && {
                    borderColor: type.borderColor,
                    borderWidth: 2,
                  },
                ]}
              >
                <View style={styles.typeHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: type.iconBgColor },
                    ]}
                  >
                    {type.icon("#FFFFFF")}
                  </View>
                  <View style={styles.typeTextContainer}>
                    <Text style={styles.typeTitle}>{type.title}</Text>
                    <Text style={styles.typeDescription}>
                      {type.description}
                    </Text>
                  </View>
                  {selectedType === type.id && (
                    <View style={[styles.checkContainer, { backgroundColor: type.iconBgColor }]}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedType || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  typesContainer: {
    marginBottom: 40,
  },
  typeCardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  typeTextContainer: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: "#4B5563",
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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

export default PracticeTypeScreen;
