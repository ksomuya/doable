import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import SubjectSelection from "../components/SubjectSelection";
import BottomSheetModal from "../components/BottomSheetModal";
import { useAppContext } from "../context/AppContext";
import { ChevronRight } from "lucide-react-native";

const subjectsData = {
  physics: {
    name: "Physics",
    color: "#3B82F6",
    chapters: [
      {
        id: "mechanics",
        name: "Mechanics",
        topics: [
          { id: "kinematics", name: "Kinematics" },
          { id: "newton-laws", name: "Newton's Laws" },
          { id: "work-energy", name: "Work and Energy" },
          { id: "rotational", name: "Rotational Motion" },
        ],
      },
      {
        id: "thermodynamics",
        name: "Thermodynamics",
        topics: [
          { id: "heat", name: "Heat and Temperature" },
          { id: "laws", name: "Laws of Thermodynamics" },
          { id: "thermal", name: "Thermal Properties" },
        ],
      },
      {
        id: "waves",
        name: "Waves",
        topics: [
          { id: "wave-motion", name: "Wave Motion" },
          { id: "sound", name: "Sound Waves" },
          { id: "doppler", name: "Doppler Effect" },
        ],
      },
      {
        id: "optics",
        name: "Optics",
        topics: [
          { id: "reflection", name: "Reflection" },
          { id: "refraction", name: "Refraction" },
          { id: "lenses", name: "Lenses" },
          { id: "wave-optics", name: "Wave Optics" },
        ],
      },
      {
        id: "electromagnetism",
        name: "Electromagnetism",
        topics: [
          { id: "electrostatics", name: "Electrostatics" },
          { id: "current", name: "Current Electricity" },
          { id: "magnetism", name: "Magnetism" },
          { id: "em-induction", name: "Electromagnetic Induction" },
        ],
      },
    ],
  },
  chemistry: {
    name: "Chemistry",
    color: "#10B981",
    chapters: [
      {
        id: "physical",
        name: "Physical Chemistry",
        topics: [
          { id: "atomic-structure", name: "Atomic Structure" },
          { id: "chemical-bonding", name: "Chemical Bonding" },
          { id: "states-of-matter", name: "States of Matter" },
          { id: "thermodynamics", name: "Thermodynamics" },
        ],
      },
      {
        id: "inorganic",
        name: "Inorganic Chemistry",
        topics: [
          { id: "periodic-table", name: "Periodic Table" },
          { id: "s-block", name: "s-Block Elements" },
          { id: "p-block", name: "p-Block Elements" },
          { id: "d-block", name: "d-Block Elements" },
        ],
      },
      {
        id: "organic",
        name: "Organic Chemistry",
        topics: [
          { id: "hydrocarbons", name: "Hydrocarbons" },
          { id: "functional-groups", name: "Functional Groups" },
          { id: "biomolecules", name: "Biomolecules" },
          { id: "polymers", name: "Polymers" },
        ],
      },
    ],
  },
  mathematics: {
    name: "Mathematics",
    color: "#8B5CF6",
    chapters: [
      {
        id: "algebra",
        name: "Algebra",
        topics: [
          { id: "complex-numbers", name: "Complex Numbers" },
          { id: "matrices", name: "Matrices and Determinants" },
          { id: "quadratic", name: "Quadratic Equations" },
          { id: "progressions", name: "Progressions" },
        ],
      },
      {
        id: "calculus",
        name: "Calculus",
        topics: [
          { id: "limits", name: "Limits and Continuity" },
          { id: "derivatives", name: "Derivatives" },
          { id: "integrals", name: "Integrals" },
          { id: "applications", name: "Applications of Calculus" },
        ],
      },
      {
        id: "coordinate",
        name: "Coordinate Geometry",
        topics: [
          { id: "straight-lines", name: "Straight Lines" },
          { id: "circles", name: "Circles" },
          { id: "conics", name: "Conic Sections" },
        ],
      },
      {
        id: "trigonometry",
        name: "Trigonometry",
        topics: [
          { id: "ratios", name: "Trigonometric Ratios" },
          { id: "identities", name: "Trigonometric Identities" },
          { id: "equations", name: "Trigonometric Equations" },
        ],
      },
      {
        id: "statistics",
        name: "Statistics & Probability",
        topics: [
          { id: "measures", name: "Measures of Central Tendency" },
          { id: "probability", name: "Probability" },
          { id: "distributions", name: "Probability Distributions" },
        ],
      },
    ],
  },
};

