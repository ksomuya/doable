import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react-native";
import { colors, typography, spacing, buttonStyles } from "../styles/designSystem";
import * as IntentLauncher from 'expo-intent-launcher';

export default function SetupScreen() {
  const router = useRouter();
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [usageStatsEnabled, setUsageStatsEnabled] = useState(false);

  // This is a simulation since we can't check these permissions directly without native modules
  // In a real implementation, you'd use native modules to check these permissions
  useEffect(() => {
    // Simulate checking permissions
    const checkPermissions = async () => {
      if (Platform.OS === 'android') {
        // These would be actual permission checks in a real implementation
        // For now, just simulating
        setAccessibilityEnabled(false);
        setOverlayEnabled(false);
        setUsageStatsEnabled(false);
      }
    };

    checkPermissions();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleContinue = () => {
    if (Platform.OS === 'android') {
      if (!accessibilityEnabled || !overlayEnabled || !usageStatsEnabled) {
        Alert.alert(
          "Missing Permissions",
          "Please enable all required permissions to continue.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    
    // Navigate to the app selection screen
    router.push("app-selection");
  };

  const openAccessibilitySettings = async () => {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.ACCESSIBILITY_SETTINGS
        );
        // In real app, would check if permission was granted when focus returns
        setAccessibilityEnabled(true);
      } catch (error) {
        console.error("Error opening accessibility settings:", error);
      }
    }
  };

  const openOverlaySettings = async () => {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(
          'android.settings.action.MANAGE_OVERLAY_PERMISSION'
        );
        // In real app, would check if permission was granted when focus returns
        setOverlayEnabled(true);
      } catch (error) {
        console.error("Error opening overlay settings:", error);
      }
    }
  };

  const openUsageAccessSettings = async () => {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(
          'android.settings.USAGE_ACCESS_SETTINGS'
        );
        // In real app, would check if permission was granted when focus returns
        setUsageStatsEnabled(true);
      } catch (error) {
        console.error("Error opening usage access settings:", error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Required Permissions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Description */}
        <Text style={styles.title}>Enable Permissions</Text>
        <Text style={styles.description}>
          To help you stay focused, we need a few permissions to monitor 
          app usage and display mindful reminders when you open distracting apps.
        </Text>

        {/* Permission Items */}
        {Platform.OS === 'android' && (
          <View style={styles.permissionsContainer}>
            <View style={styles.permissionItem}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Accessibility Service</Text>
                <Text style={styles.permissionDescription}>
                  Required to detect when you open distracting apps
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.permissionButton, 
                  accessibilityEnabled ? styles.permissionButtonEnabled : {}
                ]}
                onPress={openAccessibilitySettings}
              >
                {accessibilityEnabled ? (
                  <CheckCircle size={20} color={colors.success} />
                ) : (
                  <Text style={styles.permissionButtonText}>Enable</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.permissionItem}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Display Over Other Apps</Text>
                <Text style={styles.permissionDescription}>
                  Required to show mindful breathing exercises
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.permissionButton, 
                  overlayEnabled ? styles.permissionButtonEnabled : {}
                ]}
                onPress={openOverlaySettings}
              >
                {overlayEnabled ? (
                  <CheckCircle size={20} color={colors.success} />
                ) : (
                  <Text style={styles.permissionButtonText}>Enable</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.permissionItem}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Usage Access</Text>
                <Text style={styles.permissionDescription}>
                  Required to track app usage statistics
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.permissionButton, 
                  usageStatsEnabled ? styles.permissionButtonEnabled : {}
                ]}
                onPress={openUsageAccessSettings}
              >
                {usageStatsEnabled ? (
                  <CheckCircle size={20} color={colors.success} />
                ) : (
                  <Text style={styles.permissionButtonText}>Enable</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {Platform.OS === 'ios' && (
          <View style={styles.notSupportedContainer}>
            <AlertCircle size={40} color={colors.warning} style={styles.warningIcon} />
            <Text style={styles.notSupportedTitle}>iOS Not Fully Supported</Text>
            <Text style={styles.notSupportedDescription}>
              Due to iOS restrictions, full distraction blocking features aren't available.
              You can still track your usage manually and practice mindfulness.
            </Text>
          </View>
        )}

        {/* Privacy Note */}
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>
            <Text style={styles.privacyTextBold}>Privacy Note:</Text> Your app usage data is stored locally on your device only. 
            We do not collect or share this information with anyone.
          </Text>
        </View>
      </ScrollView>

      {/* Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!accessibilityEnabled || !overlayEnabled || !usageStatsEnabled) && Platform.OS === 'android'
              ? styles.continueButtonDisabled
              : {}
          ]} 
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  title: {
    ...typography.title,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.xl,
  },
  permissionsContainer: {
    marginBottom: spacing.xl,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  permissionInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  permissionTitle: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  permissionDescription: {
    ...typography.caption,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  permissionButtonEnabled: {
    backgroundColor: colors.backgroundTertiary,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  notSupportedContainer: {
    backgroundColor: "#FEF9C3", // Light yellow background
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  warningIcon: {
    marginBottom: spacing.md,
  },
  notSupportedTitle: {
    ...typography.subtitle,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  notSupportedDescription: {
    ...typography.body,
    textAlign: "center",
    color: colors.textMedium,
  },
  privacyContainer: {
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  privacyText: {
    ...typography.caption,
    color: colors.textLight,
  },
  privacyTextBold: {
    fontWeight: "700",
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  continueButton: {
    ...buttonStyles.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  continueButtonText: {
    ...typography.button,
    marginRight: spacing.sm,
  },
}); 