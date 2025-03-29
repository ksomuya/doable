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
import { ChevronDown, Check, ChevronUp } from "lucide-react-native";

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
            <Text style={styles.title}>{subject.name} Chapters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ChevronDown size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.instruction}>
              Select the chapters and topics you've already studied
            </Text>

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
                Add {selectedTopicsCount}{" "}
                {selectedTopicsCount === 1 ? "Topic" : "Topics"}
              </Text>
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
    fontSize: 18,
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
  spacer: {
    height: 100,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
});

export default BottomSheetModal;
