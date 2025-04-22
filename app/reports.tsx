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
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';

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
  // const { user: appContextUser } = useAppContext(); // Keep if needed for other context
  const { user: clerkUser } = useUser(); // Get user object from Clerk
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
    readinessScore: null as number | null,
    weakestSubjects: [] as Array<{ id: string, name: string, accuracy: number }>,
    weakestTopics: [] as Array<{ id: string, name: string, accuracy: number }>,
    isLoading: true,
    hasData: false,
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

  // Fetch exam readiness data from the table
  const fetchReadinessData = async () => {
    if (clerkUser?.id) { // Use clerkUser.id
      try {
        setReadinessData(prev => ({ ...prev, isLoading: true }));
        
        const { data, error } = await supabase
          .from('rep_exam_readiness')
          .select('readiness_score, weakest_subjects, weakest_topics')
          .eq('user_id', clerkUser.id) // Use clerkUser.id
          .maybeSingle(); 
        
        if (error) {
          console.error("Error fetching readiness data:", error);
          setReadinessData({
            readinessScore: null,
            weakestSubjects: [],
            weakestTopics: [],
            isLoading: false,
            hasData: false,
          });
          return;
        }
        
        if (data) {
          const subjects = Array.isArray(data.weakest_subjects) ? data.weakest_subjects : [];
          const topics = Array.isArray(data.weakest_topics) ? data.weakest_topics : [];
          
          setReadinessData({
            readinessScore: data.readiness_score,
            weakestSubjects: subjects,
            weakestTopics: topics,
            isLoading: false,
            hasData: true,
          });
        } else {
          setReadinessData({
            readinessScore: null,
            weakestSubjects: [],
            weakestTopics: [],
            isLoading: false,
            hasData: false,
          });
        }
      } catch (error) {
        console.error("Error in readiness fetch:", error);
        setReadinessData(prev => ({ ...prev, isLoading: false, hasData: false }));
      }
    } else {
      setReadinessData(prev => ({ ...prev, isLoading: false, hasData: false }));
    }
  };

  // Fetch analytics and readiness data when the screen loads
  useEffect(() => {
    // Only run once after user is available
    if (!clerkUser?.id || analyticsInitializedRef) return; // Use clerkUser.id
    setAnalyticsInitializedRef(true); // Mark as initialized

    const initializeData = async () => {
      await fetchReadinessData();

      try {
        const token = await getToken({ template: 'supabase' });
        // Pass Clerk user ID (UUID) to analytics utils if needed
        // Assuming updateUserReports uses email internally or is adapted
        const success = await updateUserReports(clerkUser.primaryEmailAddress?.emailAddress!, token || undefined); // Use Clerk email
        if (success) {
          console.log('Reports updated successfully');
        }
      } catch (error) {
        console.error('Error updating reports:', error);
      }

      fetchAnalyticsData();
    };

    initializeData();
  }, [clerkUser?.id, getToken]); // Depend on clerkUser.id

  // Fetch analytics data (excluding readiness, handled above)
  const fetchAnalyticsData = async () => {
    if (clerkUser?.id) { // Use clerkUser.id
      try {
        setAnalyticsData(prev => ({ ...prev, isLoading: true })); 
        
        const today = new Date().toISOString().split('T')[0];
        
        const { data: dailyOverview, error: dailyError } = await supabase
          .from('rep_daily_overview')
          .select('*')
          .eq('user_id', clerkUser.id) // Use clerkUser.id
          .eq('day', today)
          .maybeSingle();
          
        if (dailyError && dailyError.code !== 'PGRST116') {
          console.error("Error fetching daily overview:", dailyError);
        }
        
        const { data: studySessions, error: sessionsError } = await supabase
          .from('evt_study_sessions')
          .select('*')
          .eq('user_id', clerkUser.id) // Use clerkUser.id
          .gte('start_time', `${today}T00:00:00`)
          .lt('start_time', `${today}T23:59:59`);
          
        if (sessionsError) {
          console.error("Error fetching study sessions:", sessionsError);
        }
        
        const { data: studiedTopics, error: topicsError } = await supabase
          .from('user_studied_topics')
          .select('topic_name, created_at')
          .eq('user_id', clerkUser.id) // Use clerkUser.id
          .eq('study_date', today);
          
        if (topicsError) {
          console.error("Error fetching studied topics:", topicsError);
        }
        
        const { data: questionAttempts, error: attemptsError } = await supabase
          .from('evt_question_attempts')
          .select('*')
          .eq('user_id', clerkUser.id) // Use clerkUser.id
          .gte('completed_at', `${today}T00:00:00`)
          .lt('completed_at', `${today}T23:59:59`);
          
        if (attemptsError) {
          console.error("Error fetching question attempts:", attemptsError);
        }
        
        const totalQuestions = questionAttempts?.length || 0;
        const correctAnswers = questionAttempts?.filter(q => q.is_correct)?.length || 0;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        const sessions = studySessions?.map((session: any) => {
          const startTime = new Date(session.start_time);
          const duration = session.duration_minutes || 
            (session.end_time ? Math.round((new Date(session.end_time).getTime() - startTime.getTime()) / (1000 * 60)) : 0);
            
          return {
            time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: duration,
            score: Math.floor(Math.random() * 30) + 70
          };
        }) || [];
        
        const studyTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60;
        
        const calculatedDailyData: DailyAnalyticsData = {
          date: new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          totalQuestions,
          correctAnswers,
          accuracy,
          averageTime: questionAttempts?.reduce((sum: number, q: any) => sum + (q.time_taken_seconds || 0), 0) / (totalQuestions || 1),
          studyTime: studyTime > 0 ? studyTime : dailyOverview?.study_minutes_total ? dailyOverview.study_minutes_total / 60 : 0,
          topicsStudied: studiedTopics?.map(t => t.topic_name) || [],
          sessions: sessions.length > 0 ? sessions : [],
        };
        
        setAnalyticsData(prev => ({
          ...prev,
          dailyData: calculatedDailyData,
          isLoading: false,
        }));
        
      } catch (error) {
        console.error("Error in analytics fetch:", error);
        setAnalyticsData(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  // Separate effect for performance data that should update when period changes
  useEffect(() => {
    if (clerkUser?.id && analyticsInitializedRef) { // Use clerkUser.id and check initialization
      fetchPerformanceData();
    }
  }, [performancePeriod, clerkUser?.id, analyticsInitializedRef]); // Add dependency

  // Fetch performance data from Supabase using the RPC
  const fetchPerformanceData = async () => {
    if (clerkUser?.id) { // Use clerkUser.id
      try {
        setAnalyticsData(prev => ({ ...prev, performanceData: { ...prev.performanceData, isLoading: true } })); 
        
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
        }

        const { data: subjectData, error: subjectError } = await supabase.rpc(
          'get_detailed_metrics',
          {
            p_user_id: clerkUser.id, // Use clerkUser.id
            p_period_start: startDate,
            p_period_end: endDate,
            p_granularity: 'subject'
          }
        );
        
        if (subjectError) {
          console.error("Error fetching subject metrics:", subjectError);
          throw subjectError;
        }
        
        const { data: topicData, error: topicError } = await supabase.rpc(
          'get_detailed_metrics',
          {
            p_user_id: clerkUser.id, // Use clerkUser.id
            p_period_start: startDate,
            p_period_end: endDate,
            p_granularity: 'topic'
          }
        );
        
        if (topicError) {
          console.error("Error fetching topic metrics:", topicError);
          throw topicError;
        }
        
        setAnalyticsData(prev => ({
          ...prev,
          performanceData: {
            subjectMetrics: subjectData || [],
            topicMetrics: topicData || [],
            isLoading: false
          },
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
        }));
      }
    }
  };

  // Function to render the appropriate report content based on performance period
  const renderPerformanceContent = () => {
    if (!analyticsData.performanceData || analyticsData.performanceData.isLoading) {
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
  readinessContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  readinessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  gaugeContainer: {
    marginBottom: 24,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  detailsButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    width: '80%',
    justifyContent: 'center',
  },
  practiceButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#F9FAFB',
    margin: 16,
    borderRadius: 12,
    minHeight: 350,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 5,
  },
  modalScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  weakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  weakItemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  weakItemAccuracy: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  noWeakItems: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 16,
  },
  modalPracticeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  modalPracticeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

// Component to display the daily performance report
const DailyReportComponent = ({ data }: { data: DailyAnalyticsData | null }) => {
  if (!data) return null;
  
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Daily Performance Report</Text>
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
      <Text>Total Questions: {data?.totalQuestions || 0}</Text>
      <Text>Correct Answers: {data?.correctAnswers || 0}</Text>
      <Text>Accuracy: {data?.totalQuestions ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0}%</Text>
    </View>
  );
};

// Component to display the readiness report
const ReadinessReportComponent = ({ data, onOpenDetails, onStartPractice }: { 
  data: { 
    readinessScore: number | null; 
    isLoading: boolean; 
    hasData: boolean; 
    weakestSubjects: any[]; // Keep type simple for now
    weakestTopics: any[]; // Keep type simple for now
  }; 
  onOpenDetails: () => void; 
  onStartPractice: () => void 
}) => {
  
  if (data.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading readiness data...</Text>
      </View>
    );
  }

  if (!data.hasData) {
    return (
       <View style={styles.emptyStateContainer}>
          <Target size={60} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Calculate Your Readiness</Text>
          <Text style={styles.emptyStateText}>
            Complete more practice questions to generate your personalized exam readiness report and identify weak areas.
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={onStartPractice}
          >
            <Text style={styles.emptyStateButtonText}>Start Practice</Text>
          </TouchableOpacity>
        </View>
    );
  }

  const score = data.readinessScore ?? 0;
  const radius = 80;
  const strokeWidth = 15;
  const size = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = (score: number) => {
    if (score < 40) return '#EF4444';
    if (score < 70) return '#F59E0B';
    return '#10B981';
  };
  
  const color = getColor(score);

  return (
    <View style={styles.readinessContainer}>
      <Text style={styles.readinessTitle}>Exam Readiness</Text>
      
      <View style={styles.gaugeContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
          <SvgText
            x={size / 2}
            y={(size / 2) + (radius * 0.1)}
            textAnchor="middle"
            fontSize={radius * 0.4}
            fontWeight="bold"
            fill={color}
          >
            {`${Math.round(score)}%`}
          </SvgText>
           <SvgText
            x={size / 2}
            y={(size / 2) + (radius * 0.5)}
            textAnchor="middle"
            fontSize={radius * 0.15}
            fill="#6B7280"
          >
            Readiness
          </SvgText>
        </Svg>
      </View>

      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={onOpenDetails}
      >
        <Info size={16} color="#4F46E5" />
        <Text style={styles.detailsButtonText}>View Weak Areas</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.practiceButton}
        onPress={onStartPractice}
      >
        <Zap size={16} color="#FFF" />
        <Text style={styles.practiceButtonText}>Start Refine Session</Text> 
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
  readinessScore: number | null,
  weakestSubjects: Array<{ id: string, name: string, accuracy: number }>,
  weakestTopics: Array<{ id: string, name: string, accuracy: number }>
}) => {
  const router = useRouter();
  
  const handleStartRefineSession = () => {
    onClose(); 
    router.push('/practice'); 
  };
  
  const score = readinessScore ?? 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Readiness Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalScore}>Overall Readiness: {Math.round(score)}%</Text>
          
          <Text style={styles.modalSectionTitle}>Weakest Subjects</Text>
          {weakestSubjects.length > 0 ? (
            weakestSubjects.map((subject) => (
              <View key={subject.id} style={styles.weakItem}>
                <Text style={styles.weakItemName}>{subject.name}</Text>
                <Text style={styles.weakItemAccuracy}>{Math.round(subject.accuracy * 100)}% Accuracy</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noWeakItems}>No specific weak subjects identified based on recent practice.</Text>
          )}
          
          <Text style={styles.modalSectionTitle}>Weakest Topics</Text>
          {weakestTopics.length > 0 ? (
            weakestTopics.map((topic) => (
              <View key={topic.id} style={styles.weakItem}>
                <Text style={styles.weakItemName}>{topic.name}</Text>
                 <Text style={styles.weakItemAccuracy}>{Math.round(topic.accuracy * 100)}% Accuracy</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noWeakItems}>No specific weak topics identified based on recent practice.</Text>
          )}
          
          <TouchableOpacity 
            style={styles.modalPracticeButton}
            onPress={handleStartRefineSession} 
          >
             <Zap size={16} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.modalPracticeButtonText}>Start Refine Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
