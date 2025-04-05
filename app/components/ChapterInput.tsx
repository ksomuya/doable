import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  ActivityIndicator,
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
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useAppContext } from "../context/AppContext";
import { fetchUserChapters, updateChapterStudyStatus, updateTopicStudyStatus } from "../utils/chapterUtils";

const { height } = Dimensions.get("window");

// Brand colors
const COLORS = {
  accent: "#f97316",        // Orange accent color
  accentLight: "#fff1e6",   // Light orange for backgrounds
  white: "#FFFFFF",
  black: "#000000", 
  gray: "#6B7280",
  lightGray: "#F9FAFB",
};

interface ChapterInputProps {
  onSave?: (chapters: string[]) => void;
  initialChapters?: string[];
  questionsCompleted?: number;
}

// Define our local interfaces
interface TopicType {
  id: string;
  name: string;
  chapter_id?: string;
  isStudied?: boolean;
}

interface ChapterType {
  id: string;
  name: string;
  class_level: string;
  isStudied?: boolean;
  subject_id: string;
  subjects?: {
    name: string;
    color: string;
  };
  topics?: TopicType[];
}

interface SubjectType {
  id: string;
  name: string;
  color: string;
  chapters: ChapterType[];
}

// Constants
const TOTAL_GOAL = 5; // Example goal of 5 topics per day
const QUESTIONS_GOAL = 20; // Example goal of 20 questions per day

