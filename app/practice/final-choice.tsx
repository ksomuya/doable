import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Home, BookOpen, ChevronRight, CheckCircle, Star } from "lucide-react-native";
import { Image } from "expo-image";
import { useAppContext } from "../context/AppContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 110;

interface CustomStyles {
  container: ViewStyle;
  header: ViewStyle;
  content: ViewStyle;
  image: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle; 
  optionsContainer: ViewStyle;
  optionCard: ViewStyle;
  optionGradient: ViewStyle;
  optionContent: ViewStyle;
  optionIconContainer: ViewStyle;
  optionDetails: ViewStyle;
  optionTitle: TextStyle;
  optionDescription: TextStyle;
  statsContainer: ViewStyle;
  statsTitle: TextStyle;
  statsRow: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  buttonContainer: ViewStyle;
  footer: ViewStyle;
  footerText: TextStyle;
}

const FinalChoiceScreen = () => {
  const router = useRouter();
  const { user } = useAppContext();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    // Animate elements in
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handleGoHome = () => {
    router.push("/");
  };
  
  const handleStartNewSession = () => {
    router.push("/practice/goal");
  };
  
  // Mock stats to display
  const sessionStats = {
    streak: 3,
    xpToday: 150,
    questionsAnswered: 25,
    accuracy: 84,
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#6366F1']}
        style={styles.header}
      />
      
      <View style={styles.content}>
        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ] 
        }}>
          <Image
            source={{
              uri: "https://cdn.jsdelivr.net/gh/duolingo/images@master/owl-trophy.png",
            }}
            style={styles.image}
            contentFit="contain"
          />
          
          <Text style={styles.title}>Practice Complete!</Text>
          <Text style={styles.subtitle}>
            Great work today! You're making excellent progress.
          </Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Today's Progress</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sessionStats.xpToday}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sessionStats.questionsAnswered}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sessionStats.accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sessionStats.streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View style={[
          styles.optionsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={handleStartNewSession}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.optionGradient}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIconContainer}>
                  <BookOpen size={24} color="#FFFFFF" />
                </View>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionTitle}>Continue Learning</Text>
                  <Text style={styles.optionDescription}>
                    Start a new practice session
                  </Text>
                </View>
                <ChevronRight size={20} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <View style={[styles.optionContent, { backgroundColor: '#FFFFFF' }]}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#F3F4F6' }]}>
                <Home size={24} color="#4F46E5" />
              </View>
              <View style={styles.optionDetails}>
                <Text style={[styles.optionTitle, { color: '#1F2937' }]}>Back to Home</Text>
                <Text style={[styles.optionDescription, { color: '#6B7280' }]}>
                  Return to the dashboard
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <View style={styles.footer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.footerText}>
            <Star size={16} color="#F59E0B" style={{ marginRight: 4 }} /> Keep practicing to maintain your streak!
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<CustomStyles>({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    height: 200,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  optionsContainer: {
    marginTop: 24,
  },
  optionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionGradient: {
    borderRadius: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    height: CARD_HEIGHT,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContainer: {
    marginTop: 24,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default FinalChoiceScreen; 