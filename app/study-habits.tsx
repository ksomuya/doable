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
import {
  ArrowLeft,
  Clock,
  Zap,
  BookOpen,
  Calendar,
  BarChart,
  CheckSquare,
  MapPin,
} from "lucide-react-native";
import { useAppContext } from "./context/AppContext";

export default function StudyHabitsScreen() {
  const router = useRouter();
  const { user } = useAppContext();

  const handleBackPress = () => {
    router.back();
  };

  // Mock data for study habits
  const studyHabitsData = {
    weeklyStudyHours: 28,
    longestStreak: 42, // days
    averageSessionLength: 65, // minutes
    mostProductiveDay: "Tuesday",
    mostProductiveTime: "7:00 PM",
    chaptersCompleted: 32,
    weeklyBreakdown: [
      { day: "Mon", hours: 4.5 },
      { day: "Tue", hours: 6.2 },
      { day: "Wed", hours: 3.8 },
      { day: "Thu", hours: 5.1 },
      { day: "Fri", hours: 4.0 },
      { day: "Sat", hours: 2.5 },
      { day: "Sun", hours: 1.9 },
    ],
    studyLocations: [
      { name: "Home", percentage: 65 },
      { name: "Library", percentage: 25 },
      { name: "Café", percentage: 10 },
    ],
    completedTasks: 48,
    totalTasks: 62,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Habits</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Study Habits Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Habits Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Clock size={20} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{studyHabitsData.weeklyStudyHours}</Text>
              <Text style={styles.statLabel}>Weekly Hours</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Zap size={20} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{studyHabitsData.longestStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Clock size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.statValue}>{studyHabitsData.averageSessionLength}</Text>
              <Text style={styles.statLabel}>Avg. Minutes</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <BookOpen size={20} color="#f97316" />
              </View>
              <Text style={styles.statValue}>{studyHabitsData.chaptersCompleted}</Text>
              <Text style={styles.statLabel}>Chapters</Text>
            </View>
          </View>
        </View>
        
        {/* Weekly Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
          <View style={styles.weeklyChart}>
            {studyHabitsData.weeklyBreakdown.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View 
                  style={[
                    styles.dayBar, 
                    { height: day.hours * 15 } // Scale the height based on hours
                  ]}
                />
                <Text style={styles.dayLabel}>{day.day}</Text>
                <Text style={styles.dayHours}>{day.hours}h</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Productivity Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productivity Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Calendar size={20} color="#6366f1" />
              <Text style={styles.insightLabel}>Most Productive Day</Text>
              <Text style={styles.insightValue}>{studyHabitsData.mostProductiveDay}</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Clock size={20} color="#6366f1" />
              <Text style={styles.insightLabel}>Peak Study Time</Text>
              <Text style={styles.insightValue}>{studyHabitsData.mostProductiveTime}</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightRow}>
              <CheckSquare size={20} color="#6366f1" />
              <Text style={styles.insightLabel}>Task Completion</Text>
              <Text style={styles.insightValue}>
                {Math.round((studyHabitsData.completedTasks / studyHabitsData.totalTasks) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(studyHabitsData.completedTasks / studyHabitsData.totalTasks) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressLabel}>
              {studyHabitsData.completedTasks} of {studyHabitsData.totalTasks} tasks completed
            </Text>
          </View>
        </View>
        
        {/* Study Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Locations</Text>
          {studyHabitsData.studyLocations.map((location, index) => (
            <View key={index} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationIconContainer}>
                  <MapPin size={16} color="#6366f1" />
                </View>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationPercentage}>{location.percentage}%</Text>
              </View>
              <View style={styles.locationProgressBar}>
                <View 
                  style={[
                    styles.locationProgressFill, 
                    { width: `${location.percentage}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
        
        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              Increase study sessions on weekends
            </Text>
            <Text style={styles.recommendationDescription}>
              Your weekend productivity is 30% lower than weekdays
            </Text>
          </View>
          
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              Take more breaks during long sessions
            </Text>
            <Text style={styles.recommendationDescription}>
              Your performance drops after 90 minutes of continuous study
            </Text>
          </View>
          
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              Review weak topics more frequently
            </Text>
            <Text style={styles.recommendationDescription}>
              Spaced repetition will help improve retention
            </Text>
          </View>
        </View>
        
        {/* Bottom space */}
        <View style={{ height: 40 }} />
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1F2937",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  dayColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 30,
  },
  dayBar: {
    width: 16,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  dayHours: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  insightCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightLabel: {
    flex: 1,
    fontSize: 16,
    color: "#4B5563",
    marginLeft: 12,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  locationCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationName: {
    flex: 1,
    fontSize: 16,
    color: "#4B5563",
  },
  locationPercentage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  locationProgressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  locationProgressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },
  recommendationCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
}); 