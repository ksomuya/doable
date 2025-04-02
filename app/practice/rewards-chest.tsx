import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ChevronRight, Star, Zap, Award, Trophy } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');
const CHEST_SIZE = width * 0.6;

const RewardsChestScreen = () => {
  const router = useRouter();
  const { questionsAnswered, correctAnswers, xpEarned, goalXP } = useLocalSearchParams();
  const { user } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Particles animation
  const particlesAnim = Array.from({ length: 20 }).map(() => ({
    position: useRef(new Animated.ValueXY({ x: 0, y: 0 })).current,
    opacity: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0.5)).current,
    color: ['#FFD700', '#FFA500', '#4F46E5', '#EC4899'][Math.floor(Math.random() * 4)]
  }));
  
  // Start glow animation on mount
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
    
    // Start subtle bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, []);
  
  // Calculate rewards
  const xpPoints = parseInt(xpEarned as string) || 0;
  const coinsEarned = Math.round(xpPoints * 0.5); // 50% of XP as coins
  const accuracy = parseInt(correctAnswers as string) / parseInt(questionsAnswered as string) * 100;
  const hasBadge = accuracy >= 80; // Award badge if accuracy is 80% or higher
  
  const handleOpenChest = () => {
    if (isOpen) return;
    
    // Play animation sequence
    setIsOpen(true);
    
    // Scale up animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.elastic(1.2),
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.elastic(1.2),
      })
    ]).start(() => {
      // Show explosion effect
      setShowConfetti(true);
      
      // Animate particles
      particlesAnim.forEach((particle, i) => {
        const angle = (i / particlesAnim.length) * Math.PI * 2;
        const distance = 100 + Math.random() * 150;
        
        Animated.parallel([
          Animated.timing(particle.position, {
            toValue: {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 100,
            },
            duration: 1000 + Math.random() * 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 800,
              delay: 200 + Math.random() * 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(particle.scale, {
            toValue: 0.2 + Math.random() * 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      // Show rewards after chest opens
      setTimeout(() => {
        setShowRewards(true);
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      }, 600);
    });
  };
  
  const handleContinue = () => {
    router.push({
      pathname: "/practice/performance-summary" as any,
      params: {
        questionsAnswered,
        correctAnswers,
        xpEarned,
        goalXP,
        coinsEarned: coinsEarned.toString(),
        hasBadge: hasBadge.toString()
      }
    });
  };
  
  // Interpolate rotation value
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-10deg"]
  });
  
  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8]
  });
  
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#4338CA']}
        style={styles.background}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Rewards Unlocked!</Text>
          <Text style={styles.subtitle}>Tap the chest to discover your rewards</Text>
          
          <View style={styles.chestContainer}>
            {/* Glow effect */}
            <Animated.View style={[
              styles.glowEffect,
              {
                shadowOpacity: shadowOpacity,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0.9]
                })
              }
            ]} />
            
            {/* Chest */}
            <TouchableOpacity 
              style={styles.chestTouchable} 
              onPress={handleOpenChest}
              disabled={isOpen}
            >
              <Animated.View 
                style={[
                  styles.chestImageContainer,
                  {
                    transform: [
                      { scale: scaleAnim },
                      { translateY: bounceTransform },
                      { rotateZ: rotation }
                    ]
                  }
                ]}
              >
                <Image
                  source={{
                    uri: isOpen 
                      ? "https://cdn-icons-png.flaticon.com/512/6217/6217809.png" 
                      : "https://cdn-icons-png.flaticon.com/512/6217/6217738.png"
                  }}
                  style={styles.chestImage}
                  contentFit="contain"
                />
              </Animated.View>
            </TouchableOpacity>
            
            {/* Particles */}
            {showConfetti && particlesAnim.map((particle, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    backgroundColor: particle.color,
                    opacity: particle.opacity,
                    transform: [
                      ...particle.position.getTranslateTransform(),
                      { scale: particle.scale }
                    ]
                  }
                ]}
              />
            ))}
          </View>
          
          {!isOpen && (
            <View style={styles.tapPrompt}>
              <Text style={styles.tapPromptText}>Tap to Open</Text>
            </View>
          )}
          
          {showRewards && (
            <Animated.View style={[styles.rewardsContainer, { opacity: opacityAnim }]}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.rewardItem, styles.xpReward]}
              >
                <View style={[styles.rewardIcon, { backgroundColor: "#FFF5E5" }]}>
                  <Zap size={24} color="#FFB700" />
                </View>
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardLabel}>Experience Points</Text>
                  <Text style={styles.rewardValue}>{xpEarned} XP</Text>
                </View>
              </LinearGradient>
              
              <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.rewardItem, styles.coinsReward]}
              >
                <View style={[styles.rewardIcon, { backgroundColor: "#EEF2FF" }]}>
                  <Star size={24} color="#4F46E5" />
                </View>
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardLabel}>Coins Earned</Text>
                  <Text style={styles.rewardValue}>{coinsEarned} Coins</Text>
                </View>
              </LinearGradient>
              
              {hasBadge && (
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.rewardItem, styles.badgeReward]}
                >
                  <View style={[styles.rewardIcon, { backgroundColor: "#ECFDF5" }]}>
                    <Trophy size={24} color="#10B981" />
                  </View>
                  <View style={styles.rewardContent}>
                    <Text style={styles.rewardLabel}>Achievement Earned</Text>
                    <Text style={styles.rewardValue}>Excellence Badge</Text>
                  </View>
                </LinearGradient>
              )}
            </Animated.View>
          )}
        </View>
        
        {showRewards && (
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <ChevronRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 48,
  },
  chestContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: CHEST_SIZE,
    width: CHEST_SIZE,
    marginBottom: 64,
  },
  chestTouchable: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  glowEffect: {
    position: 'absolute',
    width: CHEST_SIZE,
    height: CHEST_SIZE,
    borderRadius: CHEST_SIZE / 2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
  },
  chestImageContainer: {
    width: CHEST_SIZE,
    height: CHEST_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  chestImage: {
    width: "100%",
    height: "100%",
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  tapPrompt: {
    position: "absolute",
    bottom: CHEST_SIZE * 0.4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginTop: 20,
  },
  tapPromptText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  rewardsContainer: {
    alignItems: "center",
    width: "100%",
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  xpReward: {
    marginBottom: 16,
  },
  coinsReward: {
    marginBottom: 16,
  },
  badgeReward: {
    marginBottom: 16,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rewardContent: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  continueButton: {
    margin: 24,
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default RewardsChestScreen; 