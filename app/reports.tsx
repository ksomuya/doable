import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  BookOpen,
  Zap,
  Award,
  Calendar,
  BarChart,
} from "lucide-react-native";
import { useAppContext } from "./context/AppContext";

export default function ReportsScreen() {
  const router = useRouter();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState("daily");

  const handleBackPress = () => {
    router.back();
  };

  // Mock data for performance metrics
  const dailyData = {
    date: "Today, October 18, 2023",
    totalQuestions: 42,
    correctAnswers: 35,
    averageTime: 38, // seconds per question
    studyTime: 2.5, // hours
    topicsStudied: ["Organic Chemistry", "Electromagnetism", "Calculus"],
    sessions: [
      { time: "8:30 AM", duration: 45, score: 85 },
      { time: "1:15 PM", duration: 30, score: 92 },
      { time: "7:00 PM", duration: 75, score: 78 },
    ],
  };

  const weeklyData = {
    dateRange: "Oct 12 - Oct 18, 2023",
    totalQuestions: 245,
    correctAnswers: 186,
    averageTime: 42, // seconds per question
    studyTime: 14.5, // hours
    dailyBreakdown: [
      { day: "Mon", questions: 35, accuracy: 76 },
      { day: "Tue", questions: 42, accuracy: 81 },
      { day: "Wed", questions: 28, accuracy: 68 },
      { day: "Thu", questions: 54, accuracy: 85 },
      { day: "Fri", questions: 39, accuracy: 74 },
      { day: "Sat", questions: 25, accuracy: 72 },
      { day: "Sun", questions: 22, accuracy: 68 },
    ],
    weakTopics: [
      { name: "Organic Chemistry", accuracy: 62 },
      { name: "Electromagnetism", accuracy: 68 },
    ],
    strongTopics: [
      { name: "Mechanics", accuracy: 94 },
      { name: "Algebra", accuracy: 91 },
    ],
  };

  const monthlyData = {
    month: "October 2023",
    totalQuestions: 1250,
    correctAnswers: 875,
    averageTime: 45, // seconds per question
    studyTime: 58, // hours
    weeklyBreakdown: [
      { week: "Week 1", questions: 305, accuracy: 78 },
      { week: "Week 2", questions: 342, accuracy: 72 },
      { week: "Week 3", questions: 398, accuracy: 68 },
      { week: "Week 4", questions: 205, accuracy: 75 },
    ],
    improvement: 8, // percentage improvement
    longestStreak: 14, // days
    weakTopics: [
      { name: "Organic Chemistry", accuracy: 62 },
      { name: "Electromagnetism", accuracy: 68 },
      { name: "Calculus", accuracy: 71 },
    ],
    strongTopics: [
      { name: "Mechanics", accuracy: 94 },
      { name: "Algebra", accuracy: 91 },
      { name: "Inorganic Chemistry", accuracy: 89 },
    ],
  };

  const renderDailyReport = () => (
    <View style={styles.tabContent}>
      {/* Date Display */}
      <View style={styles.dateContainer}>
        <Calendar size={18} color="#4F46E5" />
        <Text style={styles.dateText}>{dailyData.date}</Text>
      </View>

      {/* Daily Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <BookOpen size={20} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{dailyData.totalQuestions}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={20} color="#10b981" />
          </View>
          <Text style={styles.statValue}>
            {Math.round((dailyData.correctAnswers / dailyData.totalQuestions) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{dailyData.averageTime}s</Text>
          <Text style={styles.statLabel}>Avg Time</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock size={20} color="#f97316" />
          </View>
          <Text style={styles.statValue}>{dailyData.studyTime}h</Text>
          <Text style={styles.statLabel}>Study Time</Text>
        </View>
      </View>

      {/* Today's Study Sessions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Study Sessions</Text>
        {dailyData.sessions.map((session, index) => (
          <View key={index} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTime}>{session.time}</Text>
              <View style={styles.sessionScoreContainer}>
                <Text style={styles.sessionScore}>{session.score}%</Text>
              </View>
            </View>
            <Text style={styles.sessionDuration}>{session.duration} minutes</Text>
          </View>
        ))}
      </View>

      {/* Topics Studied Today */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Topics Studied Today</Text>
        <View style={styles.topicsContainer}>
          {dailyData.topicsStudied.map((topic, index) => (
            <View key={index} style={styles.topicPill}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderWeeklyReport = () => (
    <View style={styles.tabContent}>
      {/* Date Range Display */}
      <View style={styles.dateContainer}>
        <Calendar size={18} color="#4F46E5" />
        <Text style={styles.dateText}>{weeklyData.dateRange}</Text>
      </View>

      {/* Weekly Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <BookOpen size={20} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{weeklyData.totalQuestions}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={20} color="#10b981" />
          </View>
          <Text style={styles.statValue}>
            {Math.round((weeklyData.correctAnswers / weeklyData.totalQuestions) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{weeklyData.averageTime}s</Text>
          <Text style={styles.statLabel}>Avg Time</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock size={20} color="#f97316" />
          </View>
          <Text style={styles.statValue}>{weeklyData.studyTime}h</Text>
          <Text style={styles.statLabel}>Study Time</Text>
        </View>
      </View>

      {/* Daily Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        <View style={styles.chartContainer}>
          {weeklyData.dailyBreakdown.map((day, index) => (
            <View key={index} style={styles.chartColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.accuracyBar, 
                    { height: day.accuracy * 1.5 } // Scale height based on accuracy
                  ]}
                />
                <View 
                  style={[
                    styles.questionsIndicator,
                    { bottom: day.questions * 1.5 } // Position indicator based on questions
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{day.day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#4F46E5" }]} />
            <Text style={styles.legendText}>Accuracy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#F97316" }]} />
            <Text style={styles.legendText}>Questions</Text>
          </View>
        </View>
      </View>

      {/* Weak Topics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Areas for Improvement</Text>
        {weeklyData.weakTopics.map((topic, index) => (
          <View key={index} style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicName}>{topic.name}</Text>
              <Text style={styles.topicAccuracy}>{topic.accuracy}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${topic.accuracy}%`, backgroundColor: "#EF4444" }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Strong Topics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strong Areas</Text>
        {weeklyData.strongTopics.map((topic, index) => (
          <View key={index} style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicName}>{topic.name}</Text>
              <Text style={styles.topicAccuracy}>{topic.accuracy}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${topic.accuracy}%`, backgroundColor: "#10B981" }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMonthlyReport = () => (
    <View style={styles.tabContent}>
      {/* Month Display */}
      <View style={styles.dateContainer}>
        <Calendar size={18} color="#4F46E5" />
        <Text style={styles.dateText}>{monthlyData.month}</Text>
      </View>

      {/* Monthly Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <BookOpen size={20} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{monthlyData.totalQuestions}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={20} color="#10b981" />
          </View>
          <Text style={styles.statValue}>
            {Math.round((monthlyData.correctAnswers / monthlyData.totalQuestions) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Zap size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{monthlyData.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock size={20} color="#f97316" />
          </View>
          <Text style={styles.statValue}>{monthlyData.studyTime}h</Text>
          <Text style={styles.statLabel}>Study Time</Text>
        </View>
      </View>

      {/* Improvement Highlight */}
      <View style={styles.section}>
        <View style={styles.improvementCard}>
          <View style={styles.improvementHeader}>
            <BarChart size={24} color="#4F46E5" />
            <Text style={styles.improvementTitle}>Monthly Progress</Text>
          </View>
          <Text style={styles.improvementValue}>+{monthlyData.improvement}%</Text>
          <Text style={styles.improvementDescription}>
            Your performance has improved {monthlyData.improvement}% compared to last month
          </Text>
        </View>
      </View>

      {/* Weekly Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
        {monthlyData.weeklyBreakdown.map((week, index) => (
          <View key={index} style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekName}>{week.week}</Text>
              <Text style={styles.weekStats}>
                {week.questions} questions | {week.accuracy}% accuracy
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${week.accuracy}%`, backgroundColor: "#4F46E5" }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Weak & Strong Topics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance by Topic</Text>
        
        <Text style={styles.subSectionTitle}>Areas for Improvement</Text>
        {monthlyData.weakTopics.map((topic, index) => (
          <View key={index} style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicName}>{topic.name}</Text>
              <Text style={styles.topicAccuracy}>{topic.accuracy}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${topic.accuracy}%`, backgroundColor: "#EF4444" }
                ]} 
              />
            </View>
          </View>
        ))}
        
        <Text style={styles.subSectionTitle}>Strong Areas</Text>
        {monthlyData.strongTopics.map((topic, index) => (
          <View key={index} style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicName}>{topic.name}</Text>
              <Text style={styles.topicAccuracy}>{topic.accuracy}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${topic.accuracy}%`, backgroundColor: "#10B981" }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance Reports</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("daily")}
          style={[
            styles.tabButton,
            activeTab === "daily" && styles.activeTabButton
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "daily" && styles.activeTabButtonText
            ]}
          >
            Daily
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab("weekly")}
          style={[
            styles.tabButton,
            activeTab === "weekly" && styles.activeTabButton
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "weekly" && styles.activeTabButtonText
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab("monthly")}
          style={[
            styles.tabButton,
            activeTab === "monthly" && styles.activeTabButton
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "monthly" && styles.activeTabButtonText
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollView}>
        {activeTab === "daily" && renderDailyReport()}
        {activeTab === "weekly" && renderWeeklyReport()}
        {activeTab === "monthly" && renderMonthlyReport()}
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
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#4F46E5",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabButtonText: {
    color: "#4F46E5",
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#4F46E5",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1F2937",
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
    color: "#4B5563",
  },
  sessionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  sessionScoreContainer: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sessionScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  sessionDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topicPill: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  topicText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    marginBottom: 8,
  },
  chartColumn: {
    alignItems: "center",
    width: 30,
  },
  barContainer: {
    height: 120,
    width: 20,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
    position: "relative",
  },
  accuracyBar: {
    width: 20,
    backgroundColor: "#4F46E5",
    borderRadius: 10,
  },
  questionsIndicator: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
    left: 6,
  },
  chartLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
  topicCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  topicName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  topicAccuracy: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  weekCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weekName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  weekStats: {
    fontSize: 14,
    color: "#6B7280",
  },
  improvementCard: {
    backgroundColor: "#F3F4FF",
    borderRadius: 12,
    padding: 20,
  },
  improvementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  improvementTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 12,
  },
  improvementValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4F46E5",
    marginBottom: 8,
  },
  improvementDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});
