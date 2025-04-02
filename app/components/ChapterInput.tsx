import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import {
  Book,
  Search,
  X,
  ChevronRight,
  Plus,
  Zap,
  BookOpen,
  CheckCircle,
  TrendingUp,
} from "lucide-react-native";

const { height } = Dimensions.get("window");

interface ChapterInputProps {
  onSave?: (chapters: string[]) => void;
  initialChapters?: string[];
  questionsCompleted?: number;
}

const subjects = [
  {
    id: "physics",
    name: "Physics",
    color: "#3B82F6",
    chapters: [
      "Kinematics",
      "Newton's Laws",
      "Work and Energy",
      "Rotational Motion",
      "Gravitation",
      "Thermodynamics",
      "Waves",
      "Optics",
      "Electrostatics",
      "Current Electricity",
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    color: "#10B981",
    chapters: [
      "Atomic Structure",
      "Chemical Bonding",
      "States of Matter",
      "Thermodynamics",
      "Equilibrium",
      "Redox Reactions",
      "Organic Chemistry",
      "Polymers",
      "Surface Chemistry",
      "Electrochemistry",
    ],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    color: "#8B5CF6",
    chapters: [
      "Sets and Functions",
      "Algebra",
      "Coordinate Geometry",
      "Calculus",
      "Vectors",
      "3D Geometry",
      "Linear Programming",
      "Probability",
      "Statistics",
      "Trigonometry",
    ],
  },
];

const ChapterInput = ({
  onSave = () => {},
  initialChapters = [],
  questionsCompleted = 0,
}: ChapterInputProps) => {
  const [chapters, setChapters] = useState<string[]>(initialChapters);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<
    (typeof subjects)[0] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalY] = useState(new Animated.Value(height));

  useEffect(() => {
    if (showModal) {
      Animated.spring(modalY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(modalY, {
        toValue: height,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal]);

  const handleAddChapter = () => {
    setShowModal(true);
  };

  const handleSubjectSelect = (subject: (typeof subjects)[0]) => {
    setSelectedSubject(subject);
  };

  const handleChapterSelect = (chapter: string) => {
    if (!chapters.includes(chapter)) {
      const updatedChapters = [...chapters, chapter];
      setChapters(updatedChapters);
      onSave(updatedChapters);
    }
    setShowModal(false);
    setSelectedSubject(null);
    setSearchQuery("");
  };

  const handleRemoveChapter = (chapter: string) => {
    const updatedChapters = chapters.filter((c) => c !== chapter);
    setChapters(updatedChapters);
    onSave(updatedChapters);
  };

  const handleBack = () => {
    setSelectedSubject(null);
    setSearchQuery("");
  };

  const filteredChapters = selectedSubject?.chapters.filter((chapter) =>
    chapter.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate progress percentage for visualization
  const totalGoal = 5; // Example goal of 5 topics per day
  const progressPercentage = Math.min(100, (chapters.length / totalGoal) * 100);
  
  // Calculate questions goal and progress
  const questionsGoal = 20; // Example goal of 20 questions per day
  const questionsPercentage = Math.min(100, (questionsCompleted / questionsGoal) * 100);

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Today's Learning</Text>
        </View>
        
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressColumn}>
            <View style={styles.progressLabelRow}>
              <BookOpen size={14} color="#4F46E5" />
              <Text style={styles.progressLabel}>Topics: {chapters.length}/{totalGoal}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  {width: `${progressPercentage}%`, backgroundColor: '#4F46E5'}
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.progressColumn}>
            <View style={styles.progressLabelRow}>
              <Zap size={14} color="#F59E0B" />
              <Text style={styles.progressLabel}>Questions: {questionsCompleted}/{questionsGoal}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  {width: `${questionsPercentage}%`, backgroundColor: '#F59E0B'}
                ]} 
              />
            </View>
          </View>
        </View>
        
        {/* Topics Section */}
        {chapters.length > 0 ? (
          <View style={styles.topicsSection}>
            <View style={styles.topicsSectionHeader}>
              <Text style={styles.sectionTitle}>Topics Covered</Text>
              <TouchableOpacity 
                style={styles.addTopicButton} 
                onPress={handleAddChapter}
              >
                <Plus size={16} color="#4F46E5" />
                <Text style={styles.addTopicText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.topicsList}>
              {chapters.map((chapter, index) => (
                <View key={index} style={styles.topicItem}>
                  <View style={styles.topicContent}>
                    <CheckCircle size={16} color="#4F46E5" style={styles.topicIcon} />
                    <Text style={styles.topicText}>{chapter}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveChapter(chapter)}>
                    <X size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Book size={36} color="#E5E7EB" />
            <Text style={styles.emptyStateText}>No topics added yet</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton} 
              onPress={handleAddChapter}
            >
              <Plus size={16} color="white" />
              <Text style={styles.emptyStateButtonText}>Add Topics</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Motivational Footer */}
        {chapters.length > 0 && (
          <View style={styles.cardFooter}>
            <TrendingUp size={14} color="#4F46E5" />
            <Text style={styles.footerText}>
              {chapters.length >= totalGoal 
                ? "Amazing! You've hit your goal for today." 
                : `Add ${totalGoal - chapters.length} more topic${totalGoal - chapters.length !== 1 ? 's' : ''} to reach your daily goal.`}
            </Text>
          </View>
        )}
      </View>

      {/* Topic Selection Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: modalY }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              {selectedSubject ? (
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                >
                  <ChevronRight
                    size={24}
                    color="#6B7280"
                    style={{ transform: [{ rotate: "180deg" }] }}
                  />
                </TouchableOpacity>
              ) : null}
              <Text style={styles.modalTitle}>
                {selectedSubject ? selectedSubject.name : "Select Subject"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedSubject ? (
              <>
                <View style={styles.searchContainer}>
                  <Search size={20} color="#6B7280" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <ScrollView style={styles.modalList}>
                  {filteredChapters?.map((chapter, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.modalItem}
                      onPress={() => handleChapterSelect(chapter)}
                    >
                      <Text style={styles.modalItemText}>{chapter}</Text>
                      <View
                        style={[
                          styles.subjectIndicator,
                          { backgroundColor: selectedSubject.color },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <ScrollView style={styles.modalList}>
                {subjects.map((subject, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.subjectItem}
                    onPress={() => handleSubjectSelect(subject)}
                  >
                    <View style={styles.subjectContent}>
                      <View
                        style={[
                          styles.subjectIcon,
                          { backgroundColor: subject.color },
                        ]}
                      >
                        <Book size={20} color="white" />
                      </View>
                      <Text style={styles.subjectText}>{subject.name}</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#4F46E5",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  progressSection: {
    padding: 16,
  },
  progressColumn: {
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
    color: "#4B5563",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  topicsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topicsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  addTopicButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  addTopicText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4F46E5",
    marginLeft: 4,
  },
  topicsList: {
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    padding: 12,
  },
  topicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  topicContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicIcon: {
    marginRight: 8,
  },
  topicText: {
    fontSize: 14,
    color: "#374151",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
    marginBottom: 16,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500",
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  subjectContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  modalItemText: {
    fontSize: 16,
    color: "#1F2937",
  },
  subjectIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default ChapterInput;
