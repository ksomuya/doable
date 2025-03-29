import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import {
  ChevronDown,
  Check,
  ChevronUp,
  ChevronRight,
  Book,
} from "lucide-react-native";

const { height } = Dimensions.get("window");

interface Topic {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  subject: {
    name: string;
    color: string;
    chapters: Chapter[];
  } | null;
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  onSelectAllChapter: (chapter: Chapter) => void;
  onConfirm: () => void;
}

const BottomSheetModal = ({
  isVisible,
  onClose,
  subject,
  selectedTopics,
  onTopicToggle,
  onSelectAllChapter,
  onConfirm,
}: BottomSheetModalProps) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const [expandedChapters, setExpandedChapters] = React.useState<string[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Open the modal
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 9,
      }).start();

      // Expand the first chapter by default
      if (subject?.chapters.length && expandedChapters.length === 0) {
        setExpandedChapters([subject.chapters[0].id]);
      }
    } else {
      // Close the modal
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, subject]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  if (!subject) return null;

  const selectedTopicsCount = selectedTopics.length;

  return (
    isVisible && (
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: translateY }] },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>Your Study Progress</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ChevronDown size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.instruction}>
              Please indicate which topics you've already covered in your class
              to help us personalize your practice sessions
            </Text>

            <View style={styles.subjectHeader}>
              <View
                style={[styles.subjectIcon, { backgroundColor: subject.color }]}
              >
                <Book size={24} color="white" />
              </View>
              <Text style={styles.subjectName}>{subject.name}</Text>
            </View>

            {subject.chapters.map((chapter) => (
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
                        backgroundColor: subject.color + "20",
                        borderColor: subject.color,
                      },
                    ]}
                    onPress={() => onSelectAllChapter(chapter)}
                  >
                    <Text
                      style={[
                        styles.selectAllText,
                        chapter.topics.every((topic) =>
                          selectedTopics.includes(topic.id),
                        ) && {
                          color: subject.color,
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
                    ) && <Check size={16} color={subject.color} />}
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
                            backgroundColor: subject.color + "20",
                            borderColor: subject.color,
                          },
                        ]}
                        onPress={() => onTopicToggle(topic.id)}
                      >
                        <View style={styles.topicContent}>
                          <View
                            style={[
                              styles.topicDot,
                              selectedTopics.includes(topic.id) && {
                                backgroundColor: subject.color,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.topicText,
                              selectedTopics.includes(topic.id) && {
                                color: subject.color,
                                fontWeight: "600",
                              },
                            ]}
                          >
                            {topic.name}
                          </Text>
                        </View>
                        {selectedTopics.includes(topic.id) && (
                          <Check size={16} color={subject.color} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                {selectedTopicsCount > 0 ? (
                  <>
                    You've selected {selectedTopicsCount}{" "}
                    {selectedTopicsCount === 1 ? "topic" : "topics"}
                  </>
                ) : (
                  "No topics selected yet"
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: subject.color },
                selectedTopicsCount === 0 && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={selectedTopicsCount === 0}
            >
              <Text style={styles.confirmButtonText}>
                {selectedTopicsCount > 0 ? "Continue" : "Skip for now"}
              </Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    position: "relative",
  },
  handle: {
    position: "absolute",
    top: 8,
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 24,
    lineHeight: 22,
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
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
    padding: 16,
    backgroundColor: "white",
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  topicContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginRight: 12,
  },
  topicText: {
    fontSize: 15,
    color: "#4B5563",
  },
  spacer: {
    height: 100,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  summaryContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: "#065F46",
    textAlign: "center",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
});

export default BottomSheetModal;
