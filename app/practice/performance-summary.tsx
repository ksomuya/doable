import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
  TextStyle,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { 
  ChevronRight, 
  Clock, 
  Award, 
  Target, 
  CheckCircle, 
  XCircle, 
  Timer,
  TrendingUp,
  Calendar,
  Star,
  Zap,
  BarChart3,
} from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 180;

interface CustomStyles {
  container: ViewStyle;
  scrollContainer: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  content: ViewStyle;
  card: ViewStyle;
  cardHeader: ViewStyle;
  cardTitle: TextStyle;
  cardSubtitle: TextStyle;
  performanceContainer: ViewStyle;
  performanceGradient: ViewStyle;
  performanceContent: ViewStyle;
  performanceRow: ViewStyle;
  performanceMainStat: ViewStyle;
  performanceMainValue: TextStyle;
  performanceMainLabel: TextStyle;
  performanceStats: ViewStyle;
  statColumn: ViewStyle;
  statItem: ViewStyle;
  statIcon: ViewStyle;
  statContent: ViewStyle;
  statLabel: TextStyle;
  statValue: TextStyle;
  sessionStatsContainer: ViewStyle;
  sessionStatItem: ViewStyle;
  sessionIcon: ViewStyle;
  sessionContent: ViewStyle;
  sessionLabel: TextStyle;
  sessionValue: TextStyle;
  chartContainer: ViewStyle;
  chartHeader: ViewStyle;
  chartTitle: TextStyle;
  barContainer: ViewStyle;
  barGroup: ViewStyle;
  barBackground: ViewStyle;
  bar: ViewStyle;
  barLabel: TextStyle;
  legendContainer: ViewStyle;
  legendItem: ViewStyle;
  legendColor: ViewStyle;
  legendText: TextStyle;
  rewardsHeader: ViewStyle;
  rewardsTitle: TextStyle;
  rewardsSubtitle: TextStyle;
  rewardsGrid: ViewStyle;
  rewardItem: ViewStyle;
  rewardGradient: ViewStyle;
  rewardContent: ViewStyle;
  rewardIcon: ViewStyle;
  rewardLabel: TextStyle;
  rewardValue: TextStyle;
  continueButtonContainer: ViewStyle;
  continueButton: ViewStyle;
  continueButtonGradient: ViewStyle;
  continueButtonText: TextStyle;
}

