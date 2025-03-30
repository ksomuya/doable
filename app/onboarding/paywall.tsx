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
import { spacing, typography, colors, buttonStyles, layoutStyles, getShadow } from "../styles/designSystem";

interface PaywallProps {
  onComplete?: () => void;
}

interface CustomStyles {
  container: ViewStyle;
  header: ViewStyle;
  closeButton: ViewStyle;
  title: TextStyle;
  content: ViewStyle;
  timelineContainer: ViewStyle;
  timelineItem: ViewStyle;
  timelineItemActive: ViewStyle;
  timelineConnector: ViewStyle;
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
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, styles.timelineDotCompleted]}>
            <Check size={18} color="white" strokeWidth={3} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Install the app</Text>
            <Text style={styles.timelineSubtitle}>You successfully joined Doable</Text>
          </View>
        </View>
        
        <View style={styles.timelineConnector} />
        
        {/* Step 2: Today - Get instant access */}
        <View style={[styles.timelineItem, styles.timelineItemActive]}>
          <View style={[styles.timelineDot, styles.timelineDotActive]}>
            <Text style={{ fontSize: 15, color: "#FF9500" }}>🔓</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Today: Get Instant Access</Text>
            <Text style={styles.timelineSubtitle}>Complete access to All the features</Text>
          </View>
        </View>
        
        <View style={styles.timelineConnector} />
        
        {/* Step 3: Day 12 - Reminder */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot}>
            <Text style={{ fontSize: 14, color: "#888" }}>🔔</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Day 12</Text>
            <Text style={styles.timelineSubtitle}>Get a reminder about when your trial will end</Text>
          </View>
        </View>
        
        <View style={styles.timelineConnector} />
        
        {/* Step 4: Day 14 - Charge */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot}>
            <Text style={{ fontSize: 14, color: "#888" }}>💳</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Day 14</Text>
            <Text style={styles.timelineSubtitle}>You'll be charged today, cancel anytime before</Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderPlanSelection = () => {
    return (
      <View>
        <Text style={styles.planSelectionTitle}>Choose Your Plan</Text>
        
        <View style={styles.plansContainer}>
          {/* Yearly Plan */}
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
          
          {/* Quarterly Plan */}
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
          
          {/* Monthly Plan */}
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
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How your free trial works</Text>
        
        {currentStep === 1 ? renderTimeline() : renderPlanSelection()}
      </ScrollView>
      
      {/* Footer */}
      <View style={{ padding: 16 }}>
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
      </View>
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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    marginVertical: 28,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timelineContainer: {
    marginTop: 16,
    paddingLeft: 8,
    paddingRight: 8,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 1,
    marginBottom: 32,
  },
  timelineItemActive: {
    zIndex: 2,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  timelineDotActive: {
    backgroundColor: "#FFEFD6",
    borderWidth: 1,
    borderColor: "#FF9500",
  },
  timelineDotCompleted: {
    backgroundColor: "#FF9500",
  },
  timelineContent: {
    flex: 1,
    paddingTop: 6,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: "#888888",
  },
  timelineConnector: {
    position: "absolute",
    left: 17,
    width: 2,
    height: 36,
    backgroundColor: "#E5E5E5",
    zIndex: 0,
    marginTop: 36,
  },
  planSelectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 24,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  planCardSelected: {
    borderColor: "#FF9500",
    borderWidth: 2,
  },
  recommendedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    backgroundColor: "#FF9500",
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  planType: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginTop: 24,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000000",
    marginVertical: 8,
  },
  planPriceSmall: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: "#888888",
  },
  actionButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  restoreText: {
    color: "#888888",
    fontSize: 14,
  },
});

export default PaywallScreen; 