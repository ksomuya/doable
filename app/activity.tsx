import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Flame, Trophy, Calendar, Clock } from "lucide-react-native";
import { useAppContext } from "./context/AppContext";
import ContributionTracker from "./components/ContributionTracker";
import ActivityItem, { ActivityItemData } from "./components/ActivityItem";

// Mock data for the contribution tracker
const generateMockContributionData = () => {
  const data = [];
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Generate random activity for the past year
  const currentDate = new Date(oneYearAgo);
  while (currentDate <= today) {
    // Higher probability of activity for recent dates and weekends
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const daysAgo = Math.floor(
      (today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const recentFactor = Math.max(0, 1 - daysAgo / 365);
    const probability = isWeekend ? 0.7 : 0.5;

    // Random activity count (more likely to be active on recent days)
    if (Math.random() < probability * (recentFactor + 0.3)) {
      const count = Math.floor(Math.random() * 10) + 1;
      data.push({
        date: currentDate.toISOString(),
        count,
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

// Mock data for recent activity
const generateMockActivityData = (): ActivityItemData[] => {
  const activities = [
    {
      id: "1",
      type: "practice" as const,
      date: new Date().toISOString(),
      title: "Completed Practice Session",
      description: "Physics - Kinematics",
      xpEarned: 120,
    },
    {
      id: "2",
      type: "streak" as const,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      title: "7-Day Streak Achieved!",
      description: "You've been consistent for a week!",
      xpEarned: 50,
    },
    {
      id: "3",
      type: "study" as const,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      title: "Studied New Chapter",
      description: "Chemistry - Chemical Bonding",
      xpEarned: 80,
    },
    {
      id: "4",
      type: "achievement" as const,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      title: "Achievement Unlocked",
      description: "Early Bird: Complete 5 sessions before 9 AM",
      xpEarned: 100,
    },
    {
      id: "5",
      type: "login" as const,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      title: "Daily Login",
      xpEarned: 10,
    },
  ];

  return activities;
};

const ActivityScreen = () => {
  const router = useRouter();
  const { user } = useAppContext();

  // Mock data for the contribution tracker
  const contributionData = generateMockContributionData();

  // Mock data for recent activity
  const recentActivity = generateMockActivityData();

  // Calculate streak statistics
  const currentStreak = user.streak;
  const longestStreak = Math.max(currentStreak, 14); // Mock value, would come from user data
  const totalActiveDays = contributionData.length;
  const streakStartDate = new Date(
    Date.now() - (currentStreak - 1) * 24 * 60 * 60 * 1000,
  );

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity & Streaks</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Current Streak Banner */}
        <View style={styles.streakBanner}>
          <View style={styles.streakIconContainer}>
            <Flame size={32} color="#FFFFFF" />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Streak Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Trophy size={20} color="#F59E0B" />
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statValue}>{longestStreak} days</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Calendar size={20} color="#10B981" />
            <Text style={styles.statLabel}>Total Active Days</Text>
            <Text style={styles.statValue}>{totalActiveDays}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Clock size={20} color="#6366F1" />
            <Text style={styles.statLabel}>Streak Started</Text>
            <Text style={styles.statValue}>
              {streakStartDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Contribution Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Heatmap</Text>
          <ContributionTracker data={contributionData} />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  streakIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
  },
  streakLabel: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  activityList: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 16,
    marginBottom: 24,
  },
});

export default ActivityScreen;