const PerformanceSummaryScreen = () => {
  const router = useRouter();
  const { isFirstPracticeSession } = useAppContext();
  const { 
    questionsAnswered, 
    correctAnswers, 
    xpEarned, 
    goalXP,
    coinsEarned,
    hasBadge,
  } = useLocalSearchParams();
  
  // Animation values
  const accuracyAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(accuracyAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(barAnim, {
          toValue: 1,
          duration: 1000,
          delay: 300,
          useNativeDriver: false,
        })
      ])
    ]).start();
  }, []);
  
  // Calculate stats
  const totalQuestions = parseInt(questionsAnswered as string) || 0;
  const correct = parseInt(correctAnswers as string) || 0;
  const incorrect = totalQuestions - correct;
  const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  
  // Calculate grade based on accuracy
  const getGrade = (acc: number): string => {
    if (acc >= 90) return 'A';
    if (acc >= 80) return 'B';
    if (acc >= 70) return 'C';
    if (acc >= 60) return 'D';
    return 'F';
  };
  
  const getGradeColor = (acc: number): string => {
    if (acc >= 90) return '#10B981';
    if (acc >= 80) return '#3B82F6';
    if (acc >= 70) return '#F59E0B';
    if (acc >= 60) return '#F97316';
    return '#EF4444';
  };
  
  const grade = getGrade(accuracy);
  const gradeColor = getGradeColor(accuracy);
  
  // Time calculation (for demo purposes, we'll use a placeholder)
  const timeSpentMinutes = Math.floor(totalQuestions * 1.5); // Assume avg 1.5 min per question
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(timeSpentMinutes * 60 / totalQuestions) : 0;
  
  // Mock data for daily performance chart
  const mockDaysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const mockAccuracy = [65, 72, 0, 85, 90, 78, accuracy]; // Last day is today
  const mockQuestions = [5, 8, 0, 10, 12, 7, totalQuestions]; // Last day is today
  
  const handleContinue = () => {
    if (isFirstPracticeSession()) {
      // First time users go to streak setup
      router.push("/practice/streak-setup" as any);
    } else {
      // Returning users go to final choice
      router.push("/practice/final-choice" as any);
    }
  };
  
  const animatedAccuracy = accuracyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, accuracy]
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#6366F1']}
        style={styles.header}
      >
        <Animated.Text 
          style={[
            styles.headerTitle,
            { opacity: fadeAnim }
          ]}
        >
          Practice Complete!
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.headerSubtitle,
            { opacity: fadeAnim }
          ]}
        >
          Here's how you performed
        </Animated.Text>
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Performance Overview Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0]
        }) }] }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Performance Summary</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.cardSubtitle}>Today</Text>
            </View>
          </View>
          
          <LinearGradient
            colors={['#F9FAFB', '#EEF2FF']}
            style={styles.performanceGradient}
          >
            <View style={styles.performanceContent}>
              <View style={styles.performanceRow}>
                <View style={styles.performanceMainStat}>
                  <Animated.Text style={styles.performanceMainValue}>
                    {animatedAccuracy.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp'
                    })}
                  </Animated.Text>
                  <Text style={styles.performanceMainLabel}>Accuracy</Text>
                  <View style={{ 
                    backgroundColor: gradeColor,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginTop: 8
                  }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>Grade: {grade}</Text>
                  </View>
                </View>
                
                <View style={styles.performanceStats}>
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
                      <CheckCircle size={16} color="#10B981" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Correct</Text>
                      <Text style={styles.statValue}>{correct}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: '#FEF2F2' }]}>
                      <XCircle size={16} color="#EF4444" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Incorrect</Text>
                      <Text style={styles.statValue}>{incorrect}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
                      <Target size={16} color="#3B82F6" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Questions</Text>
                      <Text style={styles.statValue}>{totalQuestions}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.sessionStatsContainer}>
                <View style={styles.sessionStatItem}>
                  <View style={[styles.sessionIcon, { backgroundColor: '#F3E8FF' }]}>
                    <Clock size={16} color="#8B5CF6" />
                  </View>
                  <View style={styles.sessionContent}>
                    <Text style={styles.sessionLabel}>Study Time</Text>
                    <Text style={styles.sessionValue}>{timeSpentMinutes} minutes</Text>
                  </View>
                </View>
                
                <View style={styles.sessionStatItem}>
                  <View style={[styles.sessionIcon, { backgroundColor: '#E0F2FE' }]}>
                    <Timer size={16} color="#0EA5E9" />
                  </View>
                  <View style={styles.sessionContent}>
                    <Text style={styles.sessionLabel}>Avg. Response Time</Text>
                    <Text style={styles.sessionValue}>{avgTimePerQuestion} seconds</Text>
                  </View>
                </View>
                
                <View style={styles.sessionStatItem}>
                  <View style={[styles.sessionIcon, { backgroundColor: '#FEF9C3' }]}>
                    <TrendingUp size={16} color="#CA8A04" />
                  </View>
                  <View style={styles.sessionContent}>
                    <Text style={styles.sessionLabel}>XP Earned</Text>
                    <Text style={styles.sessionValue}>{xpEarned} XP</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* Weekly Progress Chart */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0]
        }) }] }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Progress</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BarChart3 size={14} color="#6B7280" />
              <Text style={styles.cardSubtitle}>Last 7 Days</Text>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Questions & Accuracy</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#4F46E5' }]} />
                  <Text style={styles.legendText}>Questions</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Accuracy %</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.barContainer}>
              {mockDaysOfWeek.map((day, index) => {
                const maxQuestions = Math.max(...mockQuestions);
                const questionHeight = mockQuestions[index] > 0 
                  ? (mockQuestions[index] / maxQuestions) * (CHART_HEIGHT - 40) 
                  : 0;
                  
                const accuracyHeight = mockAccuracy[index] > 0 
                  ? (mockAccuracy[index] / 100) * (CHART_HEIGHT - 40) 
                  : 0;
                
                return (
                  <View key={day} style={styles.barGroup}>
                    <View style={styles.barBackground}>
                      <Animated.View 
                        style={[
                          styles.bar, 
                          { 
                            height: barAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, questionHeight]
                            }),
                            backgroundColor: index === 6 ? '#6366F1' : '#4F46E5',
                            opacity: index === 6 ? 1 : 0.7,
                            width: 10,
                            marginRight: 4
                          }
                        ]} 
                      />
                      <Animated.View 
                        style={[
                          styles.bar, 
                          { 
                            height: barAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, accuracyHeight]
                            }),
                            backgroundColor: index === 6 ? '#34D399' : '#10B981',
                            opacity: index === 6 ? 1 : 0.7,
                            width: 10
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[
                      styles.barLabel,
                      index === 6 && { fontWeight: '700', color: '#1F2937' }
                    ]}>
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>
        
        {/* Rewards Earned */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0]
        }) }] }]}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.rewardsTitle}>Rewards Earned</Text>
            <Text style={styles.rewardsSubtitle}>Keep going to earn more!</Text>
          </View>
          
          <View style={styles.rewardsGrid}>
            <View style={styles.rewardItem}>
              <LinearGradient
                colors={['#818CF8', '#4F46E5']}
                style={styles.rewardGradient}
              >
                <View style={styles.rewardContent}>
                  <View style={[styles.rewardIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <Zap size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.rewardLabel}>XP</Text>
                  <Text style={styles.rewardValue}>{xpEarned}</Text>
                </View>
              </LinearGradient>
            </View>
            
            <View style={styles.rewardItem}>
              <LinearGradient
                colors={['#FBBF24', '#F59E0B']}
                style={styles.rewardGradient}
              >
                <View style={styles.rewardContent}>
                  <View style={[styles.rewardIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <Star size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.rewardLabel}>Coins</Text>
                  <Text style={styles.rewardValue}>{coinsEarned}</Text>
                </View>
              </LinearGradient>
            </View>
            
            <View style={styles.rewardItem}>
              <LinearGradient
                colors={hasBadge === "true" ? ['#34D399', '#10B981'] : ['#9CA3AF', '#6B7280']}
                style={styles.rewardGradient}
              >
                <View style={styles.rewardContent}>
                  <View style={[styles.rewardIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <Award size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.rewardLabel}>Badge</Text>
                  <Text style={styles.rewardValue}>
                    {hasBadge === "true" ? "Earned" : "Missed"}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ChevronRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<CustomStyles>({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 86,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  performanceGradient: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  performanceContent: {
    padding: 16,
  },
  performanceContainer: {
    padding: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  performanceMainStat: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    marginRight: 24,
  },
  performanceMainValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
  },
  performanceMainLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  performanceStats: {
    flex: 1,
    justifyContent: 'center',
  },
  statColumn: {
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sessionStatsContainer: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sessionStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionContent: {
    flex: 1,
  },
  sessionLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sessionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chartContainer: {
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  barContainer: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 24,
  },
  barGroup: {
    alignItems: 'center',
    width: (CHART_WIDTH - 32) / 7,
  },
  barBackground: {
    height: CHART_HEIGHT - 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bar: {
    width: 12,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  rewardsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  rewardsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  rewardItem: {
    width: '33.33%',
    padding: 8,
  },
  rewardGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  rewardContent: {
    padding: 16,
    alignItems: 'center',
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  continueButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default PerformanceSummaryScreen; 