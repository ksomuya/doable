import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";

const RewardsChestScreen = () => {
  const router = useRouter();
  const { questionsAnswered, correctAnswers, xpEarned, goalXP } = useLocalSearchParams();
  const { user } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
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
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back()),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      })
    ]).start(() => {
      // Show rewards after chest opens
      setTimeout(() => {
        setShowRewards(true);
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      }, 400);
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
    outputRange: ["0deg", "-20deg"]
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>You've Earned a Reward!</Text>
        <Text style={styles.subtitle}>Tap the chest to collect your rewards</Text>
        
        <TouchableOpacity 
          style={styles.chestContainer} 
          onPress={handleOpenChest}
          disabled={isOpen}
        >
          <Animated.View 
            style={[
              styles.chestImageContainer,
              {
                transform: [
                  { scale: scaleAnim },
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
          
          {!isOpen && (
            <View style={styles.tapPrompt}>
              <Text style={styles.tapPromptText}>Tap to Open</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {showRewards && (
          <Animated.View style={[styles.rewardsContainer, { opacity: opacityAnim }]}>
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: "#EEF2FF" }]}>
                <Text style={styles.rewardIconText}>🏆</Text>
              </View>
              <Text style={styles.rewardValue}>{xpEarned} XP</Text>
            </View>
            
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: "#FEF3C7" }]}>
                <Text style={styles.rewardIconText}>💰</Text>
              </View>
              <Text style={styles.rewardValue}>{coinsEarned} Coins</Text>
            </View>
            
            {hasBadge && (
              <View style={styles.rewardItem}>
                <View style={[styles.rewardIcon, { backgroundColor: "#ECFDF5" }]}>
                  <Text style={styles.rewardIconText}>🏅</Text>
                </View>
                <Text style={styles.rewardValue}>Excellence Badge</Text>
              </View>
            )}
          </Animated.View>
        )}
      </View>
      
      {showRewards && (
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
  },
  chestContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  chestImageContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  chestImage: {
    width: "100%",
    height: "100%",
  },
  tapPrompt: {
    position: "absolute",
    bottom: -20,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tapPromptText: {
    color: "white",
    fontWeight: "600",
  },
  rewardsContainer: {
    alignItems: "center",
    width: "100%",
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rewardIconText: {
    fontSize: 24,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default RewardsChestScreen; 