import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Brain, ChevronRight, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ReadinessMeterProps {
  readinessScore: number;
  onPress?: () => void;
  isLoading?: boolean;
}

const ReadinessMeter: React.FC<ReadinessMeterProps> = ({ 
  readinessScore = 0, 
  onPress, 
  isLoading = false 
}) => {
  const router = useRouter();
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Calculate the color based on readiness score
  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green - excellent
    if (score >= 60) return '#0EA5E9'; // Blue - good
    if (score >= 40) return '#F59E0B'; // Yellow - average
    if (score >= 20) return '#F97316'; // Orange - below average
    return '#EF4444'; // Red - needs improvement
  };
  
  // Get the label based on readiness score
  const getReadinessLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    if (score >= 20) return 'Below Average';
    return 'Needs Improvement';
  };
  
  // Animate the readiness meter on mount and when score changes
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(animatedValue, {
        toValue: readinessScore / 100,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [readinessScore, isLoading]);
  
  // Convert the animated value to a rotation
  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  // Handle the press event
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  
  // Render the empty state if no data
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyGauge}>
            <View style={styles.emptyNeedle} />
          </View>
          <Text style={styles.loadingText}>Loading readiness...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Brain size={20} color="#4F46E5" />
          <Text style={styles.title}>Exam Readiness</Text>
        </View>
        <ChevronRight size={18} color="#6B7280" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.gaugeContainer}>
          {/* The gauge scale with color bands */}
          <View style={styles.gaugeScale}>
            <View style={[styles.gaugeSegment, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.gaugeSegment, { backgroundColor: '#F97316' }]} />
            <View style={[styles.gaugeSegment, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.gaugeSegment, { backgroundColor: '#0EA5E9' }]} />
            <View style={[styles.gaugeSegment, { backgroundColor: '#10B981' }]} />
          </View>
          
          {/* The needle that points to the score */}
          <Animated.View
            style={[
              styles.gaugeNeedle,
              { transform: [{ rotate: rotation }] }
            ]}
          />
          
          {/* The center pin of the gauge */}
          <View style={styles.gaugeCenter} />
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: getReadinessColor(readinessScore) }]}>
            {Math.round(readinessScore)}
          </Text>
          <Text style={styles.scoreLabel}>
            / 100
          </Text>
        </View>
        
        <Text style={[styles.readinessLabel, { color: getReadinessColor(readinessScore) }]}>
          {getReadinessLabel(readinessScore)}
        </Text>
        
        <Text style={styles.readinessDescription}>
          {readinessScore < 40 ? 
            "Focus on weak topics to improve your score" : 
            "Keep practicing to maintain your readiness"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  content: {
    alignItems: 'center',
  },
  gaugeContainer: {
    width: 200,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  gaugeScale: {
    width: 200,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
  },
  gaugeSegment: {
    flex: 1,
    height: '100%',
  },
  gaugeNeedle: {
    width: 4,
    height: 80,
    backgroundColor: '#1F2937',
    position: 'absolute',
    bottom: 0,
    borderRadius: 2,
    zIndex: 1,
    transformOrigin: 'bottom',
  },
  gaugeCenter: {
    width: 16,
    height: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    zIndex: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  score: {
    fontSize: 40,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  readinessLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  readinessDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyGauge: {
    width: 200,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    marginBottom: 20,
  },
  emptyNeedle: {
    width: 4,
    height: 80,
    backgroundColor: '#9CA3AF',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    borderRadius: 2,
    zIndex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});

export default ReadinessMeter; 