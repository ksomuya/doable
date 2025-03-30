import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  TextStyle,
  ViewStyle,
  ImageStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Bell, CheckCircle } from "lucide-react-native";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { useAppContext } from "../context/AppContext";
import { spacing, typography, colors, buttonStyles, layoutStyles } from "../styles/designSystem";

interface CustomStyles {
  successContent: ViewStyle;
  successIconContainer: ViewStyle;
  successTitle: TextStyle;
  successMessage: TextStyle;
  notificationImage: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle;
  benefitsContainer: ViewStyle;
  benefitItem: ViewStyle;
  benefitIcon: ViewStyle;
  benefitContent: ViewStyle;
  benefitTitle: TextStyle;
  benefitDescription: TextStyle;
  buttonContainer: ViewStyle;
  allowButton: ViewStyle;
  disabledButton: ViewStyle;
  allowButtonText: TextStyle;
  buttonIcon: ViewStyle;
}

const NotificationPermissionScreen = () => {
  const router = useRouter();
  const { updateNotificationPreference } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const requestNotificationPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const isGranted = status === "granted";
      
      // Save preference in context
      await updateNotificationPreference(isGranted);
      
      if (isGranted) {
        setPermissionGranted(true);
        // Show success message for 1.5 seconds before redirecting
        setTimeout(() => {
          redirectToNextScreen();
        }, 1500);
      } else {
        // Even if not granted, still save that we asked and redirect
        redirectToNextScreen();
      }
    } catch (error) {
      console.log("Error requesting notification permission:", error);
      // Still redirect even if there's an error
      redirectToNextScreen();
    } finally {
      setIsLoading(false);
    }
  };
  
  const redirectToNextScreen = () => {
    // Navigate to the final choice screen
    router.push("/practice/final-choice" as any);
  };
  
  // If permission is granted, show success screen
  if (permissionGranted) {
    return (
      <SafeAreaView style={layoutStyles.safeArea}>
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={60} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Notifications Enabled!</Text>
          <Text style={styles.successMessage}>
            You're all set! We'll remind you to practice and help you reach your streak goal.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={layoutStyles.safeArea}>
      <View style={layoutStyles.content}>
        <Image
          source={{
            uri: "https://cdn.jsdelivr.net/gh/duolingo/images@master/owl-workout.png",
          }}
          style={styles.notificationImage}
        />
        
        <Text style={styles.title}>Enable notifications to track your streak</Text>
        <Text style={styles.subtitle}>
          Daily reminders will help you stay on track and achieve your {Platform.OS === 'ios' ? 'streaks' : 'streak'} goal!
        </Text>
        
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Daily Reminders</Text>
              <Text style={styles.benefitDescription}>We'll send you a gentle reminder at your preferred time</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Streak Protection</Text>
              <Text style={styles.benefitDescription}>We'll warn you when your streak is at risk</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Achievement Celebrations</Text>
              <Text style={styles.benefitDescription}>Get notified when you reach milestone achievements</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            buttonStyles.primary,
            isLoading && buttonStyles.disabled,
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
          ]} 
          onPress={requestNotificationPermission}
          disabled={isLoading}
        >
          <Text style={buttonStyles.text}>
            {isLoading ? "Requesting..." : "TURN ON NOTIFICATIONS"}
          </Text>
          {!isLoading && <ChevronRight size={20} color="white" style={styles.buttonIcon} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<CustomStyles>({
  successContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  successIconContainer: {
    backgroundColor: "#E5F8D9",
    padding: spacing.md,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    color: colors.textDark,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  successMessage: {
    fontSize: typography.body.fontSize,
    color: colors.textMedium,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  notificationImage: {
    width: 140,
    height: 140,
    marginBottom: spacing.lg,
    alignSelf: "center",
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    color: colors.textDark,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textMedium,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5F8D9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.bodyBold.fontSize,
    fontWeight: typography.bodyBold.fontWeight,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.textLight,
  },
  buttonContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  allowButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  allowButtonText: {
    color: "white",
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  buttonIcon: {
    marginLeft: spacing.sm,
  },
});

export default NotificationPermissionScreen; 