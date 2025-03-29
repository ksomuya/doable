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

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Book size={24} color="#4B5563" />
          <Text style={styles.title}>Today's Study Progress</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <BookOpen size={20} color="#4F46E5" />
            </View>
            <Text style={styles.statValue}>{chapters.length}</Text>
            <Text style={styles.statLabel}>Topics Added</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Zap size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{questionsCompleted}</Text>
            <Text style={styles.statLabel}>Questions Practiced</Text>
          </View>
        </View>

        {chapters.length > 0 && (
          <View style={styles.topicsContainer}>
            <Text style={styles.sectionTitle}>Topics Added Today</Text>
            <ScrollView
              style={styles.topicsList}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {chapters.map((chapter, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicText}>{chapter}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveChapter(chapter)}
                    style={styles.removeTopicButton}
                  >
                    <X size={12} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddChapter}>
          <Plus size={20} color="white" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Add More Topics</Text>
        </TouchableOpacity>
      </View>

      {/* Combined Selection Modal */}
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
                    placeholder="Search chapters..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                <Text style={styles.modalSubtitle}>
                  Select the chapters you've studied today
                </Text>

                <ScrollView style={styles.chaptersList}>
                  {filteredChapters?.map((chapter, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.chapterOption}
                      onPress={() => handleChapterSelect(chapter)}
                    >
                      <View style={styles.chapterOptionContent}>
                        <View
                          style={[
                            styles.chapterColorDot,
                            { backgroundColor: selectedSubject.color },
                          ]}
                        />
                        <Text style={styles.chapterOptionText}>{chapter}</Text>
                      </View>
                      <ChevronRight size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  Please select a subject to continue
                </Text>
                <ScrollView style={styles.subjectList}>
                  {subjects.map((subject) => (
                    <TouchableOpacity
                      key={subject.id}
                      style={styles.subjectItem}
                      onPress={() => handleSubjectSelect(subject)}
                    >
                      <View
                        style={[
                          styles.subjectIcon,
                          { backgroundColor: subject.color },
                        ]}
                      >
                        <Book size={24} color="white" />
                      </View>
                      <View style={styles.subjectTextContainer}>
                        <Text style={styles.subjectName}>{subject.name}</Text>
                        <Text style={styles.subjectDescription}>
                          {subject.chapters.length} chapters available
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#6B7280" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
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
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  topicsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  topicsList: {
    flexDirection: "row",
    marginBottom: 8,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  topicText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 4,
  },
  removeTopicButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  subjectList: {
    maxHeight: height * 0.5,
  },
  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  subjectTextContainer: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  chaptersList: {
    maxHeight: height * 0.5,
  },
  chapterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  chapterOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  chapterColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  chapterOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },
});

export default ChapterInput;