const StudyProgressScreen = () => {
  const { surveyData, updateStudiedChapters } = useAppContext();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<
    Record<string, number>
  >({});
  const [allCompleted, setAllCompleted] = useState(false);

  // Check if all subjects have been processed
  useEffect(() => {
    const subjects = Object.keys(subjectsData);
    const completedSubjects = Object.keys(subjectProgress);
    if (
      completedSubjects.length > 0 &&
      completedSubjects.length === subjects.length
    ) {
      setAllCompleted(true);
    }
  }, [subjectProgress]);

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedTopics([]);
    setSelectedChapters([]);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  const handleSelectAllChapter = (chapter: any) => {
    const allTopicIds = chapter.topics.map((topic: any) => topic.id);
    const allSelected = allTopicIds.every((id: string) =>
      selectedTopics.includes(id),
    );

    if (allSelected) {
      // Deselect all topics in this chapter
      setSelectedTopics((prev) =>
        prev.filter((id) => !allTopicIds.includes(id)),
      );
      setSelectedChapters((prev) => prev.filter((id) => id !== chapter.id));
    } else {
      // Select all topics in this chapter
      const newSelectedTopics = [...selectedTopics];
      allTopicIds.forEach((id: string) => {
        if (!newSelectedTopics.includes(id)) {
          newSelectedTopics.push(id);
        }
      });
      setSelectedTopics(newSelectedTopics);
      setSelectedChapters((prev) =>
        prev.includes(chapter.id) ? prev : [...prev, chapter.id],
      );
    }
  };

  const handleConfirmSelection = () => {
    if (selectedSubject) {
      // Update progress for this subject
      setSubjectProgress((prev) => ({
        ...prev,
        [selectedSubject]: selectedTopics.length,
      }));

      // Prepare data for context
      const subjectData =
        subjectsData[selectedSubject as keyof typeof subjectsData];
      const selectedData = {
        subject: subjectData.name,
        chapters: subjectData.chapters
          .filter(
            (chapter) =>
              chapter.topics.some((topic) =>
                selectedTopics.includes(topic.id),
              ) || selectedChapters.includes(chapter.id),
          )
          .map((chapter) => ({
            name: chapter.name,
            topics: chapter.topics
              .filter((topic) => selectedTopics.includes(topic.id))
              .map((topic) => topic.name),
          })),
      };

      // Convert to simple string array for the context
      const studiedChapters = selectedData.chapters.flatMap((chapter) =>
        chapter.topics.length > 0
          ? chapter.topics.map((topic) => `${chapter.name}: ${topic}`)
          : [`${chapter.name} (All Topics)`],
      );

      // Update context with studied chapters
      updateStudiedChapters(studiedChapters);

      // Close modal
      setModalVisible(false);
    }
  };

  const handleComplete = () => {
    router.push("/study-progress/completion");
  };

  const getSubjectModalData = () => {
    if (!selectedSubject) return null;
    return subjectsData[selectedSubject as keyof typeof subjectsData];
  };

  const getTotalTopicsSelected = () => {
    return Object.values(subjectProgress).reduce(
      (sum, count) => sum + count,
      0,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.subjectsContainer}>
        {Object.entries(subjectsData).map(([key, subject]) => (
          <TouchableOpacity
            key={key}
            style={styles.subjectCard}
            onPress={() => handleSubjectSelect(key)}
          >
            <View style={styles.subjectInfo}>
              <View style={styles.subjectIcon} />
              <Text style={styles.subjectName}>{subject.name}</Text>
            </View>

            <View style={styles.subjectAction}>
              {subjectProgress[key] !== undefined ? (
                <View style={styles.topicsAddedContainer}>
                  <Text style={styles.topicsAddedText}>
                    {subjectProgress[key]}{" "}
                    {subjectProgress[key] === 1 ? "topic" : "topics"} added
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleSubjectSelect(key)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ChevronRight size={20} color="#6B7280" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {getTotalTopicsSelected() > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            You've added {getTotalTopicsSelected()}{" "}
            {getTotalTopicsSelected() === 1 ? "topic" : "topics"} across{" "}
            {Object.keys(subjectProgress).length}{" "}
            {Object.keys(subjectProgress).length === 1 ? "subject" : "subjects"}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetModal
        isVisible={modalVisible}
        onClose={handleCloseModal}
        subject={getSubjectModalData()}
        selectedTopics={selectedTopics}
        onTopicToggle={handleTopicToggle}
        onSelectAllChapter={handleSelectAllChapter}
        onConfirm={handleConfirmSelection}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  subjectsContainer: {
    padding: 20,
  },
  subjectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subjectInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  subjectAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicsAddedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicsAddedText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3B82F6",
  },
  summaryContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  summaryText: {
    fontSize: 14,
    color: "#065F46",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    marginTop: "auto",
  },
  completeButton: {
    backgroundColor: "#ED7930",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4F46E5",
  },
});

export default StudyProgressScreen;
