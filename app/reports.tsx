import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
  Image,
  ActivityIndicator,
  Modal,
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
  ChevronRight,
  Target,
  AlertTriangle,
  Check,
  Info,
  Star,
  Trophy,
  Repeat,
  Brain,
  BookOpenCheck,
  Sword,
  ChevronDown,
  AlertCircle,
  Timer,
  BarChart2, 
  BookMarked,
  Clock3,
  ThermometerSun,
} from "lucide-react-native";
import { useAppContext } from "./context/AppContext";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from './utils/supabase';
import { updateUserReports } from './utils/analyticsUtils';
import ReadinessMeter from './components/ReadinessMeter';
import ReadinessEmptyState from './components/ReadinessEmptyState';
import { useAuth } from "@clerk/clerk-expo";
import { useUser } from "@clerk/clerk-expo";
import Ionicons from '@expo/vector-icons/Ionicons';

interface StudySession {
  time: string;
  duration: number;
  score: number;
}

interface DailyAnalyticsData {
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  studyTime: number;
  topicsStudied: string[];
  sessions: StudySession[];
  accuracy?: number;
}

interface PerformanceData {
  subjectMetrics: {
    entity_id: string;
    entity_name: string;
    accuracy_pct: number;
    avg_time_sec: number;
    attempts_count: number;
  }[];
  topicMetrics: {
    entity_id: string;
    entity_name: string;
    accuracy_pct: number;
    avg_time_sec: number;
    avg_difficulty: number;
    attempts_count: number;
  }[];
  isLoading: boolean;
}

interface AnalyticsState {
  dailyData: DailyAnalyticsData | null;
  weeklyData: any | null;
  monthlyData: any | null;
  performanceData: PerformanceData | null;
  isLoading: boolean;
}

// Custom hook for animations
const useAnimatedValues = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return { fadeAnim, slideAnim };
};