const ChapterInput = ({
  onSave = () => {},
  initialChapters = [],
  questionsCompleted = 0,
}: ChapterInputProps) => {
  const { user: clerkUser } = useUser();
  const { surveyData } = useAppContext();
  const [chapters, setChapters] = useState<string[]>(initialChapters);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalY] = useState(new Animated.Value(height));
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [studiedChapters, setStudiedChapters] = useState<ChapterType[]>([]);
  const { getToken } = useAuth();
  
  // Load subjects and chapters from Supabase
  useEffect(() => {
    const loadChapters = async () => {
      if (!clerkUser?.id || !surveyData.examType || !surveyData.currentClass) {
        return;
      }
      
      setIsLoading(true);
      try {
        // Get Clerk token for RLS authentication
        const token = await getToken() || undefined;
        
        const { chapters: fetchedChapters } = await fetchUserChapters(
          clerkUser.id,
          surveyData.currentClass,
          surveyData.preparationLevel || 'Beginner',
          surveyData.examType,
          token // Pass token to authenticate the request
        );
        
        // Group chapters by subject
        const subjectsMap: Record<string, SubjectType> = {};
        fetchedChapters.forEach(chapter => {
          if (chapter.subjects) {
            const subjectId = chapter.subject_id;
            
            if (!subjectsMap[subjectId]) {
              subjectsMap[subjectId] = {
                id: subjectId,
                name: chapter.subjects.name,
                color: chapter.subjects.color,
                chapters: []
              };
            }
            
            subjectsMap[subjectId].chapters.push({
              ...chapter,
              isStudied: chapter.isStudied || false, // Ensure isStudied is always boolean
            });
          }
        });
        
        setSubjects(Object.values(subjectsMap));
        
        // Get studied chapters
        const studied = fetchedChapters
          .filter(chapter => chapter.isStudied)
          .map(chapter => ({
            ...chapter,
            isStudied: true // Ensure isStudied is always true for studied chapters
          }));
          
        setStudiedChapters(studied);
        
        // Update chapters list for display
        const chapterNames = studied.map(chapter => 
          `${chapter.name} (${chapter.class_level})`
        );
        setChapters(chapterNames);
        
      } catch (error) {
        console.error('Error loading chapters:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChapters();
  }, [clerkUser, surveyData, getToken]);

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
  }, [showModal, modalY]);

  const handleAddChapter = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleSubjectSelect = useCallback((subject: SubjectType) => {
    setSelectedSubject(subject);
  }, []);

  const handleChapterSelect = useCallback(
    async (chapter: ChapterType) => {
      if (!clerkUser?.id) return;
      
      try {
        // Get Clerk token for RLS authentication
        const token = await getToken() || undefined;
        
        // Update in Supabase
        const result = await updateChapterStudyStatus(
          clerkUser.id,
          chapter.id,
          true,
          token // Pass token to authenticate the request
        );
        
        if (result.success) {
          // Update local state
          const chapterDisplay = `${chapter.name} (${chapter.class_level})`;
          if (!chapters.includes(chapterDisplay)) {
            const updatedChapters = [...chapters, chapterDisplay];
            setChapters(updatedChapters);
            onSave(updatedChapters);
            
            // Add to studied chapters
            const updatedChapter = { ...chapter, isStudied: true };
            setStudiedChapters(prev => [...prev, updatedChapter]);
          }
        }
      } catch (error) {
        console.error('Error marking chapter as studied:', error);
      }
      
      setShowModal(false);
      setSelectedSubject(null);
      setSearchQuery("");
    },
    [chapters, onSave, clerkUser, getToken]
  );

  const handleRemoveChapter = useCallback(
    async (chapterDisplay: string) => {
      if (!clerkUser?.id) return;
      
      try {
        // Extract chapter name from display format "Name (Class Level)"
        const nameMatch = chapterDisplay.match(/(.*) \((.*)\)/);
        if (!nameMatch) return;
        
        const chapterName = nameMatch[1];
        const classLevel = nameMatch[2];
        
        // Find the chapter in studied chapters
        const chapterToRemove = studiedChapters.find(
          c => c.name === chapterName && c.class_level === classLevel
        );
        
        if (chapterToRemove) {
          // Get Clerk token for RLS authentication
          const token = await getToken() || undefined;
          
          // Update in Supabase
          const result = await updateChapterStudyStatus(
            clerkUser.id,
            chapterToRemove.id,
            false,
            token // Pass token to authenticate the request
          );
          
          if (result.success) {
            // Update local state
            const updatedChapters = chapters.filter(c => c !== chapterDisplay);
            setChapters(updatedChapters);
            onSave(updatedChapters);
            setStudiedChapters(prev => prev.filter(c => c.id !== chapterToRemove.id));
          }
        }
      } catch (error) {
        console.error('Error removing chapter:', error);
      }
    },
    [chapters, onSave, studiedChapters, clerkUser, getToken]
  );

  const handleBack = useCallback(() => {
    setSelectedSubject(null);
    setSearchQuery("");
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Memoize filtered chapters
  const filteredChapters = useMemo(() => 
    selectedSubject?.chapters.filter((chapter) =>
      chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !chapter.isStudied
    ),
    [selectedSubject, searchQuery]
  );

  // Calculate progress percentages
  const progressPercentage = useMemo(() => 
    Math.min(100, (chapters.length / TOTAL_GOAL) * 100),
    [chapters.length]
  );
  
  const questionsPercentage = useMemo(() => 
    Math.min(100, (questionsCompleted / QUESTIONS_GOAL) * 100),
    [questionsCompleted]
  );

  // Memoize the motivational message
  const motivationalMessage = useMemo(() => 
    chapters.length >= TOTAL_GOAL
      ? "Amazing! You've hit your goal for today."
      : `Add ${TOTAL_GOAL - chapters.length} more topic${TOTAL_GOAL - chapters.length !== 1 ? 's' : ''} to reach your daily goal.`,
    [chapters.length]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

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
              <BookOpen size={14} color={COLORS.accent} />
              <Text style={styles.progressLabel}>Topics: {chapters.length}/{TOTAL_GOAL}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  {width: `${progressPercentage}%`, backgroundColor: COLORS.accent}
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.progressColumn}>
            <View style={styles.progressLabelRow}>
              <Zap size={14} color="#F59E0B" />
              <Text style={styles.progressLabel}>Questions: {questionsCompleted}/{QUESTIONS_GOAL}</Text>
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
                <Plus size={16} color={COLORS.white} />
                <Text style={styles.addTopicText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.topicsList}>
              {chapters.map((chapter, index) => (
                <View key={index} style={styles.topicItem}>
                  <View style={styles.topicContent}>
                    <CheckCircle size={16} color={COLORS.accent} style={styles.topicIcon} />
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
            <TrendingUp size={14} color={COLORS.accent} />
            <Text style={styles.footerText}>{motivationalMessage}</Text>
          </View>
        )}
      </View>

      {/* Topic Selection Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={closeModal}
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
                onPress={closeModal}
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
                  {filteredChapters && filteredChapters.length > 0 ? (
                    filteredChapters.map((chapter) => (
                      <TouchableOpacity
                        key={chapter.id}
                        style={styles.modalItem}
                        onPress={() => handleChapterSelect(chapter)}
                      >
                        <View style={styles.chapterItemContent}>
                          <Text style={styles.modalItemText}>{chapter.name}</Text>
                          <View style={styles.classLevelTag}>
                            <Text style={styles.classLevelText}>{chapter.class_level}</Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.subjectIndicator,
                            { backgroundColor: selectedSubject.color },
                          ]}
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.noResults}>
                      <Text style={styles.noResultsText}>
                        {searchQuery 
                          ? "No matching chapters found" 
                          : "All chapters in this subject have been studied"}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </>
            ) : (
              <ScrollView style={styles.modalList}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
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
    backgroundColor: COLORS.accentLight,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.accent,
  },
  progressSection: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  progressColumn: {
    flex: 1,
    marginRight: 8,
  },
  progressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
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
    padding: 16,
  },
  topicsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  addTopicButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addTopicText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
    marginLeft: 4,
  },
  topicsList: {
    gap: 8,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  topicContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  topicIcon: {
    marginRight: 8,
  },
  topicText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FEF3C7",
  },
  footerText: {
    fontSize: 12,
    marginLeft: 6,
    color: "#92400E",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 16,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.7,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 0,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  chapterItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalItemText: {
    fontSize: 16,
    color: "#111827",
  },
  subjectIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    color: "#111827",
  },
  classLevelTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  classLevelText: {
    fontSize: 12,
    color: "#4B5563",
  },
  noResults: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default ChapterInput;
