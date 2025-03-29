import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, ChevronDown, ChevronUp, Check } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";

interface Chapter {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

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

const ChaptersScreen = () => {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { updateStudiedChapters } = useAppContext();
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  const subjectData = subjectsData[subject as keyof typeof subjectsData];

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  const toggleSelectAllChapter = (chapter: Chapter) => {
    const allTopicIds = chapter.topics.map((topic) => topic.id);
    const allSelected = allTopicIds.every((id) => selectedTopics.includes(id));

    if (allSelected) {
      // Deselect all topics in this chapter
      setSelectedTopics((prev) =>
        prev.filter((id) => !allTopicIds.includes(id)),
      );
      setSelectedChapters((prev) => prev.filter((id) => id !== chapter.id));
    } else {
      // Select all topics in this chapter
      const newSelectedTopics = [...selectedTopics];
      allTopicIds.forEach((id) => {
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

  const handleContinue = () => {
    // Prepare data for confirmation screen
    const selectedData = {
      subject: subjectData.name,
      chapters: subjectData.chapters
        .filter(
          (chapter) =>
            chapter.topics.some((topic) => selectedTopics.includes(topic.id)) ||
            selectedChapters.includes(chapter.id),
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

    // Navigate to confirmation screen
    router.push({
      pathname: "/study-progress/confirmation",
      params: {
        subject: subject,
        data: JSON.stringify(selectedData),
      },
    });
  };

  const handleSkip = () => {
    // Skip to next subject or completion
    const subjects = Object.keys(subjectsData);
    const currentIndex = subjects.indexOf(subject as string);

    if (currentIndex < subjects.length - 1) {
      // Go to next subject
      router.push({
        pathname: "/study-progress/index",
        params: { skipTo: subjects[currentIndex + 1] },
      });
    } else {
      // All subjects done, go to completion
      router.push("/study-progress/completion");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subjectData.name} Chapters</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: subjectData.color,
                width: `${(selectedTopics.length / subjectData.chapters.reduce((acc, chapter) => acc + chapter.topics.length, 0)) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {selectedTopics.length} topics selected
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.instruction}>
          Select the chapters and topics you've already studied
        </Text>

        {subjectData.chapters.map((chapter) => (
          <View key={chapter.id} style={styles.chapterContainer}>
            <TouchableOpacity
              style={styles.chapterHeader}
              onPress={() => toggleChapter(chapter.id)}
            >
              <View style={styles.chapterTitleContainer}>
                {expandedChapters.includes(chapter.id) ? (
                  <ChevronUp size={20} color="#6B7280" />
                ) : (
                  <ChevronDown size={20} color="#6B7280" />
                )}
                <Text style={styles.chapterTitle}>{chapter.name}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.selectAllButton,
                  chapter.topics.every((topic) =>
                    selectedTopics.includes(topic.id),
                  ) && {
                    backgroundColor: subjectData.color + "20",
                    borderColor: subjectData.color,
                  },
                ]}
                onPress={() => toggleSelectAllChapter(chapter)}
              >
                <Text
                  style={[
                    styles.selectAllText,
                    chapter.topics.every((topic) =>
                      selectedTopics.includes(topic.id),
                    ) && {
                      color: subjectData.color,
                    },
                  ]}
                >
                  {chapter.topics.every((topic) =>
                    selectedTopics.includes(topic.id),
                  )
                    ? "Selected All"
                    : "Select All"}
                </Text>
                {chapter.topics.every((topic) =>
                  selectedTopics.includes(topic.id),
                ) && <Check size={16} color={subjectData.color} />}
              </TouchableOpacity>
            </TouchableOpacity>

            {expandedChapters.includes(chapter.id) && (
              <View style={styles.topicsContainer}>
                {chapter.topics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.topicChip,
                      selectedTopics.includes(topic.id) && {
                        backgroundColor: subjectData.color + "20",
                        borderColor: subjectData.color,
                      },
                    ]}
                    onPress={() => toggleTopic(topic.id)}
                  >
                    <Text
                      style={[
                        styles.topicText,
                        selectedTopics.includes(topic.id) && {
                          color: subjectData.color,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {topic.name}
                    </Text>
                    {selectedTopics.includes(topic.id) && (
                      <Check size={16} color={subjectData.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip Subject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedTopics.length === 0 && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={selectedTopics.length === 0}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 20,
  },
  chapterContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  chapterTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginRight: 4,
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    backgroundColor: "white",
    gap: 8,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  topicText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 40,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginLeft: 12,
    alignItems: "center",
    backgroundColor: "#ED7930",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
});

export default ChaptersScreen;