export default function ReportsScreen() {
  const router = useRouter();
  const { user } = useAppContext();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("performance");
  const [performancePeriod, setPerformancePeriod] = useState("daily");
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [readinessDetailsVisible, setReadinessDetailsVisible] = useState(false);
  
  // Create animation values for each tab ahead of time
  const performanceAnimations = useAnimatedValues();
  const readinessAnimations = useAnimatedValues();
  
  // Add refs to track initialization state
  const reportsUpdatedRef = useRef(false);
  const analyticsInitializedRef = useRef(false);
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsState>({
    dailyData: null,
    weeklyData: null,
    monthlyData: null,
    performanceData: null,
    isLoading: true,
  });
  const [readinessData, setReadinessData] = useState({
    readinessScore: 0,
    weakestSubjects: [],
    weakestTopics: [],
    isLoading: true,
  });

  const handleBackPress = () => {
    router.back();
  };

  // Open readiness details modal
  const handleOpenReadinessDetails = () => {
    setReadinessDetailsVisible(true);
  };

  // Close readiness details modal
  const handleCloseReadinessDetails = () => {
    setReadinessDetailsVisible(false);
  };

  // Navigate to practice screen
  const handleStartPractice = () => {
    router.push('/practice');
  };

  // Fetch exam readiness data
  const fetchReadinessData = async () => {
    if (user?.email) {
      try {
        setReadinessData(prev => ({ ...prev, isLoading: true }));
        
        // Call the RPC to get readiness data
        const { data, error } = await supabase.rpc(
          'get_exam_readiness'
        );
        
        if (error) {
          console.error("Error fetching readiness data:", error);
          // Don't throw the error, just set empty data
          setReadinessData({
            readinessScore: 0,
            weakestSubjects: [],
            weakestTopics: [],
            isLoading: false,
          });
          return;
        }
        
        if (data && data.length > 0) {
          // Convert subject and topic arrays to the correct format
          const subjects = Array.isArray(data[0].weakest_subjects) ? data[0].weakest_subjects : [];
          const topics = Array.isArray(data[0].weakest_topics) ? data[0].weakest_topics : [];
          
          setReadinessData({
            readinessScore: data[0].readiness_score || 0,
            weakestSubjects: subjects,
            weakestTopics: topics,
            isLoading: false,
          });
        } else {
          // No data found
          setReadinessData({
            readinessScore: 0,
            weakestSubjects: [],
            weakestTopics: [],
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error in readiness fetch:", error);
        setReadinessData(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  // Fetch analytics and readiness data when the screen loads - fixed to prevent infinite loops
  useEffect(() => {
    // Skip if already initialized 
    if (analyticsInitializedRef.current) return;
    analyticsInitializedRef.current = true;

    if (user && user.email) {
      // Only update reports once
      const updateReports = async () => {
        if (reportsUpdatedRef.current) return;
        
        try {
          // Set the ref to true to prevent multiple calls
          reportsUpdatedRef.current = true;
          
          const token = await getToken({ template: 'supabase' });
          const success = await updateUserReports(user.email, token || undefined);
          
          if (success) {
            console.log('Reports updated successfully');
            // Fetch readiness data after reports are updated
            fetchReadinessData();
          }
        } catch (error) {
          console.error('Error updating reports:', error);
        }
      };
      
      updateReports();
       
      // Fetch analytics data (only once)
      const fetchAnalyticsData = async () => {
        if (user && user.email) {
          try {
            // Get today's date and convert to ISO string format YYYY-MM-DD
            const today = new Date().toISOString().split('T')[0];
            
            // Fetch daily overview data
            const { data: dailyOverview, error: dailyError } = await supabase
              .from('rep_daily_overview')
              .select('*')
              .eq('user_id', user.email)
              .eq('day', today)
              .single();
              
            if (dailyError && dailyError.code !== 'PGRST116') {
              console.error("Error fetching daily overview:", dailyError);
            }
            
            // Fetch study sessions for today
            const { data: studySessions, error: sessionsError } = await supabase
              .from('evt_study_sessions')
              .select('*')
              .eq('user_id', user.email)
              .gte('start_time', `${today}T00:00:00`)
              .lt('start_time', `${today}T23:59:59`);
              
            if (sessionsError) {
              console.error("Error fetching study sessions:", sessionsError);
            }
            
            // Fetch studied topics for today
            const { data: studiedTopics, error: topicsError } = await supabase
              .from('user_studied_topics')
              .select('topic_name, created_at')
              .eq('user_id', user.email)
              .eq('study_date', today);
              
            if (topicsError) {
              console.error("Error fetching studied topics:", topicsError);
            }
            
            // Fetch question attempts for today
            const { data: questionAttempts, error: attemptsError } = await supabase
              .from('evt_question_attempts')
              .select('*')
              .eq('user_id', user.email)
              .gte('completed_at', `${today}T00:00:00`)
              .lt('completed_at', `${today}T23:59:59`);
              
            if (attemptsError) {
              console.error("Error fetching question attempts:", attemptsError);
            }
            
            // Calculate daily metrics
            const totalQuestions = questionAttempts?.length || 0;
            const correctAnswers = questionAttempts?.filter(q => q.is_correct)?.length || 0;
            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            
            // Format study sessions
            const sessions = studySessions?.map((session: any) => {
              const startTime = new Date(session.start_time);
              const duration = session.duration_minutes || 
                (session.end_time ? Math.round((new Date(session.end_time).getTime() - startTime.getTime()) / (1000 * 60)) : 0);
                
              return {
                time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                duration: duration,
                score: Math.floor(Math.random() * 30) + 70 // Placeholder score since we don't track per-session score
              };
            }) || [];
            
            // Aggregate study time
            const studyTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60; // Convert to hours
            
            // Build the daily data object
            const calculatedDailyData: DailyAnalyticsData = {
              date: new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
              totalQuestions,
              correctAnswers,
              accuracy,
              averageTime: questionAttempts?.reduce((sum: number, q: any) => sum + (q.time_taken_seconds || 0), 0) / (totalQuestions || 1),
              studyTime: studyTime > 0 ? studyTime : dailyOverview?.study_minutes_total ? dailyOverview.study_minutes_total / 60 : 0,
              topicsStudied: studiedTopics?.map(t => t.topic_name) || [],
              sessions: sessions.length > 0 ? sessions : [
                { time: "8:30 AM", duration: 45, score: 85 },
                { time: "1:15 PM", duration: 30, score: 92 },
              ],
            };
            
            setAnalyticsData({
              dailyData: calculatedDailyData,
              weeklyData: null, // Placeholder - would come from real data
              monthlyData: null, // Placeholder - would come from real data
              performanceData: null,
              isLoading: false,
            });
            
          } catch (error) {
            console.error("Error in analytics fetch:", error);
            setAnalyticsData(prev => ({ ...prev, isLoading: false }));
          }
        }
      };
      
      fetchAnalyticsData();
      fetchPerformanceData();
    }
  }, [user?.email]); // Only depends on user.email

  // Separate effect for performance data that should update when period changes
  useEffect(() => {
    if (user?.email && analyticsInitializedRef.current) {
      fetchPerformanceData();
    }
  }, [performancePeriod, user?.email]);

  // Fetch performance data from Supabase using the RPC
  const fetchPerformanceData = async () => {
    if (user && user.email) {
      try {
        setAnalyticsData(prev => ({ ...prev, isLoading: true }));
        
        // Get date range based on selected period
        let startDate: string | null = null;
        const today = new Date();
        const endDate = today.toISOString();
        
        if (performancePeriod === "daily") {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = yesterday.toISOString();
        } else if (performancePeriod === "weekly") {
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          startDate = lastWeek.toISOString();
        } else if (performancePeriod === "monthly") {
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          startDate = lastMonth.toISOString();
        } else if (performancePeriod === "all") {
          startDate = null; // No start date means all time
        }
        
        // Call the get_detailed_metrics RPC for subject level metrics
        const { data: subjectData, error: subjectError } = await supabase.rpc(
          'get_detailed_metrics',
          {
            p_user_id: user.email,
            p_period_start: startDate,
            p_period_end: endDate,
            p_granularity: 'subject'
          }
        );
        
        if (subjectError) {
          console.error("Error fetching subject metrics:", subjectError);
          throw subjectError;
        }
        
        // Call the get_detailed_metrics RPC for topic level metrics
        const { data: topicData, error: topicError } = await supabase.rpc(
          'get_detailed_metrics',
          {
            p_user_id: user.email,
            p_period_start: startDate,
            p_period_end: endDate,
            p_granularity: 'topic'
          }
        );
        
        if (topicError) {
          console.error("Error fetching topic metrics:", topicError);
          throw topicError;
        }
        
        // Update state with the performance data
        setAnalyticsData(prev => ({
          ...prev,
          performanceData: {
            subjectMetrics: subjectData || [],
            topicMetrics: topicData || [],
            isLoading: false
          },
          isLoading: false
        }));
        
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setAnalyticsData(prev => ({ 
          ...prev, 
          performanceData: {
            subjectMetrics: [],
            topicMetrics: [],
            isLoading: false
          },
          isLoading: false 
        }));
      }
    }
  };

  // Mock data for performance metrics (used as fallback if real data isn't available)
  const dailyData = analyticsData.dailyData || {
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

  // Function to render the appropriate report content based on performance period
  const renderPerformanceContent = () => {
    if (analyticsData.isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading report data...</Text>
        </View>
      );
    }

    switch (performancePeriod) {
      case 'daily':
        return (
          <Animated.View 
            style={{
              opacity: performanceAnimations.fadeAnim,
              transform: [{ translateY: performanceAnimations.slideAnim }]
            }}
          >
            <DailyReportComponent data={analyticsData.dailyData} />
          </Animated.View>
        );
      case 'weekly':
        return (
          <Animated.View 
            style={{
              opacity: performanceAnimations.fadeAnim,
              transform: [{ translateY: performanceAnimations.slideAnim }]
            }}
          >
            <WeeklyReportComponent data={analyticsData.weeklyData} />
          </Animated.View>
        );
      case 'monthly':
        return (
          <Animated.View 
            style={{
              opacity: performanceAnimations.fadeAnim,
              transform: [{ translateY: performanceAnimations.slideAnim }]
            }}
          >
            <MonthlyReportComponent data={analyticsData.monthlyData} />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation - only Performance and Readiness */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "performance" && styles.activeTab]}
          onPress={() => setActiveTab("performance")}
        >
          <View style={styles.tabIconContainer}>
            <BarChart2 size={18} color={activeTab === "performance" ? "#4F46E5" : "#6B7280"} />
            <Text style={[styles.tabText, activeTab === "performance" && styles.activeTabText]}>
              Performance
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "readiness" && styles.activeTab]}
          onPress={() => setActiveTab("readiness")}
        >
          <View style={styles.tabIconContainer}>
            <Target size={18} color={activeTab === "readiness" ? "#4F46E5" : "#6B7280"} />
            <Text style={[styles.tabText, activeTab === "readiness" && styles.activeTabText]}>
              Readiness
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "performance" && (
          <>
            {/* Period selector dropdown for Performance tab */}
            <View style={styles.periodSelectorContainer}>
              <Text style={styles.periodSelectorLabel}>View:</Text>
              <TouchableOpacity 
                style={styles.periodSelectorButton}
                onPress={() => setShowPeriodSelector(!showPeriodSelector)}
              >
                <Text style={styles.periodSelectorButtonText}>
                  {performancePeriod === 'daily' ? 'Daily' : 
                   performancePeriod === 'weekly' ? 'Weekly' : 'Monthly'} Report
                </Text>
                <ChevronDown size={16} color="#4B5563" />
              </TouchableOpacity>
              
              {showPeriodSelector && (
                <View style={styles.periodDropdown}>
                  <TouchableOpacity 
                    style={styles.periodOption}
                    onPress={() => {
                      setPerformancePeriod('daily');
                      setShowPeriodSelector(false);
                    }}
                  >
                    <Text style={[
                      styles.periodOptionText, 
                      performancePeriod === 'daily' && styles.periodOptionSelected
                    ]}>
                      Daily
                    </Text>
                    {performancePeriod === 'daily' && (
                      <Check size={16} color="#4F46E5" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.periodOption}
                    onPress={() => {
                      setPerformancePeriod('weekly');
                      setShowPeriodSelector(false);
                    }}
                  >
                    <Text style={[
                      styles.periodOptionText, 
                      performancePeriod === 'weekly' && styles.periodOptionSelected
                    ]}>
                      Weekly
                    </Text>
                    {performancePeriod === 'weekly' && (
                      <Check size={16} color="#4F46E5" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.periodOption}
                    onPress={() => {
                      setPerformancePeriod('monthly');
                      setShowPeriodSelector(false);
                    }}
                  >
                    <Text style={[
                      styles.periodOptionText, 
                      performancePeriod === 'monthly' && styles.periodOptionSelected
                    ]}>
                      Monthly
                    </Text>
                    {performancePeriod === 'monthly' && (
                      <Check size={16} color="#4F46E5" />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {/* Render the selected performance content */}
            {renderPerformanceContent()}
          </>
        )}

        {activeTab === "readiness" && (
          <Animated.View 
            style={{
              opacity: readinessAnimations.fadeAnim,
              transform: [{ translateY: readinessAnimations.slideAnim }]
            }}
          >
            <ReadinessReportComponent 
              data={readinessData} 
              onOpenDetails={handleOpenReadinessDetails}
              onStartPractice={handleStartPractice}
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* Readiness details modal */}
      <ReadinessDetailsModal 
        visible={readinessDetailsVisible}
        onClose={handleCloseReadinessDetails}
        readinessScore={readinessData.readinessScore}
        weakestSubjects={readinessData.weakestSubjects}
        weakestTopics={readinessData.weakestTopics}
      />
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4F46E5",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#4F46E5",
  },
  content: {
    flex: 1,
  },
  periodSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    position: 'relative',
  },
  periodSelectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginRight: 8,
  },
  periodSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodSelectorButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 4,
  },
  periodDropdown: {
    position: 'absolute',
    top: 45,
    left: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    width: 140,
  },
  periodOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodOptionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  periodOptionSelected: {
    fontWeight: '600',
    color: '#4F46E5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
});

// Component to display the daily performance report
const DailyReportComponent = ({ data }: { data: any }) => {
  if (!data) return null;
  
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Daily Performance Report</Text>
      {/* Implement your daily report UI here with the data */}
      <Text>Total Questions: {data?.totalQuestions || 0}</Text>
      <Text>Correct Answers: {data?.correctAnswers || 0}</Text>
      <Text>Accuracy: {data?.totalQuestions ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0}%</Text>
    </View>
  );
};

// Component to display the weekly performance report
const WeeklyReportComponent = ({ data }: { data: any }) => {
  if (!data) return null;
  
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Weekly Performance Report</Text>
      {/* Implement your weekly report UI here with the data */}
      <Text>Total Questions: {data?.totalQuestions || 0}</Text>
      <Text>Correct Answers: {data?.correctAnswers || 0}</Text>
      <Text>Accuracy: {data?.totalQuestions ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0}%</Text>
    </View>
  );
};

// Component to display the monthly performance report
const MonthlyReportComponent = ({ data }: { data: any }) => {
  if (!data) return null;
  
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Monthly Performance Report</Text>
      {/* Implement your monthly report UI here with the data */}
      <Text>Total Questions: {data?.totalQuestions || 0}</Text>
      <Text>Correct Answers: {data?.correctAnswers || 0}</Text>
      <Text>Accuracy: {data?.totalQuestions ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0}%</Text>
    </View>
  );
};

// Component to display the readiness report
const ReadinessReportComponent = ({ data, onOpenDetails, onStartPractice }: { data: any, onOpenDetails: () => void, onStartPractice: () => void }) => {
  if (!data || data.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading readiness data...</Text>
      </View>
    );
  }
  
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Readiness Report</Text>
      <Text>Readiness Score: {data.readinessScore}%</Text>
      
      <TouchableOpacity 
        style={{ 
          backgroundColor: '#4F46E5', 
          padding: 12, 
          borderRadius: 8, 
          alignItems: 'center',
          marginTop: 16 
        }}
        onPress={onOpenDetails}
      >
        <Text style={{ color: '#FFF', fontWeight: '600' }}>View Details</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{ 
          backgroundColor: '#10B981', 
          padding: 12, 
          borderRadius: 8, 
          alignItems: 'center',
          marginTop: 12 
        }}
        onPress={onStartPractice}
      >
        <Text style={{ color: '#FFF', fontWeight: '600' }}>Start Practice</Text>
      </TouchableOpacity>
    </View>
  );
};

// Readiness details modal component
const ReadinessDetailsModal = ({ 
  visible, 
  onClose, 
  readinessScore, 
  weakestSubjects, 
  weakestTopics 
}: { 
  visible: boolean,
  onClose: () => void,
  readinessScore: number,
  weakestSubjects: Array<{ name: string, score: number, id?: string }>,
  weakestTopics: Array<{ name: string, score: number, id?: string }>
}) => {
  const router = useRouter();
  
  // Handle start refine session
  const handleStartPractice = () => {
    // Close the modal
    onClose();
    
    // Navigate to the practice screen
    router.push('/practice');
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center',
        padding: 16
      }}>
        <View style={{ 
          backgroundColor: '#FFF', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Readiness Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          <Text style={{ fontSize: 16, marginBottom: 12 }}>Readiness Score: {readinessScore}%</Text>
          
          <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 16 }}>Weakest Subjects</Text>
          {weakestSubjects.length > 0 ? (
            weakestSubjects.map((subject: { name: string, score: number, id?: string }, index: number) => (
              <View key={index} style={{ marginVertical: 8 }}>
                <Text>{subject.name}: {subject.score}%</Text>
              </View>
            ))
          ) : (
            <Text style={{ marginTop: 8, color: '#6B7280' }}>No weak subjects identified</Text>
          )}
          
          <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 16 }}>Weakest Topics</Text>
          {weakestTopics.length > 0 ? (
            weakestTopics.map((topic: { name: string, score: number, id?: string }, index: number) => (
              <View key={index} style={{ marginVertical: 8 }}>
                <Text>{topic.name}: {topic.score}%</Text>
              </View>
            ))
          ) : (
            <Text style={{ marginTop: 8, color: '#6B7280' }}>No weak topics identified</Text>
          )}
          
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#4F46E5', 
              padding: 12, 
              borderRadius: 8, 
              alignItems: 'center',
              marginTop: 24 
            }}
            onPress={handleStartPractice}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Start Practice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
