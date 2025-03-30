import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Focus, Clock, BrainCircuit } from "lucide-react-native";
import { colors, typography, spacing, buttonStyles, layoutStyles } from "../styles/designSystem";

export default function DistractionBlockerScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const handleGetStarted = () => {
    router.push("/distraction-blocker/setup");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Remove Distractions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Focus size={120} color={colors.primary} style={styles.illustration} />
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>Focus Better, Learn Faster</Text>
        <Text style={styles.description}>
          Stay on track with your studies by reducing digital distractions. 
          This feature helps you be more mindful of your app usage and build 
          better study habits.
        </Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Focus size={24} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Block Distracting Apps</Text>
              <Text style={styles.featureDescription}>
                Choose which social media and entertainment apps you want to limit
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Clock size={24} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Mindful Breathing</Text>
              <Text style={styles.featureDescription}>
                Brief breathing exercises when you try to access blocked apps
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <BrainCircuit size={24} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Build Better Habits</Text>
              <Text style={styles.featureDescription}>
                Track progress and redirect your attention to productive activities
              </Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            This feature requires special permissions to monitor app usage and display overlay screens.
            We'll guide you through the setup process.
          </Text>
        </View>
      </ScrollView>

      {/* Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.subtitle,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.xl,
  },
  illustration: {
    opacity: 0.9,
  },
  title: {
    ...typography.largeTitle,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  featuresContainer: {
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.caption,
  },
  noteContainer: {
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  noteText: {
    ...typography.caption,
    color: colors.textLight,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  getStartedButton: {
    ...buttonStyles.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedButtonText: {
    ...typography.button,
    marginRight: spacing.sm,
  },
}); 