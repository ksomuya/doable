import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, ChevronDown, ChevronUp, Check } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { fetchUserChapters, updateChapterStudyStatus, updateTopicStudyStatus } from "../utils/chapterUtils";

interface SubjectData {
  name: string;
  color: string;
}

interface Topic {
  id: string;
  name: string;
  isStudied?: boolean;
  chapter_id?: string;
}

interface Chapter {
  id: string;
  name: string;
  class_level: string;
  subject_id: string;
  isStudied?: boolean;
  subjects?: SubjectData;
  topics?: Topic[];
}

const ChaptersScreen = () => {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { surveyData, updateStudiedChapters } = useAppContext();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChapters = async () => {
      if (!clerkUser) return;
      
      try {
        setLoading(true);
        
        // Get Clerk token for RLS authentication
        const token = await getToken() || undefined;
        
        const { chapters: fetchedChapters } = await fetchUserChapters(
          clerkUser.id,
          surveyData.currentClass || "Class 11",
          surveyData.preparationLevel || "Beginner",
          surveyData.examType || "JEE",
          token // Pass token to authenticate the request
        );
        
        // Set chapter data and find subject info
        const filteredChapters = fetchedChapters.filter(c => 
          c.subjects && 
          c.subjects.name.toLowerCase() === (subject || "").toLowerCase()
        );
        
        setChapters(filteredChapters);
        
        // Get subject data from the first chapter (they all belong to same subject)
        if (filteredChapters.length > 0 && filteredChapters[0].subjects) {
          setSubjectData(filteredChapters[0].subjects);
        }
        
        // Set selected chapters from those marked as studied
        setSelectedChapters(filteredChapters
          .filter(c => c.isStudied)
          .map(c => c.id)
        );
      } catch (error) {
        console.error("Error loading chapters:", error);
        setError("Failed to load chapters");
      } finally {
        setLoading(false);
      }
    };
    
    loadChapters();
  }, [clerkUser, subject, surveyData]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      if (prev.includes(chapterId)) {
        return prev.filter(id => id !== chapterId);
      } else {
        return [...prev, chapterId];
      }
    });
  };

  const toggleSelectChapter = async (chapter: Chapter) => {
    if (!clerkUser?.id) return;
    
    try {
      const isCurrentlySelected = selectedChapters.includes(chapter.id);
      
      // Update local state first for responsive UI
      setSelectedChapters(prev => 
        isCurrentlySelected
          ? prev.filter(id => id !== chapter.id)
          : [...prev, chapter.id]
      );
      
      // Get Clerk token for RLS authentication
      const token = await getToken() || undefined;
      
      // Update in Supabase
      await updateChapterStudyStatus(
        clerkUser.id,
        chapter.id,
        !isCurrentlySelected,
        token // Pass token to authenticate the request
      );
      
      // Update the chapters state to reflect changes
      setChapters(prev => 
        prev.map(c => 
          c.id === chapter.id 
            ? { ...c, isStudied: !isCurrentlySelected } 
            : c
        )
      );
    } catch (err) {
      console.error("Error toggling chapter:", err);
      // Revert the UI change if there was an error
      setSelectedChapters(prev => 
        selectedChapters.includes(chapter.id)
          ? prev
          : prev.filter(id => id !== chapter.id)
      );
    }
  };

  const toggleTopicStudied = async (chapterId: string, topicId: string, topicName: string, isStudied: boolean) => {
    if (!clerkUser?.id) return;
    
    try {
      // Get Clerk token for RLS authentication
      const token = await getToken() || undefined;
      
      // Update in Supabase
      await updateTopicStudyStatus(
        clerkUser.id,
        chapterId,
        topicId,
        topicName,
        isStudied,
        token // Pass token to authenticate the request
      );
      
      // Update local state to reflect the change
      setChapters(prev => 
        prev.map(chapter => {
          if (chapter.id === chapterId && chapter.topics) {
            return {
              ...chapter,
              topics: chapter.topics.map(topic => 
                topic.id === topicId 
                  ? { ...topic, isStudied } 
                  : topic
              )
            };
          }
          return chapter;
        })
      );
    } catch (err) {
      console.error("Error toggling topic:", err);
    }
  };

  const handleContinue = () => {
    // Get all studied topics
    const studiedTopics: string[] = [];
    
    // Collect studied chapters with their topics
    chapters.forEach(chapter => {
      if (selectedChapters.includes(chapter.id)) {
        // If whole chapter is selected
        studiedTopics.push(`${chapter.name} (${chapter.class_level})`);
      } else if (chapter.topics) {
        // Check for individual studied topics
        const studiedTopicsInChapter = chapter.topics
          .filter(topic => topic.isStudied)
          .map(topic => `${chapter.name} > ${topic.name}`);
          
        studiedTopics.push(...studiedTopicsInChapter);
      }
    });
    
    // Update context with studied chapters and topics
    updateStudiedChapters(studiedTopics);
    
    // Navigate to confirmation screen
    router.push({
      pathname: "/study-progress/confirmation",
      params: {
        subject: subject,
        data: JSON.stringify({
          subject: subjectData?.name || subject,
          chapters: chapters
            .filter(chapter => selectedChapters.includes(chapter.id) || 
                    (chapter.topics?.some(topic => topic.isStudied)))
            .map(chapter => ({
              name: chapter.name,
              class_level: chapter.class_level,
              isFullyStudied: selectedChapters.includes(chapter.id),
              topics: chapter.topics
                ?.filter(topic => topic.isStudied)
                .map(topic => topic.name) || []
            }))
        })
      }
    });
  };

  const handleSkip = () => {
    // Skip to next subject or completion
    router.push("/study-progress");
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Chapters</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading chapters...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !subjectData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Something went wrong"}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
                width: `${(selectedChapters.length / chapters.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {selectedChapters.length} chapters selected
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.instruction}>
          Select the chapters you've already studied
        </Text>

        {chapters.map((chapter) => (
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
                <View style={styles.classLevelBadge}>
                  <Text style={styles.classLevelText}>{chapter.class_level}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.selectAllButton,
                  selectedChapters.includes(chapter.id) && {
                    backgroundColor: subjectData.color + "20",
                    borderColor: subjectData.color,
                  },
                ]}
                onPress={() => toggleSelectChapter(chapter)}
              >
                <Text
                  style={[
                    styles.selectAllText,
                    selectedChapters.includes(chapter.id) && {
                      color: subjectData.color,
                    },
                  ]}
                >
                  {selectedChapters.includes(chapter.id) ? "Selected" : "Select"}
                </Text>
                {selectedChapters.includes(chapter.id) && (
                  <Check size={16} color={subjectData.color} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>

            {expandedChapters.includes(chapter.id) && (
              <View style={styles.chapterDetailContainer}>
                <Text style={styles.chapterDetailText}>
                  Class: <Text style={styles.detailValue}>{chapter.class_level}</Text>
                </Text>
                
                {chapter.topics && chapter.topics.length > 0 ? (
                  <View style={styles.topicsContainer}>
                    <Text style={styles.topicsTitle}>Topics:</Text>
                    <View style={styles.topicsList}>
                      {chapter.topics.map(topic => (
                        <TouchableOpacity
                          key={topic.id}
                          style={[
                            styles.topicItem,
                            topic.isStudied && {
                              backgroundColor: subjectData.color + "20",
                              borderColor: subjectData.color,
                            }
                          ]}
                          onPress={() => toggleTopicStudied(chapter.id, topic.id, topic.name, !topic.isStudied)}
                        >
                          <Text
                            style={[
                              styles.topicText,
                              topic.isStudied && { 
                                color: subjectData.color,
                                fontWeight: "500" 
                              }
                            ]}
                          >
                            {topic.name}
                          </Text>
                          {topic.isStudied && (
                            <Check size={14} color={subjectData.color} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noTopicsText}>No topics available for this chapter</Text>
                )}
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
              selectedChapters.length === 0 && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={selectedChapters.length === 0}
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#4B5563",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  instruction: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    marginBottom: 20,
  },
  chapterContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  chapterHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  chapterTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
    flex: 1,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  selectAllText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 4,
  },
  chapterDetailContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  chapterDetailText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: "500",
    color: "#111827",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 40,
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#93C5FD",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  classLevelBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  classLevelText: {
    fontSize: 12,
    color: "#4B5563",
  },
  topicsContainer: {
    marginTop: 16,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  topicsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topicItem: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 4,
  },
  noTopicsText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default ChaptersScreen;
