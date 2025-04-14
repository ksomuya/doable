import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Brain, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ReadinessEmptyStateProps {
  onStartPractice: () => void;
}

const ReadinessEmptyState: React.FC<ReadinessEmptyStateProps> = ({ onStartPractice }) => {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Brain size={20} color="#4F46E5" />
          <Text style={styles.title}>Exam Readiness</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../../assets/images/empty-chart.png')} 
            style={styles.illustration}
            defaultSource={require('../../assets/images/empty-chart.png')}
          />
        </View>
        
        <Text style={styles.emptyTitle}>No Readiness Data Yet</Text>
        
        <Text style={styles.emptyDescription}>
          Complete some practice sessions to see your exam readiness score and track your progress over time.
        </Text>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={onStartPractice}
        >
          <Text style={styles.startButtonText}>Start Practice</Text>
          <ArrowRight size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
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
    padding: 16,
  },
  illustrationContainer: {
    marginBottom: 20,
  },
  illustration: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});

export default ReadinessEmptyState; 