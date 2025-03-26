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
import { Book, Search, X, ChevronRight } from "lucide-react-native";

const { height } = Dimensions.get("window");

interface ChapterInputProps {
  onSave?: (chapters: string[]) => void;
  initialChapters?: string[];
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
}: ChapterInputProps) => {
  const [chapters, setChapters] = useState<string[]>(initialChapters);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<typeof subjects[0] | null>(null);
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

  const handleSubjectSelect = (subject: typeof subjects[0]) => {
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
    chapter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Book size={24} color="#4B5563" />
          <Text style={styles.title}>Today's Study Progress</Text>
        </View>

        {chapters.length > 0 ? (
          <ScrollView style={styles.chapterList}>
            {chapters.map((chapter, index) => (
              <View key={index} style={styles.chapterItem}>
                <Text style={styles.chapterText}>{chapter}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveChapter(chapter)}
                  style={styles.removeButton}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Add chapters you've studied today
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddChapter}
        >
          <Text style={styles.addButtonText}>Add Chapter</Text>
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
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ChevronRight size={24} color="#6B7280" style={{ transform: [{ rotate: '180deg' }] }} />
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

                <ScrollView style={styles.chaptersList}>
                  {filteredChapters?.map((chapter, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.chapterOption}
                      onPress={() => handleChapterSelect(chapter)}
                    >
                      <Text style={styles.chapterOptionText}>{chapter}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <ScrollView style={styles.subjectList}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={styles.subjectItem}
                    onPress={() => handleSubjectSelect(subject)}
                  >
                    <View style={[styles.subjectIcon, { backgroundColor: subject.color }]}>
                      <Book size={24} color="white" />
                    </View>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <ChevronRight size={20} color="#6B7280" />
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
    padding: 16,
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
  chapterList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  chapterText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
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
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
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
  subjectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#1F2937",
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
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
  },
  chapterOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },
});

export default ChapterInput;