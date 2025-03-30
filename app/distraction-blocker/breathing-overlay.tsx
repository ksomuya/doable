import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import { colors, typography, spacing, buttonStyles } from "../styles/designSystem";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BreathingOverlayProps {
  appName: string;
  appId: string;
  onClose: () => void;
}

const { height, width } = Dimensions.get('window');

export default function BreathingOverlay({ appName, appId, onClose }: BreathingOverlayProps) {
  const [step, setStep] = useState<'inhale' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(3);
  const [openCount, setOpenCount] = useState(1);
  const fillAnimation = useRef(new Animated.Value(0)).current;
  
  // Load and increment app open count
  useEffect(() => {
    const updateOpenCount = async () => {
      try {
        const countData = await AsyncStorage.getItem('appOpenCounts');
        const counts = countData ? JSON.parse(countData) : {};
        
        const currentCount = counts[appId] || 0;
        const newCount = currentCount + 1;
        
        counts[appId] = newCount;
        await AsyncStorage.setItem('appOpenCounts', JSON.stringify(counts));
        
        setOpenCount(newCount);
      } catch (error) {
        console.error('Error updating app open count:', error);
      }
    };
    
    updateOpenCount();
  }, [appId]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [onClose]);

  // Animation effect for breathing
  useEffect(() => {
    const animate = () => {
      Animated.timing(fillAnimation, {
        toValue: step === 'inhale' ? 1 : 0,
        duration: 4000,
        useNativeDriver: false,
      }).start(() => {
        setStep(step === 'inhale' ? 'exhale' : 'inhale');
      });
    };

    animate();
  }, [step, fillAnimation]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Calculating the fill height based on animation value
  const fillHeight = fillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.7],
  });

  return (
    <View style={styles.container}>
      {/* App Usage Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.appName}>{appName}</Text>
        <Text style={styles.usageMessage}>
          You've opened {appName} {openCount} {openCount === 1 ? 'time' : 'times'} today.
        </Text>
        <Text style={styles.suggestionMessage}>
          Consider practicing instead of checking social media.
        </Text>
      </View>

      {/* Breathing Animation Container */}
      <View style={styles.breathingContainer}>
        <Text style={styles.breathingInstruction}>
          {step === 'inhale' ? 'Inhale...' : 'Exhale...'}
        </Text>
        
        <View style={styles.animationContainer}>
          <Animated.View 
            style={[
              styles.fillAnimation,
              { height: fillHeight },
            ]}
          />
        </View>
        
        <Text style={styles.breathingBenefit}>
          Taking a moment to breathe can help you refocus
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        {countdown > 0 ? (
          <TouchableOpacity style={styles.continueButtonDisabled} disabled>
            <Text style={styles.continueButtonText}>
              Continue to {appName} in {countdown}...
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.continueButton} onPress={onClose}>
            <Text style={styles.continueButtonText}>Continue to {appName}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.studyButton} onPress={() => onClose()}>
          <Text style={styles.studyButtonText}>Return to Studying</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 50,
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  appName: {
    ...typography.largeTitle,
    color: 'white',
    marginBottom: spacing.md,
  },
  usageMessage: {
    ...typography.body,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  suggestionMessage: {
    ...typography.subtitle,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  breathingInstruction: {
    ...typography.title,
    color: 'white',
    marginBottom: spacing.lg,
  },
  animationContainer: {
    width: width * 0.7,
    height: height * 0.7,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  fillAnimation: {
    width: '100%',
    backgroundColor: `${colors.primary}50`, // 50% opacity
    position: 'absolute',
    bottom: 0,
    borderRadius: 18,
  },
  breathingBenefit: {
    ...typography.caption,
    color: 'white',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  continueButtonText: {
    ...typography.button,
    color: 'white',
  },
  studyButton: {
    ...buttonStyles.primary,
    alignItems: 'center',
  },
  studyButtonText: {
    ...typography.button,
  },
}); 