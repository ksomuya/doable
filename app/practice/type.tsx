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
import { ArrowLeft, Brain, Repeat, Zap, Check, Lock } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { useUser } from "@clerk/clerk-expo";
import ProgressBar from "../components/ProgressBar";
import { LinearGradient } from "expo-linear-gradient";
import { getAvailablePracticeTypes } from "../utils/practiceUtils";
import { PracticeType } from "../utils/types";

const PracticeTypeScreen = () => {
  const router = useRouter();
  const { practiceProgress, updatePracticeStepInfo } = useAppContext();
  const { user: clerkUser } = useUser();
  const [selectedType, setSelectedType] = useState<PracticeType | null>("recall");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [availableTypes, setAvailableTypes] = useState<{
    recall: boolean;
    refine: boolean;
    conquer: boolean;
  }>({ recall: true, refine: false, conquer: false });
  const [stats, setStats] = useState<{
    recall_attempts: number;
    refine_attempts: number;
    conquer_attempts: number;
  }>({ recall_attempts: 0, refine_attempts: 0, conquer_attempts: 0 });
  const [error, setError] = useState<string | null>(null);

  // Update practice progress when screen loads and fetch available types
  useEffect(() => {
    if (practiceProgress.currentStep !== 2) {
      updatePracticeStepInfo({
        currentStep: 2 // Second step in practice flow
      });
    }

    if (clerkUser?.id) {
      fetchAvailableTypes();
    } else {
      setInitialLoading(false);
    }
  }, [clerkUser?.id]);

  // Fetch available practice types
  const fetchAvailableTypes = async () => {
    try {
      setError(null);
      
      const { available, stats, error } = await getAvailablePracticeTypes(clerkUser?.id || "");
      
      if (error) {
        setError(error);
      } else {
        setAvailableTypes(available);
        setStats(stats);
        
        // Auto-select the highest available practice type
        if (available.conquer) {
          setSelectedType("conquer");
        } else if (available.refine) {
          setSelectedType("refine");
        } else {
          setSelectedType("recall");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch practice types");
    } finally {
      setInitialLoading(false);
    }
  };

  const practiceTypes = [
    {
      id: "refine" as PracticeType,
      title: "Refine",
      description: "Strengthen your weak areas",
      icon: (color: string) => <Brain size={24} color={color} />,
      gradientColors: ["#E0E7FF", "#C7D2FE"] as const,
      borderColor: "#818CF8",
      iconBgColor: "#4F46E5",
      unlockRequirement: 50,
      currentProgress: stats.recall_attempts,
      isUnlocked: availableTypes.refine,
    },
    {
      id: "recall" as PracticeType,
      title: "Recall",
      description: "Sharpen your skills with balanced practice",
      icon: (color: string) => <Repeat size={24} color={color} />,
      gradientColors: ["#FEF3C7", "#FDE68A"] as const,
      borderColor: "#F59E0B",
      iconBgColor: "#D97706",
      unlockRequirement: 0, // Always unlocked
      currentProgress: 0,
      isUnlocked: true,
    },
    {
      id: "conquer" as PracticeType,
      title: "Conquer",
      description: "Test your limits with challenging problems",
      icon: (color: string) => <Zap size={24} color={color} />,
      gradientColors: ["#EDE9FE", "#DDD6FE"] as const,
      borderColor: "#A78BFA",
      iconBgColor: "#7C3AED",
      unlockRequirement: 100,
      currentProgress: Math.min(stats.recall_attempts, stats.refine_attempts),
      isUnlocked: availableTypes.conquer,
    },
  ];

  const handleTypeSelect = (typeId: PracticeType) => {
    const type = practiceTypes.find(t => t.id === typeId);
    if (type && type.isUnlocked) {
      setSelectedType(typeId);
    }
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

  const renderUnlockProgress = (type: typeof practiceTypes[0]) => {
    if (type.isUnlocked || type.unlockRequirement === 0) return null;
    
    const progress = Math.min(type.currentProgress, type.unlockRequirement);
    const percentage = (progress / type.unlockRequirement) * 100;
    
    return (
      <View style={styles.unlockProgressContainer}>
        <View style={styles.progressBarWrapper}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${percentage}%` } 
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {progress} / {type.unlockRequirement} questions solved
        </Text>
      </View>
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading practice options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Practice Types</Text>
          <Text style={styles.errorDescription}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchAvailableTypes}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
              activeOpacity={type.isUnlocked ? 0.7 : 1}
            >
              <LinearGradient
                colors={type.gradientColors}
                style={[
                  styles.typeCard,
                  selectedType === type.id && type.isUnlocked && {
                    borderColor: type.borderColor,
                    borderWidth: 2,
                  },
                  !type.isUnlocked && styles.lockedTypeCard,
                ]}
              >
                <View style={styles.typeHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: type.isUnlocked ? type.iconBgColor : '#9CA3AF' },
                    ]}
                  >
                    {!type.isUnlocked ? (
                      <Lock size={24} color="#FFFFFF" />
                    ) : (
                      type.icon("#FFFFFF")
                    )}
                  </View>
                  <View style={styles.typeTextContainer}>
                    <Text style={[
                      styles.typeTitle,
                      !type.isUnlocked && styles.lockedTypeTitle
                    ]}>
                      {type.title}
                    </Text>
                    <Text style={[
                      styles.typeDescription,
                      !type.isUnlocked && styles.lockedTypeDescription
                    ]}>
                      {type.description}
                    </Text>
                  </View>
                  {selectedType === type.id && type.isUnlocked && (
                    <View style={[styles.checkContainer, { backgroundColor: type.iconBgColor }]}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                
                {renderUnlockProgress(type)}
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
  lockedTypeCard: {
    opacity: 0.7,
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
  lockedTypeTitle: {
    color: "#6B7280",
  },
  typeDescription: {
    fontSize: 14,
    color: "#4B5563",
  },
  lockedTypeDescription: {
    color: "#9CA3AF",
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
  unlockProgressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
  },
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
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PracticeTypeScreen;
