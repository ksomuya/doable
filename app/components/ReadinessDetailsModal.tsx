import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { X, Brain, ChevronRight, Sword, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface SubjectItem {
  id: string;
  name: string;
  mastery: number;
}

interface TopicItem {
  id: string;
  name: string;
  mastery: number;
}

interface ReadinessDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  readinessScore: number;
  weakestSubjects: SubjectItem[];
  weakestTopics: TopicItem[];
}

const ReadinessDetailsModal: React.FC<ReadinessDetailsModalProps> = ({
  visible,
  onClose,
  readinessScore,
  weakestSubjects,
  weakestTopics,
}) => {
  const router = useRouter();
  
  // Calculate the color based on readiness score
  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green - excellent
    if (score >= 60) return '#0EA5E9'; // Blue - good
    if (score >= 40) return '#F59E0B'; // Yellow - average
    if (score >= 20) return '#F97316'; // Orange - below average
    return '#EF4444'; // Red - needs improvement
  };
  
  // Calculate the color based on mastery level
  const getMasteryColor = (mastery: number) => {
    if (mastery >= 0.8) return '#10B981'; // Green - excellent
    if (mastery >= 0.6) return '#0EA5E9'; // Blue - good
    if (mastery >= 0.4) return '#F59E0B'; // Yellow - average
    if (mastery >= 0.2) return '#F97316'; // Orange - below average
    return '#EF4444'; // Red - needs improvement
  };
  
  // Format mastery as percentage
  const formatMastery = (mastery: number) => {
    return `${Math.round(mastery * 100)}%`;
  };
  
  // Handle start refine session
  const handleStartRefineSession = () => {
    // Close the modal
    onClose();
    
    // Navigate to the practice screen with refine mode
    // Pass the weakest topics as query params
    const topicIds = weakestTopics.map(topic => topic.id);
    router.push({
      pathname: '/practice',
      params: { 
        mode: 'refine',
        topicIds: topicIds.join(',')
      }
    });
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Brain size={20} color="#4F46E5" />
              <Text style={styles.modalTitle}>Exam Readiness Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {/* Readiness Score */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Your Readiness Score</Text>
            <Text style={[styles.score, { color: getReadinessColor(readinessScore) }]}>
              {Math.round(readinessScore)} / 100
            </Text>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Weakest Subjects Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weakest Subjects</Text>
              
              {weakestSubjects.length > 0 ? (
                weakestSubjects.map((subject, index) => (
                  <View key={subject.id} style={styles.itemContainer}>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemNumber}>{index + 1}</Text>
                      <Text style={styles.itemName}>{subject.name}</Text>
                    </View>
                    <Text style={[styles.itemMastery, { color: getMasteryColor(subject.mastery) }]}>
                      {formatMastery(subject.mastery)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No weak subjects found</Text>
                </View>
              )}
            </View>
            
            {/* Weakest Topics Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weakest Topics</Text>
              
              {weakestTopics.length > 0 ? (
                weakestTopics.map((topic, index) => (
                  <View key={topic.id} style={styles.itemContainer}>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemNumber}>{index + 1}</Text>
                      <Text style={styles.itemName}>{topic.name}</Text>
                    </View>
                    <Text style={[styles.itemMastery, { color: getMasteryColor(topic.mastery) }]}>
                      {formatMastery(topic.mastery)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No weak topics found</Text>
                </View>
              )}
            </View>
            
            {/* Recommendation */}
            {weakestTopics.length > 0 && (
              <View style={styles.recommendationContainer}>
                <View style={styles.recommendationIconContainer}>
                  <AlertTriangle size={20} color="#F59E0B" />
                </View>
                <Text style={styles.recommendationText}>
                  Focus on improving these topics to boost your exam readiness
                </Text>
              </View>
            )}
          </ScrollView>
          
          {/* Start Refine Session Button */}
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartRefineSession}
            disabled={weakestTopics.length === 0}
          >
            <Sword size={20} color="white" />
            <Text style={styles.startButtonText}>Start Refine Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
  },
  scrollView: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  itemName: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  itemMastery: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  recommendationIconContainer: {
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default ReadinessDetailsModal; 