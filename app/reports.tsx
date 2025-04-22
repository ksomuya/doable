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
  FlatList,
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
  CheckSquare,
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
import { BarChart as RNBarChart } from 'react-native-chart-kit';

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

interface PerformanceMetricItem {
  entity_id: string;
  entity_name: string;
  accuracy_pct: number;
  avg_time_sec: number;
  attempts_count: number;
  avg_difficulty?: number;
}

interface PerformanceData {
  subjectMetrics: PerformanceMetricItem[];
  topicMetrics: PerformanceMetricItem[];
  isLoading: boolean;
}

interface AnalyticsState {
  dailyData: DailyAnalyticsData | null;
  weeklyData: any | null;
  monthlyData: any | null;
  performanceData: PerformanceData | null;
  isLoading: boolean;
}

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
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("performance");
  const [performancePeriod, setPerformancePeriod] = useState("daily");
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [readinessDetailsVisible, setReadinessDetailsVisible] = useState(false);
  
  const performanceAnimations = useAnimatedValues();
  const readinessAnimations = useAnimatedValues();
  const nudgeAnimations = useAnimatedValues();
  
  const reportsUpdatedRef = useRef(false);
  const dataInitializedRef = useRef(false);
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsState>({
    dailyData: null,
    weeklyData: null,
    monthlyData: null,
    performanceData: { subjectMetrics: [], topicMetrics: [], isLoading: true },
    isLoading: true,
  });
  const [readinessData, setReadinessData] = useState({
    readinessScore: null as number | null,
    weakestSubjects: [] as Array<{ id: string, name: string, accuracy: number }>,
    weakestTopics: [] as Array<{ id: string, name: string, accuracy: number }>,
    isLoading: true,
    hasData: false,
  });
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBackPress = () => {
    router.back();
  };

  const handleOpenReadinessDetails = () => {
    setReadinessDetailsVisible(true);
  };

  const handleCloseReadinessDetails = () => {
    setReadinessDetailsVisible(false);
  };

  const handleStartPractice = () => {
    router.push('/practice');
  };

  useEffect(() => {
    if (!clerkUser?.id || dataInitializedRef.current) return; 
    dataInitializedRef.current = true;
    setIsLoadingInitialData(true);
    setError(null);

    const initializeData = async () => {
      try {
        console.log(`[ReportsScreen] Fetching attempt count for user: ${clerkUser.id}`);
        const { data: countData, error: countError } = await supabase.rpc('get_user_attempt_count', {
          p_user_id: clerkUser.id
        });
        console.log(`[ReportsScreen] RPC get_user_attempt_count returned:`, countData, countError);

        if (countError) throw new Error(`Failed to fetch attempt count: ${countError.message}`);
        
        setAttemptCount(countData);
        console.log(`[ReportsScreen] Set attemptCount state to: ${countData}`);

        if (countData > 0) {
           console.log(`[ReportsScreen] User has attempts (${countData}), fetching other data...`);
           await Promise.all([ 
             fetchReadinessData(), 
             fetchAnalyticsData(), 
             fetchPerformanceData()
           ]);
        } else {
            console.log(`[ReportsScreen] User has 0 attempts, skipping other data fetches.`);
        }

      } catch (err: any) {
        console.error("Error initializing report data:", err);
        setError(err.message || 'Failed to load report data.');
        setAttemptCount(null);
      } finally {
        setIsLoadingInitialData(false);
        console.log(`[ReportsScreen] Finished initialization, isLoadingInitialData: false`);
      }
    };
    initializeData();
  }, [clerkUser?.id]);

  useEffect(() => {
    if (!isLoadingInitialData && attemptCount !== null && attemptCount > 0) {
      fetchPerformanceData(); 
    }
  }, [performancePeriod, isLoadingInitialData, attemptCount]);

  const fetchReadinessData = async () => {
    if (!clerkUser?.id) return;
    setReadinessData(prev => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase
        .from('rep_exam_readiness')
        .select('readiness_score, weakest_subjects, weakest_topics')
        .eq('user_id', clerkUser.id)
        .maybeSingle(); 
      if (error) throw error;
      if (data) {
        const subjects = Array.isArray(data.weakest_subjects) ? data.weakest_subjects : [];
        const topics = Array.isArray(data.weakest_topics) ? data.weakest_topics : [];
        setReadinessData({ readinessScore: data.readiness_score, weakestSubjects: subjects, weakestTopics: topics, isLoading: false, hasData: true });
      } else {
        setReadinessData({ readinessScore: null, weakestSubjects: [], weakestTopics: [], isLoading: false, hasData: false });
      }
    } catch (err: any) {
      console.error("Error fetching readiness data:", err);
      setError(err.message || 'Failed to load readiness data');
      setReadinessData(prev => ({ ...prev, isLoading: false, hasData: false }));
    }
  };

  const fetchAnalyticsData = async () => {
    if (!clerkUser?.id) return;
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data: dailyOverview, error: dailyError } = await supabase
          .from('rep_daily_overview')
          .select('*')
          .eq('user_id', clerkUser.id) 
          .eq('day', today)
          .maybeSingle();
        if (dailyError && dailyError.code !== 'PGRST116') throw dailyError;

        const { data: studySessions, error: sessionsError } = await supabase
          .from('evt_study_sessions')
          .select('*')
          .eq('user_id', clerkUser.id)
          .gte('start_time', `${today}T00:00:00`)
          .lt('start_time', `${today}T23:59:59`);
        if (sessionsError) throw sessionsError;

        const { data: questionAttempts, error: attemptsError } = await supabase
          .from('evt_question_attempts')
          .select('is_correct, time_taken_seconds')
          .eq('user_id', clerkUser.id)
          .gte('completed_at', `${today}T00:00:00`)
          .lt('completed_at', `${today}T23:59:59`);
        if (attemptsError) throw attemptsError;
        
        const totalQuestions = questionAttempts?.length || 0;
        const correctAnswers = questionAttempts?.filter(q => q.is_correct)?.length || 0;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const avgTime = totalQuestions > 0 ? (questionAttempts?.reduce((sum: number, q: any) => sum + (q.time_taken_seconds || 0), 0) / totalQuestions) : 0;
        
        const sessions = (studySessions || []).map((session: any) => {
           const startTime = new Date(session.start_time);
           const duration = session.duration_minutes || (session.end_time ? Math.round((new Date(session.end_time).getTime() - startTime.getTime()) / (1000 * 60)) : 0);
           return { time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), duration, score: 0 };
         });
        const studyTime = sessions.reduce((sum, session) => sum + session.duration, 0);

        const calculatedDailyData: DailyAnalyticsData = {
          date: new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
          totalQuestions,
          correctAnswers,
          accuracy,
          averageTime: avgTime,
          studyTime: studyTime > 0 ? studyTime / 60 : dailyOverview?.study_minutes_total ? dailyOverview.study_minutes_total / 60 : 0,
          topicsStudied: [],
          sessions: sessions,
        };
        
        setAnalyticsData(prev => ({ ...prev, dailyData: calculatedDailyData }));
        
      } catch (err: any) {
        console.error("Error fetching daily analytics data:", err);
        setError(err.message || 'Failed to load daily data');
        setAnalyticsData(prev => ({ ...prev, dailyData: null }));
      }
  };

  const fetchPerformanceData = async () => {
    if (!clerkUser?.id || performancePeriod === 'daily') {
        if (performancePeriod === 'daily') {
             setAnalyticsData(prev => ({ 
                ...prev,
                performanceData: { 
                    ...(prev.performanceData ?? { subjectMetrics: [], topicMetrics: [], isLoading: false }), 
                    isLoading: false 
                }
            }));
        }
        return;
    }
    setAnalyticsData(prev => ({
       ...prev,
       performanceData: { 
           ...(prev.performanceData ?? { subjectMetrics: [], topicMetrics: [], isLoading: true }), 
           isLoading: true 
        } 
    }));
    try {
        let startDate: string | null = null;
        const today = new Date();
        const endDate = today.toISOString();
        if (performancePeriod === "weekly") { startDate = new Date(today.setDate(today.getDate() - 7)).toISOString(); }
        else if (performancePeriod === "monthly") { startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString(); }
        if (performancePeriod === 'daily') { 
            setAnalyticsData(prev => ({ 
                ...prev, 
                performanceData: { 
                    ...(prev.performanceData ?? { subjectMetrics: [], topicMetrics: [] }),
                    isLoading: false 
                }
            }));
            return;
        }

        const { data: subjectData, error: subjectError } = await supabase.rpc('get_detailed_metrics', { p_user_id: clerkUser.id, p_period_start: startDate, p_period_end: endDate, p_granularity: 'subject' });
        if (subjectError) throw subjectError;
        const { data: topicData, error: topicError } = await supabase.rpc('get_detailed_metrics', { p_user_id: clerkUser.id, p_period_start: startDate, p_period_end: endDate, p_granularity: 'topic' });
        if (topicError) throw topicError;
        
        setAnalyticsData(prev => ({
             ...prev, 
             performanceData: { 
                 subjectMetrics: subjectData || [], 
                 topicMetrics: topicData || [], 
                 isLoading: false 
                }
             }));
      } catch (err: any) {
        console.error("Error fetching performance data:", err);
        setError(err.message || 'Failed to load performance data');
        setAnalyticsData(prev => ({
             ...prev, 
             performanceData: { 
                 subjectMetrics: [], 
                 topicMetrics: [], 
                 isLoading: false 
                }
             }));
      }
  };

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

  const renderNudge = () => {
    console.log("Analytics Event: NudgeShown");

    return (
      <Animated.View 
        style={[styles.nudgeContainer, {
          opacity: nudgeAnimations.fadeAnim, 
          transform: [{ translateY: nudgeAnimations.slideAnim }]
        }]}
      >
        <AlertCircle size={60} color="#9CA3AF" />
        <Text style={styles.nudgeTitle}>Ready to Start?</Text>
        <Text style={styles.nudgeText}>
          You haven't attempted any questions yet. Dive into practice sessions to build your knowledge and track your progress!
        </Text>
        <TouchableOpacity 
          style={styles.nudgeButton}
          onPress={handleStartPractice}
        >
          <Zap size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.nudgeButtonText}>Start Practice</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMainReports = () => (
      <>
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
            <Animated.View 
                style={{
                opacity: performanceAnimations.fadeAnim,
                transform: [{ translateY: performanceAnimations.slideAnim }]
                }}
            >
                <View style={styles.periodSelectorContainer}>
                 <Text style={styles.periodSelectorLabel}>View:</Text>
                  <TouchableOpacity 
                    style={styles.periodSelectorButton}
                    onPress={() => setShowPeriodSelector(!showPeriodSelector)}
                  >
                    <Text style={styles.periodSelectorButtonText}>
                      {performancePeriod === 'daily' ? 'Daily Summary' : 
                       performancePeriod === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'} 
                    </Text>
                    <ChevronDown size={16} color="#4B5563" />
                  </TouchableOpacity>
                  
                  {showPeriodSelector && (
                    <View style={styles.periodDropdown}>
                      {['daily', 'weekly', 'monthly'].map(period => (
                         <TouchableOpacity 
                            key={period}
                            style={styles.periodOption}
                            onPress={() => { setPerformancePeriod(period); setShowPeriodSelector(false); }}
                         >
                           <Text style={[
                             styles.periodOptionText, 
                             performancePeriod === period && styles.periodOptionSelected
                           ]}>
                              {period === 'daily' ? 'Daily Summary' : period === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'}
                           </Text>
                           {performancePeriod === period && <Check size={16} color="#4F46E5" />} 
                         </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                
                {performancePeriod === 'daily' ? (
                    <DailyReportComponent data={analyticsData.dailyData} />
                 ) : (
                    <PerformanceMetricsComponent data={analyticsData.performanceData} />
                 )}
            </Animated.View>
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

        <ReadinessDetailsModal 
            visible={readinessDetailsVisible}
            onClose={handleCloseReadinessDetails}
            readinessScore={readinessData.readinessScore}
            weakestSubjects={readinessData.weakestSubjects}
            weakestTopics={readinessData.weakestTopics}
        />
      </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={20} color="#1F2937" /> 
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
        <View style={styles.placeholder} />
      </View>

      {(() => {
          console.log(`[ReportsScreen] Rendering - isLoading: ${isLoadingInitialData}, error: ${error}, attemptCount: ${attemptCount}`);
          if (isLoadingInitialData) {
            return (
                <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading reports...</Text>
                </View>
            );
          } else if (error) {
            return (
                <View style={styles.centerMessageContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            );
          } else if (attemptCount === 0) {
             console.log(`[ReportsScreen] Rendering Nudge (attemptCount is 0)`);
             return renderNudge();
          } else {
             console.log(`[ReportsScreen] Rendering Main Reports (attemptCount is > 0 or null)`);
             return renderMainReports();
          }
      })()}
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
  centerMessageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#DC2626', textAlign: 'center', fontSize: 16,
  },
  nudgeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#F9FAFB',
    margin: 16,
    borderRadius: 12,
  },
  nudgeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  nudgeText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  nudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  nudgeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
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
  componentTitle: {
    fontSize: 18, fontWeight: '600', color: '#1F2937',
    marginBottom: 12, paddingHorizontal: 16, paddingTop: 16,
  },
  subtleHeading: {
    fontSize: 14, fontWeight: '500', color: '#6B7280',
    marginTop: 16, marginBottom: 8, paddingHorizontal: 16,
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
  dailyReportContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statLabelSmall: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
  },
  sessionText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartContainer: {
    marginVertical: 8,
    borderRadius: 16,
  },
  topicListContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxHeight: 300,
  },
  topicItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topicName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  topicStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topicStat: {
    fontSize: 13,
    color: '#6B7280',
    minWidth: 60,
    textAlign: 'left',
  },
  infoText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 15,
  },
  noDataContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  sessionsContainer: { marginTop: 8, paddingHorizontal: 16 },
});

const DailyReportComponent = ({ data }: { data: DailyAnalyticsData | null }) => {
  if (!data) {
      return (
         <View style={styles.noDataContainer}> 
            <Text style={styles.infoText}>No activity recorded for today yet.</Text>
          </View>
      );
  }
  return (
    <View style={styles.dailyReportContainer}>
       <Text style={styles.componentTitle}>Today's Summary ({data.date})</Text>
       <View style={styles.statsRow}>
          <View style={styles.statItem}>
              <Text style={styles.statValueLarge}>{data.totalQuestions}</Text>
              <Text style={styles.statLabelSmall}>Questions</Text>
          </View>
          <View style={styles.statItem}>
              <Text style={styles.statValueLarge}>{data.accuracy ?? 0}%</Text> 
              <Text style={styles.statLabelSmall}>Accuracy</Text>
          </View>
          <View style={styles.statItem}>
               <Text style={styles.statValueLarge}>{(data.studyTime ?? 0).toFixed(1)}</Text> 
               <Text style={styles.statLabelSmall}>Hours Studied</Text>
          </View>
       </View>
       <View style={styles.statsRow}> 
           <View style={styles.statItem}>
               <Text style={styles.statValueLarge}>{Math.round(data.averageTime ?? 0)}s</Text>
               <Text style={styles.statLabelSmall}>Avg Time / Q</Text>
           </View>
           <View style={[styles.statItem, { opacity: 0 }]} /> 
           <View style={[styles.statItem, { opacity: 0 }]} />
       </View>
       {data.sessions && data.sessions.length > 0 && (
         <View style={styles.sessionsContainer}>
           <Text style={styles.subtleHeading}>Sessions Today:</Text>
           {data.sessions.map((s: StudySession, i: number) => (
             <Text key={i} style={styles.sessionText}>{s.time} ({s.duration} min)</Text>
           ))} 
         </View>
        )}
    </View>
  );
};

const WeeklyReportComponent = ({ data }: { data: any }) => {
  if (!data) return null;
  
  return (
    <View style={styles.dailyReportContainer}>
      <Text style={styles.componentTitle}>Weekly Performance Report</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValueLarge}>{data?.totalQuestions || 0}</Text>
          <Text style={styles.statLabelSmall}>Total Questions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValueLarge}>{data?.correctAnswers || 0}</Text>
          <Text style={styles.statLabelSmall}>Correct Answers</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValueLarge}>{data?.accuracy ? Math.round(data.accuracy) : 0}%</Text>
          <Text style={styles.statLabelSmall}>Accuracy</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValueLarge}>{data?.averageTime ? Math.round(data.averageTime) : 0}s</Text>
          <Text style={styles.statLabelSmall}>Average Time</Text>
        </View>
      </View>
      <View style={styles.sessionText}>
        <Text style={styles.componentTitle}>Study Sessions</Text>
        {data?.sessions.map((session, index) => (
          <Text key={index}>{session.time} - {session.duration} minutes</Text>
        ))}
      </View>
    </View>
  );
};

