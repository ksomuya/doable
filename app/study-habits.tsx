import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Zap,
  BookOpen,
  Calendar,
  CheckSquare,
  MapPin,
  TrendingUp,
  BarChart2,
} from "lucide-react-native";
import { useAppContext } from "./context/AppContext";
import { supabase } from './utils/supabase';
import { useUser } from '@clerk/clerk-expo';
import { BarChart } from 'react-native-chart-kit';
import CalendarHeatmap from 'react-native-calendar-heatmap';

interface StudyHabitsData {
  current_streak: number | null;
  longest_streak: number | null;
  day_of_week_consistency: Record<string, number> | null;
  best_hour_utc: number | null;
}

interface MockStudyHabitsData {
  weeklyStudyHours: number;
  longestStreak: number;
  averageSessionLength: number;
  mostProductiveDay: string;
  mostProductiveTime: string;
  chaptersCompleted: number;
  weeklyBreakdown: Array<{ day: string; hours: number }>;
  studyLocations: Array<{ name: string; percentage: number }>;
  completedTasks: number;
  totalTasks: number;
}

// Interface for heatmap data point
interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD format
  count: number;
}

export default function StudyHabitsScreen() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [habitsData, setHabitsData] = useState<StudyHabitsData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]); // State for heatmap
  const [isLoading, setIsLoading] = useState(true);
  const [isHeatmapLoading, setIsHeatmapLoading] = useState(true); // Separate loading for heatmap
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component
    setIsLoading(true); // Set combined loading state
    setIsHeatmapLoading(true);
    setError(null);

    const fetchAllData = async () => {
      if (!clerkUser?.id) {
        if (isMounted) {
           setIsLoading(false);
           setIsHeatmapLoading(false);
        }
        return;
      }

      try {
        // Fetch habits data (streaks, best hour, consistency)
        const { data: habitsResult, error: habitsError } = await supabase.rpc('get_study_habits', {
          p_user_id: clerkUser.id,
        });
        if (habitsError) throw habitsError;
        if (isMounted) {
          setHabitsData(habitsResult && habitsResult.length > 0 ? habitsResult[0] : {
            current_streak: 0, longest_streak: 0, day_of_week_consistency: {}, best_hour_utc: null
          });
        }

        // Fetch heatmap data (last 180 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 180);
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        const { data: heatmapResult, error: heatmapError } = await supabase.rpc('get_daily_activity_counts', {
           p_user_id: clerkUser.id,
           p_start_date: formattedStartDate,
           p_end_date: formattedEndDate,
         });
        if (heatmapError) throw heatmapError;
        if (isMounted) {
          // Ensure data format matches HeatmapDataPoint
           const formattedHeatmapData = (heatmapResult || []).map((item: any) => ({
             date: item.activity_date, // Already YYYY-MM-DD from DB potentially
             count: item.count,
           }));
          setHeatmapData(formattedHeatmapData);
          setIsHeatmapLoading(false);
        }

      } catch (err: any) {
        console.error('Error fetching study data:', err);
         if (isMounted) {
           setError(err.message || 'Failed to fetch study data.');
           setHabitsData(null); // Clear data on error
           setHeatmapData([]);
           setIsHeatmapLoading(false);
         }
      } finally {
         if (isMounted) {
            setIsLoading(false); // Combined loading finishes after all fetches
            // Note: isHeatmapLoading is set individually above
         }
      }
    };

    fetchAllData();

    return () => { isMounted = false; }; // Cleanup function

  }, [clerkUser?.id]);

  const handleBackPress = () => {
    router.back();
  };

  const mockStudyHabitsData: MockStudyHabitsData = {
    weeklyStudyHours: 28,
    longestStreak: 42,
    averageSessionLength: 65,
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

  const formatBestHour = (hourUtc: number | null) => {
    if (hourUtc === null || hourUtc < 0 || hourUtc > 23) {
      return 'Calculating...';
    }
    const hour12 = hourUtc % 12 === 0 ? 12 : hourUtc % 12;
    const ampm = hourUtc < 12 ? 'AM' : 'PM';
    // TODO (Phase 5): Use habitsData.best_hour_utc when scheduling push notification reminders.
    return `${hour12} ${ampm} UTC`;
  };

  const renderConsistencyChart = () => {
    if (!habitsData?.day_of_week_consistency) {
      return <Text style={styles.placeholderText}>Consistency data not available.</Text>;
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const consistencyValues = daysOfWeek.map((_, index) => {
      const dayIndex = (index + 1).toString(); // ISODOW: Mon=1, Sun=7
      return habitsData.day_of_week_consistency?.[dayIndex] ?? 0;
    });

    const chartConfig = {
      backgroundColor: "#ffffff",
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo
      labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray
      style: {
        borderRadius: 16,
      },
      barPercentage: 0.6,
      propsForBackgroundLines: { // Make background lines less prominent
        strokeDasharray: "", // solid lines
        stroke: "#E5E7EB", // light gray
        strokeWidth: 0.5,
      }
    };

    const screenWidth = Dimensions.get('window').width;
    // Adjust width based on screen size and padding
    const chartWidth = screenWidth - (styles.section.marginHorizontal ?? 16) * 2 - (styles.section.paddingHorizontal ?? 16) * 2;

    return (
      <View style={{ alignItems: 'center' }}>
        <BarChart
          data={{
            labels: daysOfWeek,
            datasets: [{ data: consistencyValues }],
          }}
          width={chartWidth} 
          height={220}
          yAxisLabel="%"
          yAxisSuffix=""
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero={true}
          showValuesOnTopOfBars={false}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
         <Text style={styles.chartDescription}>
          Percentage of days studied over the last 90 days.
        </Text>
      </View>
    );
  };

  const renderHeatmap = () => {
    if (isHeatmapLoading) {
        return <ActivityIndicator color="#4F46E5" style={{ marginVertical: 20 }}/>;
    }
    if (!heatmapData || heatmapData.length === 0) {
      return <Text style={styles.placeholderText}>Not enough activity data for calendar view.</Text>;
    }

    // Define color scale for the heatmap (example)
    const heatmapColorScale = [
      '#ebedf0', // No activity (light gray)
      '#9be9a8', // Low activity
      '#40c463',
      '#30a14e',
      '#216e39'  // High activity (dark green)
    ];

     // Calculate end date for the heatmap (today)
     const endDateForHeatmap = new Date();
     // Calculate number of days to show (approx 6 months)
     const numDaysToShow = 183;

    return (
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <CalendarHeatmap
          endDate={endDateForHeatmap} // End date (today)
          numDays={numDaysToShow}     // Number of days to show (approx 6 months)
          values={heatmapData}    // Your data array: [{ date: 'YYYY-MM-DD', count: number }]
          colorArray={heatmapColorScale} // Colors for different activity levels
          // Optional props for customization:
          // squareSize={18}
          // gutterSize={2}
          // showMonthLabels={true}
          // monthLabelStyle={{ color: '#6B7280' }}
          // showWeekdayLabels={true}
        />
        <Text style={styles.chartDescription}>
          Daily question attempts over the last ~6 months.
        </Text>
      </View>
    );
  };

  const renderMainContent = () => {
    const displayLongestStreak = habitsData?.longest_streak ?? mockStudyHabitsData.longestStreak;
    const displayCurrentStreak = habitsData?.current_streak ?? 0;
    const displayBestTime = formatBestHour(habitsData ? habitsData.best_hour_utc : null);

    return (
       <ScrollView style={styles.scrollView}>
        {/* Study Habits Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Habits Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Clock size={20} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{mockStudyHabitsData.weeklyStudyHours}</Text>
              <Text style={styles.statLabel}>Weekly Hours</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Zap size={20} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{displayCurrentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Clock size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.statValue}>{mockStudyHabitsData.averageSessionLength}</Text>
              <Text style={styles.statLabel}>Avg. Session (min)</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={20} color="#f97316" />
              </View>
              <Text style={styles.statValue}>{displayLongestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
          </View>
        </View>
        
        {/* Weekly Consistency Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Consistency</Text>
          {renderConsistencyChart()}
        </View>
        
        {/* Productivity Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productivity Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Calendar size={20} color="#6366f1" />
              <Text style={styles.insightLabel}>Most Productive Day</Text>
              <Text style={styles.insightValue}>{mockStudyHabitsData.mostProductiveDay}</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Clock size={20} color="#6366f1" />
              <Text style={styles.insightLabel}>Peak Study Time</Text>
              <Text style={styles.insightValue}>{displayBestTime}</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightRow}>
              <CheckSquare size={20} color="#6366f1" />
              <Text style={styles.insightLabel}>Task Completion</Text>
              <Text style={styles.insightValue}>
                {Math.round((mockStudyHabitsData.completedTasks / mockStudyHabitsData.totalTasks) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(mockStudyHabitsData.completedTasks / mockStudyHabitsData.totalTasks) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressLabel}>
              {mockStudyHabitsData.completedTasks} of {mockStudyHabitsData.totalTasks} tasks completed
            </Text>
          </View>
        </View>
        
        {/* Study Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Locations</Text>
          {mockStudyHabitsData.studyLocations.map((location, index) => (
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
        
        {/* Study Calendar Heatmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Calendar Heatmap</Text>
          {renderHeatmap()} 
        </View>

        {/* Bottom space */}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading study habits...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerMessageContainer}> 
           <Text style={styles.errorText}>Error: {error}</Text>
         </View>
      ) : !habitsData ? (
         <View style={styles.centerMessageContainer}>
           <Text style={styles.infoText}>No study habits data available yet.</Text>
         </View>
      ) : (
        renderMainContent()
      )}
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
    backgroundColor: '#F9FAFB',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 16,
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
    marginTop: 8,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  centerMessageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 16,
  },
  infoText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 16,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 30,
    fontSize: 14,
  },
  chartDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
}); 