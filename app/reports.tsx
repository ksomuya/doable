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
} from "lucide-react-native";
import { useAppContext } from "./context/AppContext";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from './utils/supabase';
import { updateUserReports } from './utils/analyticsUtils';

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

interface AnalyticsState {
  dailyData: DailyAnalyticsData | null;
  weeklyData: any | null;
  monthlyData: any | null;
  isLoading: boolean;
}

export default function ReportsScreen() {
  const router = useRouter();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState("daily");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsState>({
    dailyData: null,
    weeklyData: null,
    monthlyData: null,
    isLoading: true,
  });

  const handleBackPress = () => {
    router.back();
  };

  // Trigger reports update when the screen loads
  useEffect(() => {
    if (user && user.email) {
      // Update reports in the background
      updateUserReports(user.email)
        .then(success => {
          if (success) {
            console.log('Reports updated successfully');
          }
        })
        .catch(error => {
          console.error('Error updating reports:', error);
        });
    }
  }, [user?.email]);

  // Fetch analytics data from Supabase
  useEffect(() => {
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
          
          // Calculate weekly data (using some placeholders for now)
          // Ideally this would come from rep_weekly_overview but for now we'll calculate from available data
          
          // In a production app, you would fetch weekly and monthly data similarly
          
          setAnalyticsData({
            dailyData: calculatedDailyData,
            weeklyData: null, // Placeholder - would come from real data
            monthlyData: null, // Placeholder - would come from real data
            isLoading: false,
          });
          
        } catch (error) {
          console.error("Error in analytics fetch:", error);
          setAnalyticsData(prev => ({ ...prev, isLoading: false }));
        }
      }
    };
    
    fetchAnalyticsData();
  }, [user?.email]);

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

  const renderDailyReport = () => {
    // Animation values
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
    }, []);

    // Calculate performance metrics
    const accuracy = Math.round((dailyData.correctAnswers / dailyData.totalQuestions) * 100);
    const grade = accuracy >= 90 ? 'A' : accuracy >= 80 ? 'B' : accuracy >= 70 ? 'C' : accuracy >= 60 ? 'D' : 'F';
    const gradeColor = accuracy >= 90 ? "#10B981" : accuracy >= 80 ? "#3B82F6" : accuracy >= 70 ? "#F59E0B" : accuracy >= 60 ? "#F97316" : "#EF4444";
    
    // Today's insights based on data
    const insights = [
      {
        icon: <Trophy size={18} color="#F59E0B" />,
        text: accuracy > 80 ? "Great job! Your accuracy is impressive today." : "Keep practicing to improve your accuracy.",
      },
      {
        icon: <Clock size={18} color="#8B5CF6" />,
        text: dailyData.averageTime < 40 ? "You're responding quickly to questions!" : "Try to improve your response time.",
      },
      {
        icon: <Info size={18} color="#3B82F6" />,
        text: dailyData.studyTime > 2 ? "You're putting in good study hours today." : "Try to increase your study time for better results.",
      },
    ];

    // Calculate study time distribution with learning stages instead of breaks
    const totalMinutes = dailyData.studyTime * 60;
    const sessionsTimeSum = dailyData.sessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Split the learning time into three stages
    const refineTime = Math.round(sessionsTimeSum * 0.3); // 30% for refining concepts
    const recallTime = Math.round(sessionsTimeSum * 0.4); // 40% for active recall
    const conquerTime = Math.round(sessionsTimeSum * 0.3); // 30% for mastery/conquer
    
    const timeDistribution = [
      { label: "Refine", value: refineTime, color: "#4F46E5", icon: <Brain size={14} color="#4F46E5" /> },
      { label: "Recall", value: recallTime, color: "#8B5CF6", icon: <BookOpenCheck size={14} color="#8B5CF6" /> },
      { label: "Conquer", value: conquerTime, color: "#F59E0B", icon: <Sword size={14} color="#F59E0B" /> },
    ];
    
    const maxBarWidth = Dimensions.get("window").width - 120;

    return (
      <Animated.View 
        style={[
          styles.tabContent, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Date Display with Enhanced UI */}
        <View style={styles.dateContainer}>
          <LinearGradient
            colors={['#4F46E5', '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dateBadge}
          >
            <Calendar size={16} color="#FFF" />
            <Text style={styles.dateTextEnhanced}>{dailyData.date}</Text>
          </LinearGradient>
        </View>

        {/* Performance Score Card */}
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={['#F9FAFB', '#F3F4F6']}
            style={styles.scoreCardGradient}
          >
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>Today's Performance</Text>
              <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
                <Text style={styles.gradeText}>{grade}</Text>
              </View>
            </View>
            
            <View style={styles.scoreContent}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scorePercentage}>{accuracy}%</Text>
                <Text style={styles.scoreLabel}>Accuracy</Text>
              </View>
              
              <View style={styles.scoreMetrics}>
                <View style={styles.scoreMetricItem}>
                  <View style={styles.metricIconContainer}>
                    <BookOpen size={16} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{dailyData.totalQuestions}</Text>
                    <Text style={styles.metricLabel}>Questions</Text>
                  </View>
                </View>
                
                <View style={styles.scoreMetricItem}>
                  <View style={styles.metricIconContainer}>
                    <Check size={16} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{dailyData.correctAnswers}</Text>
                    <Text style={styles.metricLabel}>Correct</Text>
                  </View>
                </View>
                
                <View style={styles.scoreMetricItem}>
                  <View style={styles.metricIconContainer}>
                    <Clock size={16} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{dailyData.averageTime}s</Text>
                    <Text style={styles.metricLabel}>Avg Time</Text>
                  </View>
                </View>
                
                <View style={styles.scoreMetricItem}>
                  <View style={styles.metricIconContainer}>
                    <Repeat size={16} color="#F97316" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{dailyData.studyTime}h</Text>
                    <Text style={styles.metricLabel}>Study Time</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Study Time Distribution */}
        <View style={styles.distributionCard}>
          <Text style={styles.distributionTitle}>Learning Journey Distribution</Text>
          {timeDistribution.map((item, index) => (
            <View key={index} style={styles.distributionItem}>
              <View style={styles.distributionLabelContainer}>
                <View style={[styles.distributionColorDot, { backgroundColor: item.color }]} />
                <View style={styles.distributionLabelIconContainer}>
                  {item.icon}
                  <Text style={styles.distributionLabel}>{item.label}</Text>
                </View>
                <Text style={styles.distributionValue}>{item.value} min</Text>
              </View>
              <View style={styles.distributionBarContainer}>
                <View
                  style={[
                    styles.distributionBar, 
                    { 
                      width: (item.value / totalMinutes) * maxBarWidth,
                      backgroundColor: item.color
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Insights Card */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Today's Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightIcon}>{insight.icon}</View>
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>

        {/* Today's Study Sessions - Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderEnhanced}>
            <Text style={styles.sectionTitleEnhanced}>Study Sessions</Text>
            <Text style={styles.sectionSubtitle}>{dailyData.sessions.length} sessions today</Text>
          </View>
          
          {dailyData.sessions.map((session, index) => (
            <View key={index} style={styles.sessionCardEnhanced}>
              <View style={styles.sessionTimeContainer}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.sessionTimeText}>{session.time}</Text>
              </View>
              
              <View style={styles.sessionDetails}>
                <View style={styles.sessionDurationBadge}>
                  <Text style={styles.sessionDurationText}>{session.duration} min</Text>
                </View>
                
                <View style={[
                  styles.sessionScoreBadge, 
                  { 
                    backgroundColor: session.score >= 90 ? "#DCFCE7" : session.score >= 70 ? "#FEF3C7" : "#FEE2E2",
                    borderColor: session.score >= 90 ? "#10B981" : session.score >= 70 ? "#F59E0B" : "#EF4444",
                  }
                ]}>
                  <Text style={[
                    styles.sessionScoreText,
                    { color: session.score >= 90 ? "#10B981" : session.score >= 70 ? "#F59E0B" : "#EF4444" }
                  ]}>{session.score}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Topics Studied Today - Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderEnhanced}>
            <Text style={styles.sectionTitleEnhanced}>Topics Covered</Text>
            <Text style={styles.sectionSubtitle}>{dailyData.topicsStudied.length} topics</Text>
          </View>
          
          <View style={styles.topicsContainerEnhanced}>
            {dailyData.topicsStudied.map((topic, index) => (
              <View key={index} style={styles.topicPillEnhanced}>
                <BookOpen size={14} color="#4F46E5" />
                <Text style={styles.topicTextEnhanced}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderWeeklyReport = () => {
    // Animation values
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
    }, []);

    // Calculate weekly performance metrics
    const weeklyAccuracy = Math.round((weeklyData.correctAnswers / weeklyData.totalQuestions) * 100);
    const weeklyGrade = weeklyAccuracy >= 90 ? 'A' : weeklyAccuracy >= 80 ? 'B' : weeklyAccuracy >= 70 ? 'C' : weeklyAccuracy >= 60 ? 'D' : 'F';
    const weeklyGradeColor = weeklyAccuracy >= 90 ? "#10B981" : weeklyAccuracy >= 80 ? "#3B82F6" : weeklyAccuracy >= 70 ? "#F59E0B" : weeklyAccuracy >= 60 ? "#F97316" : "#EF4444";
    
    // Find best and worst day
    const bestDay = [...weeklyData.dailyBreakdown].sort((a, b) => b.accuracy - a.accuracy)[0];
    const worstDay = [...weeklyData.dailyBreakdown].sort((a, b) => a.accuracy - b.accuracy)[0];
    
    // Calculate trends
    const averageQuestions = Math.round(weeklyData.totalQuestions / 7);
    const questionsToday = weeklyData.dailyBreakdown[6].questions;
    const questionsYesterday = weeklyData.dailyBreakdown[5].questions;
    const questionsTrend = questionsToday > averageQuestions ? "up" : "down";
    
    const accuracyToday = weeklyData.dailyBreakdown[6].accuracy;
    const accuracyYesterday = weeklyData.dailyBreakdown[5].accuracy;
    const accuracyTrend = accuracyToday > accuracyYesterday ? "up" : "down";
    
    // Weekly insights
    const weeklyInsights = [
      {
        icon: <Star size={18} color="#F59E0B" />,
        text: `Your best day was ${bestDay.day} with ${bestDay.accuracy}% accuracy.`,
      },
      {
        icon: <AlertTriangle size={18} color="#EF4444" />,
        text: `Your most challenging day was ${worstDay.day} with ${worstDay.accuracy}% accuracy.`,
      },
      {
        icon: <TrendingUp size={18} color={questionsTrend === "up" ? "#10B981" : "#EF4444"} />,
        text: `You attempted ${questionsToday > averageQuestions ? "more" : "fewer"} questions than your weekly average.`,
      },
    ];

    return (
      <Animated.View 
        style={[
          styles.tabContent, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Date Range Display */}
        <View style={styles.dateContainer}>
          <LinearGradient
            colors={['#4F46E5', '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dateBadge}
          >
            <Calendar size={16} color="#FFF" />
            <Text style={styles.dateTextEnhanced}>{weeklyData.dateRange}</Text>
          </LinearGradient>
        </View>

        {/* Weekly Performance Score Card */}
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={['#F9FAFB', '#F3F4F6']}
            style={styles.scoreCardGradient}
          >
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>Weekly Performance</Text>
              <View style={[styles.gradeBadge, { backgroundColor: weeklyGradeColor }]}>
                <Text style={styles.gradeText}>{weeklyGrade}</Text>
              </View>
            </View>
            
            <View style={styles.scoreContent}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scorePercentage}>{weeklyAccuracy}%</Text>
                <Text style={styles.scoreLabel}>Accuracy</Text>
              </View>
              
              <View style={styles.scoreMetrics}>
                <View style={styles.scoreMetricItem}>
                  <View style={styles.metricIconContainer}>
                    <BookOpen size={16} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{weeklyData.totalQuestions}</Text>
                    <Text style={styles.metricLabel}>Questions</Text>
                  </View>
                </View>
                
                <View style={styles.scoreMetricItem}>
                  <View style={styles.metricIconContainer}>
                    <Check size={16} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{weeklyData.correctAnswers}</Text>
                    <Text style={styles.metricLabel}>Correct</Text>
                  </View>
                </View>
                
                <View style={styles.scoreMetricItem}>
                  <View style={styles.metricIconContainer}>
                    <Clock size={16} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{weeklyData.averageTime}s</Text>
                    <Text style={styles.metricLabel}>Avg Time</Text>
                  </View>
                </View>
                
                <View style={styles.scoreMetricItem}>
                  <View style={styles.metricIconContainer}>
                    <Repeat size={16} color="#F97316" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{weeklyData.studyTime}h</Text>
                    <Text style={styles.metricLabel}>Study Time</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Weekly Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Weekly Insights</Text>
          {weeklyInsights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightIcon}>{insight.icon}</View>
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>

        {/* Enhanced Daily Breakdown */}
        <View style={styles.weeklyChartCard}>
          <Text style={styles.weeklyChartTitle}>Daily Performance</Text>
          
          <View style={styles.chartLegendEnhanced}>
            <View style={styles.legendItemEnhanced}>
              <View style={[styles.legendColorEnhanced, { backgroundColor: "#4F46E5" }]} />
              <Text style={styles.legendTextEnhanced}>Accuracy</Text>
            </View>
            <View style={styles.legendItemEnhanced}>
              <View style={[styles.legendColorEnhanced, { backgroundColor: "#F97316" }]} />
              <Text style={styles.legendTextEnhanced}>Questions</Text>
            </View>
          </View>
          
          <View style={styles.chartContainerEnhanced}>
            {weeklyData.dailyBreakdown.map((day, index) => (
              <View key={index} style={styles.chartColumnEnhanced}>
                <View style={styles.barContainerEnhanced}>
                  <View
                    style={[
                      styles.accuracyBarEnhanced, 
                      { 
                        height: day.accuracy * 1.2,
                        backgroundColor: day.accuracy > 80 ? "#4F46E5" : day.accuracy > 60 ? "#818CF8" : "#C7D2FE"
                      }
                    ]}
                  />
                  
                  <View 
                    style={[
                      styles.questionsIndicatorEnhanced,
                      { 
                        bottom: day.questions * 1.5,
                        width: day.questions / 2,
                        height: day.questions / 2,
                        maxWidth: 20,
                        maxHeight: 20,
                        minWidth: 10,
                        minHeight: 10,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.chartLabelEnhanced}>{day.day}</Text>
                <Text style={styles.chartValueEnhanced}>{day.accuracy}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weak Topics - Enhanced */}
        <View style={styles.topicsCardEnhanced}>
          <View style={styles.topicsHeaderEnhanced}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={styles.topicsTitle}>Areas for Improvement</Text>
          </View>
          
          {weeklyData.weakTopics.map((topic, index) => (
            <View key={index} style={styles.topicItemEnhanced}>
              <View style={styles.topicHeaderEnhanced}>
                <Text style={styles.topicNameEnhanced}>{topic.name}</Text>
                <View style={[styles.topicBadgeEnhanced, { backgroundColor: "#FEE2E2", borderColor: "#EF4444" }]}>
                  <Text style={[styles.topicBadgeTextEnhanced, { color: "#EF4444" }]}>{topic.accuracy}%</Text>
                </View>
              </View>
              
              <View style={styles.topicProgressContainer}>
                <View style={styles.topicProgressBackground}>
                  <LinearGradient
                    colors={['#FECACA', '#FEF2F2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.topicProgressFill, 
                      { width: `${topic.accuracy}%` }
                    ]} 
                  />
                </View>
                
                <View style={styles.topicProgressMarkersContainer}>
                  <View style={[styles.topicProgressMarker, { left: '70%' }]}>
                    <Text style={styles.topicProgressMarkerText}>70%</Text>
                  </View>
                  <View style={[styles.topicProgressMarker, { left: '85%' }]}>
                    <Text style={styles.topicProgressMarkerText}>85%</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.topicActionContainer}>
                <TouchableOpacity style={styles.topicActionButton}>
                  <Text style={styles.topicActionText}>Practice This Topic</Text>
                  <ChevronRight size={16} color="#4F46E5" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Strong Topics - Enhanced */}
        <View style={styles.topicsCardEnhanced}>
          <View style={styles.topicsHeaderEnhanced}>
            <Trophy size={20} color="#10B981" />
            <Text style={styles.topicsTitle}>Strong Areas</Text>
          </View>
          
          {weeklyData.strongTopics.map((topic, index) => (
            <View key={index} style={styles.topicItemEnhanced}>
              <View style={styles.topicHeaderEnhanced}>
                <Text style={styles.topicNameEnhanced}>{topic.name}</Text>
                <View style={[styles.topicBadgeEnhanced, { backgroundColor: "#D1FAE5", borderColor: "#10B981" }]}>
                  <Text style={[styles.topicBadgeTextEnhanced, { color: "#10B981" }]}>{topic.accuracy}%</Text>
                </View>
              </View>
              
              <View style={styles.topicProgressContainer}>
                <View style={styles.topicProgressBackground}>
                  <LinearGradient
                    colors={['#10B981', '#D1FAE5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.topicProgressFill, 
                      { width: `${topic.accuracy}%` }
                    ]} 
                  />
                </View>
                
                <View style={styles.topicProgressMarkersContainer}>
                  <View style={[styles.topicProgressMarker, { left: '70%' }]}>
                    <Text style={styles.topicProgressMarkerText}>70%</Text>
                  </View>
                  <View style={[styles.topicProgressMarker, { left: '85%' }]}>
                    <Text style={styles.topicProgressMarkerText}>85%</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.topicActionContainer}>
                <TouchableOpacity style={styles.topicActionButton}>
                  <Text style={styles.topicActionText}>Review Material</Text>
                  <ChevronRight size={16} color="#4F46E5" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderMonthlyReport = () => {
    // Animation values
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
    }, []);

    return (
      <Animated.View 
        style={[
          styles.tabContent, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Monthly Report */}
        <Text>Monthly Report Content</Text>
      </Animated.View>
    );
  };

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

      {/* Tab Navigation - Simplified */}
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
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  dateTextEnhanced: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  scoreCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  scoreCardGradient: {
    padding: 16,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  gradeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  scoreContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  scorePercentage: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4F46E5",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  scoreMetrics: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreMetricItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  insightsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  distributionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  distributionItem: {
    marginBottom: 16,
  },
  distributionLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  distributionLabelIconContainer: {
    flexDirection: "row", 
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  distributionColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  distributionLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
  },
  distributionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  distributionBarContainer: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  distributionBar: {
    height: "100%",
    borderRadius: 4,
  },
  sectionHeaderEnhanced: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitleEnhanced: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  sessionCardEnhanced: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionTimeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  sessionDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionDurationBadge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  sessionDurationText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500",
  },
  sessionScoreBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  sessionScoreText: {
    fontSize: 12,
    fontWeight: "600",
  },
  topicsContainerEnhanced: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topicPillEnhanced: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  topicTextEnhanced: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
  },
  weeklyChartCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  weeklyChartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  chartLegendEnhanced: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  legendItemEnhanced: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendColorEnhanced: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendTextEnhanced: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
  },
  chartContainerEnhanced: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    marginTop: 16,
  },
  chartColumnEnhanced: {
    alignItems: "center",
    width: "13%",
  },
  barContainerEnhanced: {
    height: 150,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
    position: "relative",
  },
  accuracyBarEnhanced: {
    width: "60%",
    borderRadius: 8,
  },
  questionsIndicatorEnhanced: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F97316",
    left: "50%",
    transform: [{ translateX: -8 }],
  },
  chartLabelEnhanced: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 2,
  },
  chartValueEnhanced: {
    fontSize: 10,
    color: "#6B7280",
  },
  topicsCardEnhanced: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  topicsHeaderEnhanced: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  topicItemEnhanced: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
  },
  topicHeaderEnhanced: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  topicNameEnhanced: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  topicBadgeEnhanced: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicBadgeTextEnhanced: {
    fontSize: 12,
    fontWeight: "600",
  },
  topicProgressContainer: {
    marginBottom: 12,
  },
  topicProgressBackground: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  topicProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  topicProgressMarkersContainer: {
    position: "relative",
    height: 20,
  },
  topicProgressMarker: {
    position: "absolute",
    top: 0,
    alignItems: "center",
  },
  topicProgressMarkerText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  topicActionContainer: {
    alignItems: "flex-end",
  },
  topicActionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicActionText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500",
    marginRight: 4,
  },
  monthlyProgressCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  monthlyProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  monthlyProgressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  monthlyProgressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  monthlyProgressSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  monthlyProgressValue: {
    marginBottom: 16,
  },
  monthlyProgressPercentage: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  monthlyProgressDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  progressImage: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    marginTop: 16,
  },
  monthlyBreakdownCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  monthlyBreakdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  weekItemEnhanced: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
  },
  weekHeaderEnhanced: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weekLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  weekNameEnhanced: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  weekStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  weekQuestionsEnhanced: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 4,
  },
  weekStatsEnhanced: {
    fontSize: 12,
    color: "#6B7280",
  },
  weekProgressContainer: {
    marginBottom: 4,
  },
  weekProgressBackground: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  weekProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  weekProgressLabelsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  weekProgressAccuracy: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 4,
  },
  weekProgressLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  monthlyTopicsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  monthlyTopicsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  monthlyTopicsColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthlyTopicsColumn: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    overflow: "hidden",
  },
  monthlyTopicColumnHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
  },
  monthlyTopicColumnTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  monthlyTopicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  monthlyTopicName: {
    fontSize: 12,
    color: "#4B5563",
    flex: 1,
    marginRight: 8,
  },
  monthlyTopicAccuracy: {
    fontSize: 12,
    fontWeight: "600",
  },
  recommendationCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  recommendationGradient: {
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationHighlight: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  recommendationButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  recommendationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginRight: 8,
  },
});
