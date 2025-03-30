import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Bell, CheckCircle } from "lucide-react-native";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { useAppContext } from "../context/AppContext";

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
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={60} color="#58CC02" />
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
              <Bell size={20} color="#58CC02" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Daily Reminders</Text>
              <Text style={styles.benefitDescription}>We'll send you a gentle reminder at your preferred time</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Bell size={20} color="#58CC02" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Streak Protection</Text>
              <Text style={styles.benefitDescription}>We'll warn you when your streak is at risk</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Bell size={20} color="#58CC02" />
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
          style={[styles.allowButton, isLoading && styles.disabledButton]} 
          onPress={requestNotificationPermission}
          disabled={isLoading}
        >
          <Text style={styles.allowButtonText}>
            {isLoading ? "Requesting..." : "TURN ON NOTIFICATIONS"}
          </Text>
          {!isLoading && <ChevronRight size={20} color="white" style={styles.buttonIcon} />}
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationImage: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5F8D9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B4B4B",
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  buttonContainer: {
    padding: 16,
  },
  allowButton: {
    backgroundColor: "#58CC02",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  allowButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  successContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  successIconContainer: {
    backgroundColor: "#E5F8D9",
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: "#4B4B4B",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default NotificationPermissionScreen; 