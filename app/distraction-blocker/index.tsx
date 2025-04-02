import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Focus, Clock, BrainCircuit, Shield } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get('window');

export default function DistractionBlockerScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  const featureAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    // Main animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Staggered features animation
    Animated.stagger(200, 
      featureAnimations.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleGetStarted = () => {
    router.push("/distraction-blocker/setup");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Focus Mode</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <Animated.View 
          style={[
            styles.illustrationContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: translateY }] 
            }
          ]}
        >
          <LinearGradient
            colors={['#6C5CE7', '#4834d4']}
            style={styles.illustrationBackground}
          >
            <Focus size={100} color="white" style={styles.illustration} />
          </LinearGradient>
        </Animated.View>

        {/* Title and Description */}
        <Animated.Text 
          style={[
            styles.title,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: translateY }] 
            }
          ]}
        >
          Focus Better, Learn Faster
        </Animated.Text>
        
        <Animated.Text 
          style={[
            styles.description,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: translateY }] 
            }
          ]}
        >
          Stay on track with your studies by reducing digital distractions. 
          This feature helps you be more mindful of your app usage and build 
          better study habits.
        </Animated.Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {[
            {
              icon: <Shield size={24} color="white" />,
              title: "Block Distracting Apps",
              description: "Choose which social media and entertainment apps you want to limit during study time",
              gradient: ['#FF9F43', '#F2994A'] as const
            },
            {
              icon: <Clock size={24} color="white" />,
              title: "Mindful Breathing",
              description: "Brief breathing exercises when you try to access blocked apps to help you refocus",
              gradient: ['#4834d4', '#6C5CE7'] as const
            },
            {
              icon: <BrainCircuit size={24} color="white" />,
              title: "Build Better Habits",
              description: "Track progress and redirect your attention to productive study activities",
              gradient: ['#20BF6B', '#0ABF30'] as const
            }
          ].map((feature, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.featureItem,
                {
                  opacity: featureAnimations[index],
                  transform: [{ 
                    translateX: featureAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    }) 
                  }]
                }
              ]}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureIconContainer}
              >
                {feature.icon}
              </LinearGradient>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Note */}
        <Animated.View 
          style={[
            styles.noteContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <Text style={styles.noteText}>
            This feature requires special permissions to monitor app usage and display overlay screens.
            We'll guide you through the setup process.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6C5CE7', '#4834d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <ArrowRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    borderBottomColor: "#f5f5f5",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
  },
  illustrationBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  illustration: {
    opacity: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 16,
    color: "#666",
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  noteContainer: {
    backgroundColor: "#F8F9FD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#6C5CE7",
  },
  noteText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  getStartedButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
}); 