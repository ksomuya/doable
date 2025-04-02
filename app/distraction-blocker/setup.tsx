import React, { useState, useEffect, useRef } from "react";
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
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Eye,
  BarChart3
} from "lucide-react-native";
import * as IntentLauncher from 'expo-intent-launcher';
import { LinearGradient } from "expo-linear-gradient";

export default function SetupScreen() {
  const router = useRouter();
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [usageStatsEnabled, setUsageStatsEnabled] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  const permissionAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

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
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Staggered permissions animation
    Animated.stagger(200, 
      permissionAnimations.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start();
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
    router.push("/distraction-blocker/app-selection");
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

  const getPermissionStatus = (index: number): boolean => {
    switch(index) {
      case 0: return accessibilityEnabled;
      case 1: return overlayEnabled;
      case 2: return usageStatsEnabled;
      default: return false;
    }
  };

  const getPermissionAction = (index: number): () => Promise<void> => {
    switch(index) {
      case 0: return openAccessibilitySettings;
      case 1: return openOverlaySettings;
      case 2: return openUsageAccessSettings;
      default: return async () => {};
    }
  };

  const allPermissionsEnabled = 
    (Platform.OS === 'ios') || 
    (accessibilityEnabled && overlayEnabled && usageStatsEnabled);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup Permissions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Description */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateY }]
          }}
        >
          <View style={styles.headerSection}>
            <LinearGradient
              colors={['#6C5CE7', '#4834d4']}
              style={styles.headerIcon}
            >
              <Shield size={32} color="white" />
            </LinearGradient>
            <Text style={styles.title}>Enable Permissions</Text>
            <Text style={styles.description}>
              To help you stay focused, we need a few permissions to monitor 
              app usage and display mindful reminders when you open distracting apps.
            </Text>
          </View>
        </Animated.View>

        {/* Permission Items */}
        {Platform.OS === 'android' && (
          <View style={styles.permissionsContainer}>
            {[
              {
                icon: <Shield size={24} color="white" />,
                title: "Accessibility Service",
                description: "Required to detect when you open distracting apps",
                gradient: ['#FF9F43', '#F2994A'] as const,
                enabled: accessibilityEnabled
              },
              {
                icon: <Eye size={24} color="white" />,
                title: "Display Over Other Apps",
                description: "Required to show mindful breathing exercises",
                gradient: ['#4834d4', '#6C5CE7'] as const,
                enabled: overlayEnabled
              },
              {
                icon: <BarChart3 size={24} color="white" />,
                title: "Usage Access",
                description: "Required to track app usage statistics",
                gradient: ['#20BF6B', '#0ABF30'] as const,
                enabled: usageStatsEnabled
              }
            ].map((permission, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.permissionCard,
                  {
                    opacity: permissionAnimations[index],
                    transform: [{ 
                      translateY: permissionAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      }) 
                    }]
                  }
                ]}
              >
                <View style={styles.permissionContent}>
                  <LinearGradient
                    colors={permission.gradient}
                    style={styles.permissionIconContainer}
                  >
                    {permission.icon}
                  </LinearGradient>
                  
                  <View style={styles.permissionInfo}>
                    <Text style={styles.permissionTitle}>{permission.title}</Text>
                    <Text style={styles.permissionDescription}>
                      {permission.description}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.permissionButton, 
                    getPermissionStatus(index) ? styles.permissionButtonEnabled : {}
                  ]}
                  onPress={getPermissionAction(index)}
                >
                  {getPermissionStatus(index) ? (
                    <CheckCircle size={20} color="#20BF6B" />
                  ) : (
                    <Text style={styles.permissionButtonText}>Enable</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {Platform.OS === 'ios' && (
          <Animated.View 
            style={[
              styles.notSupportedContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateY }]
              }
            ]}
          >
            <LinearGradient
              colors={['#FF9F43', '#F2994A']}
              style={styles.warningIconContainer}
            >
              <AlertCircle size={32} color="white" />
            </LinearGradient>
            <Text style={styles.notSupportedTitle}>iOS Not Fully Supported</Text>
            <Text style={styles.notSupportedDescription}>
              Due to iOS restrictions, full distraction blocking features aren't available.
              You can still track your usage manually and practice mindfulness.
            </Text>
          </Animated.View>
        )}

        {/* Progress Indicator */}
        <Animated.View 
          style={[
            styles.progressContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <View style={styles.progressSteps}>
            <View style={[styles.progressStep, styles.progressStepActive]}>
              <Text style={styles.progressStepText}>1</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={[styles.progressStep, allPermissionsEnabled ? styles.progressStepActive : {}]}>
              <Text style={styles.progressStepText}>2</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <Text style={styles.progressStepText}>3</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Permissions</Text>
            <Text style={[styles.progressLabel, allPermissionsEnabled ? styles.progressLabelActive : {}]}>
              Select Apps
            </Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </Animated.View>

        {/* Privacy Note */}
        <Animated.View 
          style={[
            styles.privacyContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <Text style={styles.privacyText}>
            <Text style={styles.privacyTextBold}>Privacy Note:</Text> Your app usage data is stored locally on your device only. 
            We do not collect or share this information with anyone.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!allPermissionsEnabled) ? styles.continueButtonDisabled : {}
          ]} 
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!allPermissionsEnabled}
        >
          <LinearGradient
            colors={['#6C5CE7', '#4834d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.buttonGradient,
              (!allPermissionsEnabled) ? { opacity: 0.6 } : {}
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
  },
  permissionsContainer: {
    marginBottom: 32,
  },
  permissionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  permissionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  permissionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  permissionButtonEnabled: {
    backgroundColor: "#E6F9F1",
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  notSupportedContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  notSupportedTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  notSupportedDescription: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  progressStepActive: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    width: "30%",
  },
  progressLabelActive: {
    color: "#6C5CE7",
    fontWeight: "600",
  },
  privacyContainer: {
    backgroundColor: "#F8F9FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#6C5CE7",
  },
  privacyText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  privacyTextBold: {
    fontWeight: "700",
    color: "#333",
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  continueButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
}); 