const MonthlyReportComponent = ({ data }: { data: any }) => {
  if (!data) return null;
  
  return (
    <View style={styles.dailyReportContainer}>
      <Text style={styles.componentTitle}>Monthly Performance Report</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValueLarge}>{data?.totalQuestions || 0}</Text>
          <Text style={styles.statLabelSmall}>Total Questions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValueLarge}>{data?.correctAnswers || 0}</Text>
          <Text style={styles.statLabelSmall}>Correct Answers</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValueLarge}>{data?.accuracy ? Math.round(data.accuracy) : 0}%</Text>
          <Text style={styles.statLabelSmall}>Accuracy</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValueLarge}>{data?.averageTime ? Math.round(data.averageTime) : 0}s</Text>
          <Text style={styles.statLabelSmall}>Average Time</Text>
        </View>
      </View>
      <View style={styles.sessionText}>
        <Text style={styles.componentTitle}>Study Sessions</Text>
        {data?.sessions.map((session, index) => (
          <Text key={index}>{session.time} - {session.duration} minutes</Text>
        ))}
      </View>
    </View>
  );
};

const ReadinessReportComponent = ({ data, onOpenDetails, onStartPractice }: { 
  data: { 
    readinessScore: number | null; 
    isLoading: boolean; 
    hasData: boolean; 
    weakestSubjects: any[];
    weakestTopics: any[];
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

const PerformanceMetricsComponent = ({ data }: { data: PerformanceData | null }) => {
  if (!data || data.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading performance data...</Text>
      </View>
    );
  }

  if (!data.subjectMetrics?.length && !data.topicMetrics?.length) {
     return (
       <View style={styles.noDataContainer}>
         <Text style={styles.infoText}>Not enough data for this period.</Text>
       </View>
     );
  }

  const subjectChartData = {
      labels: data.subjectMetrics.map(s => s.entity_name.substring(0, 10)),
      datasets: [
        { data: data.subjectMetrics.map(s => Math.round(s.accuracy_pct ?? 0)) }
      ]
  };
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (styles.section.marginHorizontal ?? 16) * 2 - (styles.section.paddingHorizontal ?? 16) * 2;
  const chartConfig = {
      backgroundColor: "#ffffff", backgroundGradientFrom: "#ffffff", backgroundGradientTo: "#ffffff",
      decimalPlaces: 0, color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, 
      labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, 
      style: { borderRadius: 16 }, barPercentage: 0.7,
      propsForBackgroundLines: { strokeDasharray: "", stroke: "#E5E7EB", strokeWidth: 0.5 }
  };

  const sortedTopics = [...data.topicMetrics].sort((a, b) => (a.accuracy_pct ?? 0) - (b.accuracy_pct ?? 0));
  
  const renderTopicItem = ({ item }: { item: PerformanceMetricItem }) => (
      <View style={styles.topicItem}>
          <Text style={styles.topicName}>{item.entity_name}</Text>
          <View style={styles.topicStatsRow}>
              <Text style={styles.topicStat}>Acc: {Math.round(item.accuracy_pct ?? 0)}%</Text>
              <Text style={styles.topicStat}>Time: {Math.round(item.avg_time_sec ?? 0)}s</Text>
              <Text style={styles.topicStat}>Diff: {item.avg_difficulty?.toFixed(1) ?? 'N/A'}</Text>
              <Text style={styles.topicStat}>Att: {item.attempts_count ?? 0}</Text>
          </View>
      </View>
  );

  return (
    <View>
      {data.subjectMetrics && data.subjectMetrics.length > 0 && (
          <View style={styles.chartContainer}>
              <Text style={styles.componentTitle}>Subject Accuracy</Text>
              <RNBarChart
                  data={subjectChartData}
                  width={chartWidth}
                  height={220}
                  yAxisLabel="%"
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  fromZero={true}
                  showValuesOnTopOfBars={true}
                  style={{ marginVertical: 8, borderRadius: 16 }}
              />
          </View>
      )}

       {sortedTopics && sortedTopics.length > 0 && (
         <View style={styles.topicListContainer}>
           <Text style={styles.componentTitle}>Topic Performance (Weakest First)</Text>
           <FlatList
             data={sortedTopics}
             renderItem={renderTopicItem}
             keyExtractor={(item) => item.entity_id}
             nestedScrollEnabled={true}
             ListEmptyComponent={<Text style={styles.infoText}>No topic data available.</Text>}
           />
         </View>
       )}
    </View>
  );
};
