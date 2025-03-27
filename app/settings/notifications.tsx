import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    practiceReminders: true,
    studyTips: true,
    achievements: true,
    appUpdates: false,
  });

  const handleBackPress = () => {
    router.back();
  };

  const toggleSwitch = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            Control which notifications you receive from Doable
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Practice Reminders</Text>
              <Text style={styles.settingDescription}>
                Daily reminders to practice and maintain your streak
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
              thumbColor={
                notifications.practiceReminders ? "#4F46E5" : "#F3F4F6"
              }
              onValueChange={() => toggleSwitch("practiceReminders")}
              value={notifications.practiceReminders}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Study Tips</Text>
              <Text style={styles.settingDescription}>
                Weekly study tips and tricks to improve your learning
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
              thumbColor={notifications.studyTips ? "#4F46E5" : "#F3F4F6"}
              onValueChange={() => toggleSwitch("studyTips")}
              value={notifications.studyTips}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Achievements</Text>
              <Text style={styles.settingDescription}>
                Notifications when you earn new achievements
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
              thumbColor={notifications.achievements ? "#4F46E5" : "#F3F4F6"}
              onValueChange={() => toggleSwitch("achievements")}
              value={notifications.achievements}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>App Updates</Text>
              <Text style={styles.settingDescription}>
                Notifications about new features and app updates
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
              thumbColor={notifications.appUpdates ? "#4F46E5" : "#F3F4F6"}
              onValueChange={() => toggleSwitch("appUpdates")}
              value={notifications.appUpdates}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Bell size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            You can change these settings at any time. Notifications help you
            stay on track with your study goals.
          </Text>
        </View>
      </ScrollView>
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
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionDescription: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 24,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoSection: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
