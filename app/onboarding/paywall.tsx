import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import Animated, { FadeIn, FadeInRight, SlideInUp, SlideInRight, useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { spacing, typography, colors, buttonStyles, layoutStyles, getShadow } from "../styles/designSystem";

interface PaywallProps {
  onComplete?: () => void;
}

interface CustomStyles {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  content: ViewStyle;
  timelineContainer: ViewStyle;
  timelineItem: ViewStyle;
  timelineItemActive: ViewStyle;
  timelineConnector: ViewStyle;
  timelineDotContainer: ViewStyle;
  timelineDot: ViewStyle;
  timelineDotActive: ViewStyle;
  timelineDotCompleted: ViewStyle;
  timelineContent: ViewStyle;
  timelineTitle: TextStyle;
  timelineSubtitle: TextStyle;
  planSelectionTitle: TextStyle;
  plansContainer: ViewStyle;
  planCard: ViewStyle;
  planCardSelected: ViewStyle;
  recommendedBadge: ViewStyle;
  recommendedText: TextStyle;
  planType: TextStyle;
  planPrice: TextStyle;
  planPriceSmall: TextStyle;
  planDescription: TextStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  restoreButton: ViewStyle;
  restoreText: TextStyle;
}

const PaywallScreen = ({ onComplete = () => {} }: PaywallProps) => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'quarterly' | 'monthly'>('yearly');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Animation shared values
  const progressValue = useSharedValue(0);
  
  const handleClose = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.back();
    }
  };
  
  const handleStartTrial = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push("/home" as any);
    }
  };
  
  const handleRestorePurchase = () => {
    console.log("Restore purchase");
  };
  
  const renderTimeline = () => {
    return (
      <View style={styles.timelineContainer}>
        {/* Step 1: Install the app */}
        <Animated.View entering={FadeInRight.delay(100).duration(500)} style={styles.timelineItem}>
          <View style={styles.timelineDotContainer}>
            <View style={[styles.timelineDot, styles.timelineDotCompleted]}>
              <Check size={20} color="white" strokeWidth={3} />
            </View>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Install the app</Text>
            <Text style={styles.timelineSubtitle}>You successfully joined Doable</Text>
          </View>
        </Animated.View>
        
        <View style={styles.timelineConnector} />
        
        {/* Step 2: Today - Get instant access */}
        <Animated.View entering={FadeInRight.delay(300).duration(500)} style={[styles.timelineItem, styles.timelineItemActive]}>
          <View style={styles.timelineDotContainer}>
            <View style={[styles.timelineDot, styles.timelineDotActive]}>
              <Text style={{ fontSize: 18, color: "#FF9500" }}>🔓</Text>
            </View>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Today: Get Instant Access</Text>
            <Text style={styles.timelineSubtitle}>Complete access to All the features</Text>
          </View>
        </Animated.View>
        
        <View style={styles.timelineConnector} />
        
        {/* Step 3: Day 12 - Reminder */}
        <Animated.View entering={FadeInRight.delay(500).duration(500)} style={styles.timelineItem}>
          <View style={styles.timelineDotContainer}>
            <View style={styles.timelineDot}>
              <Text style={{ fontSize: 16, color: "#888" }}>🔔</Text>
            </View>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Day 12</Text>
            <Text style={styles.timelineSubtitle}>Get a reminder about when your trial will end</Text>
          </View>
        </Animated.View>
        
        <View style={styles.timelineConnector} />
        
        {/* Step 4: Day 14 - Charge */}
        <Animated.View entering={FadeInRight.delay(700).duration(500)} style={styles.timelineItem}>
          <View style={styles.timelineDotContainer}>
            <View style={styles.timelineDot}>
              <Text style={{ fontSize: 16, color: "#888" }}>💳</Text>
            </View>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Day 14</Text>
            <Text style={styles.timelineSubtitle}>You'll be charged today, cancel anytime before</Text>
          </View>
        </Animated.View>
      </View>
    );
  };
  
  const renderPlanSelection = () => {
    return (
      <Animated.View entering={FadeIn.duration(500)}>
        <Text style={styles.planSelectionTitle}>Choose Your Plan</Text>
        
        <View style={styles.plansContainer}>
          {/* Yearly Plan */}
          <Animated.View entering={SlideInUp.delay(100).duration(500)}>
            <TouchableOpacity 
              style={[
                styles.planCard, 
                selectedPlan === 'yearly' && styles.planCardSelected
              ]} 
              onPress={() => setSelectedPlan('yearly')}
            >
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended - Save 50%</Text>
              </View>
              
              <Text style={styles.planType}>Yearly</Text>
              <Text style={styles.planPrice}>₹ 3000</Text>
              <Text style={styles.planPriceSmall}>per month ₹ 250</Text>
              <Text style={styles.planDescription}>Includes 14 day free trial</Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Quarterly Plan */}
          <Animated.View entering={SlideInUp.delay(200).duration(500)}>
            <TouchableOpacity 
              style={[
                styles.planCard, 
                selectedPlan === 'quarterly' && styles.planCardSelected
              ]} 
              onPress={() => setSelectedPlan('quarterly')}
            >
              <Text style={styles.planType}>Quarterly</Text>
              <Text style={styles.planPrice}>₹ 1200</Text>
              <Text style={styles.planPriceSmall}>per month ₹ 400</Text>
              <Text style={styles.planDescription}>Includes 14 day free trial</Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Monthly Plan */}
          <Animated.View entering={SlideInUp.delay(300).duration(500)}>
            <TouchableOpacity 
              style={[
                styles.planCard, 
                selectedPlan === 'monthly' && styles.planCardSelected
              ]} 
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text style={styles.planType}>Monthly</Text>
              <Text style={styles.planPrice}>₹ 500</Text>
              <Text style={styles.planDescription}>Includes 14 day free trial</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Removed header with close button */}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.Text 
          entering={FadeIn.duration(800)} 
          style={styles.title}
        >
          How your free trial works
        </Animated.Text>
        
        {currentStep === 1 ? renderTimeline() : renderPlanSelection()}
      </ScrollView>
      
      {/* Footer */}
      <Animated.View 
        entering={SlideInUp.delay(800).duration(500)}
        style={{ padding: 20 }}
      >
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={currentStep === 1 ? () => setCurrentStep(2) : handleStartTrial}
        >
          <Text style={styles.actionButtonText}>
            {currentStep === 1 ? "Continue" : "Start my free trial now"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchase}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<CustomStyles>({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    padding: 16,
  },
  title: {
    fontSize: 38, // Enlarged from 32
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    marginVertical: 32, // Increased from 28
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, // Increased from 16
  },
  timelineContainer: {
    marginTop: 20,
    paddingLeft: 12,
    paddingRight: 16,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 1,
    marginBottom: 40, // Increased spacing
  },
  timelineItemActive: {
    zIndex: 2,
  },
  timelineDotContainer: {
    width: 60, // Wider to improve alignment
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDot: {
    width: 44, // Increased from 36
    height: 44, // Increased from 36
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotActive: {
    backgroundColor: "#FFEFD6",
    borderWidth: 1.5, // Thicker border
    borderColor: "#FF9500",
  },
  timelineDotCompleted: {
    backgroundColor: "#FF9500",
  },
  timelineContent: {
    flex: 1,
    paddingTop: 8,
    paddingLeft: 12, // Added to improve spacing
  },
  timelineTitle: {
    fontSize: 18, // Increased from 16
    fontWeight: "600",
    color: "#000000",
    marginBottom: 6, // Increased from 4
  },
  timelineSubtitle: {
    fontSize: 16, // Increased from 14
    color: "#666666", // Darkened from #888888
    lineHeight: 22, // Added for better readability
  },
  timelineConnector: {
    position: "absolute",
    left: 36, // Adjusted for center alignment
    width: 2.5, // Thicker line
    height: 40, // Extended to match new spacing
    backgroundColor: "#E5E5E5",
    zIndex: 0,
    marginTop: 44, // Adjusted based on new dot size
  },
  planSelectionTitle: {
    fontSize: 28, // Increased from 24
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 28, // Increased from 24
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16, // Increased from 12
    padding: 28, // Increased from 24
    marginBottom: 20, // Increased from 16
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  planCardSelected: {
    borderColor: "#FF9500",
    borderWidth: 2.5, // Thicker border
  },
  recommendedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    backgroundColor: "#FF9500",
    paddingVertical: 8, // Increased from 6
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedText: {
    color: "#FFFFFF",
    fontSize: 16, // Increased from 14
    fontWeight: "600",
  },
  planType: {
    fontSize: 28, // Increased from 24
    fontWeight: "700",
    color: "#000000",
    marginTop: 28, // Increased from 24
  },
  planPrice: {
    fontSize: 42, // Increased from 36
    fontWeight: "700",
    color: "#000000",
    marginVertical: 10, // Increased from 8
  },
  planPriceSmall: {
    fontSize: 16, // Increased from 14
    color: "#666666", // Darkened from #888888
    marginBottom: 10, // Increased from 8
  },
  planDescription: {
    fontSize: 18, // Increased from 16
    color: "#666666", // Darkened from #888888
  },
  actionButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 18, // Increased from 16
    borderRadius: 16, // Increased from 12
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: "white",
    fontSize: 18, // Increased from 16
    fontWeight: "700",
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  restoreText: {
    color: "#666666", // Darkened from #888888
    fontSize: 16, // Increased from 14
  },
});

export default PaywallScreen; 