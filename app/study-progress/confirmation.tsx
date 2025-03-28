import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Check, ChevronRight } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";

interface SelectedData {
  subject: string;
  chapters: {
    name: string;
    topics: string[];
  }[];
}

const ConfirmationScreen = () => {
  const { subject, data } = useLocalSearchParams<{
    subject: string;
    data: string;
  }>();
  const { updateStudiedChapters } = useAppContext();

  const selectedData: SelectedData = JSON.parse(data);

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = () => {
    // Navigate to next subject or completion
    const subjects = ["physics", "chemistry", "mathematics"];
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Selection</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>
            {selectedData.subject} - Selected Topics
          </Text>

          {selectedData.chapters.length > 0 ? (
            selectedData.chapters.map((chapter, index) => (
              <View key={index} style={styles.chapterSummary}>
                <Text style={styles.chapterName}>{chapter.name}</Text>

                {chapter.topics.length > 0 ? (
                  <View style={styles.topicsList}>
                    {chapter.topics.map((topic, topicIndex) => (
                      <View key={topicIndex} style={styles.topicItem}>
                        <Check
                          size={16}
                          color="#10B981"
                          style={styles.checkIcon}
                        />
                        <Text style={styles.topicName}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.topicItem}>
                    <Check size={16} color="#10B981" style={styles.checkIcon} />
                    <Text style={styles.topicName}>All Topics</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No topics selected</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.editButton} onPress={handleBack}>
          <Text style={styles.editButtonText}>Edit Selection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>
            {subject === "mathematics" ? "Complete Setup" : "Next Subject"}
          </Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  chapterSummary: {
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chapterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  topicsList: {
    gap: 8,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: 8,
  },
  topicName: {
    fontSize: 14,
    color: "#4B5563",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
});

export default ConfirmationScreen;
