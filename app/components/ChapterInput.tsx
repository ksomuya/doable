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
  Alert,
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
  ChevronDown,
} from "lucide-react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useAppContext } from "../context/AppContext";
import { fetchUserChapters, updateChapterStudyStatus, updateTopicStudyStatus } from "../utils/chapterUtils";
import { recordDailyLogin, startStudySession, endStudySession } from "../utils/analyticsUtils";

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
  examType?: string;
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
  examType,
}: ChapterInputProps) => {
  const { user: clerkUser } = useUser();
  const { surveyData } = useAppContext();
  const [chapters, setChapters] = useState<string[]>(initialChapters);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalY] = useState(new Animated.Value(height));
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [studiedTopics, setStudiedTopics] = useState<{
    chapters: ChapterType[], 
    topics: TopicType[]
  }>({
    chapters: [],
    topics: []
  });
  // Add state for tracking errors and saving status
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { getToken } = useAuth();
  
  // Add state for tracking the current study session
  const [currentStudySessionId, setCurrentStudySessionId] = useState<string | null>(null);
  
  // Load subjects and chapters from Supabase
  useEffect(() => {
    const loadChapters = async () => {
      // Skip if already loaded successfully or user data is not available
      if (loadingComplete || !clerkUser?.id || !surveyData.examType || !surveyData.currentClass) {
        console.log('Skipping chapter load:', { 
          loadingComplete, 
          userId: clerkUser?.id ? 'present' : 'missing', 
          examType: surveyData.examType,
          currentClass: surveyData.currentClass 
        });
        return;
      }
      
      console.log('Loading chapters for:', { 
        userId: clerkUser.id,
        examType: surveyData.examType,
        class: surveyData.currentClass,
        prepLevel: surveyData.preparationLevel || 'Beginner'
      });
      
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
        
        console.log(`Fetched ${fetchedChapters.length} chapters`);
        
        // Group chapters by subject - color is now dynamically added in fetchUserChapters
        const subjectsMap: Record<string, SubjectType> = {};
        fetchedChapters.forEach(chapter => {
          if (chapter.subjects) {
            const subjectId = chapter.subject_id;
            
            if (!subjectsMap[subjectId]) {
              subjectsMap[subjectId] = {
                id: subjectId,
                name: chapter.subjects.name,
                color: (chapter.subjects as any).color || '#6B7280', // Use the dynamically assigned color with fallback
                chapters: []
              };
            }
            
            subjectsMap[subjectId].chapters.push({
              ...chapter,
              isStudied: chapter.isStudied || false, // Ensure isStudied is always boolean
            });
          } else {
            console.log('Chapter missing subject data:', chapter.id, chapter.name);
          }
        });
        
        const subjectsList = Object.values(subjectsMap);
        console.log(`Processed ${subjectsList.length} subjects:`, subjectsList.map(s => s.name));
        setSubjects(subjectsList);
        
        // Process studied chapters and topics
        const studiedChapters = fetchedChapters
          .filter(chapter => chapter.isStudied)
          .map(chapter => ({
            ...chapter,
            isStudied: true
          }));
        
        // Extract topics that are studied
        const allStudiedTopics: TopicType[] = [];
        fetchedChapters.forEach(chapter => {
          if (chapter.topics) {
            const studiedTopicsFromChapter = chapter.topics
              .filter(topic => topic.isStudied)
              .map(topic => ({
                ...topic,
                chapter_id: chapter.id,
                isStudied: true
              }));
            allStudiedTopics.push(...studiedTopicsFromChapter);
          }
        });

        setStudiedTopics({
          chapters: studiedChapters,
          topics: allStudiedTopics
        });
        
        // Create combined list of studied items (both chapters and topics)
        const chapterEntries = studiedChapters.map(chapter => 
          `${chapter.name} (${chapter.class_level})`
        );
        
        const topicEntries = allStudiedTopics.map(topic => {
          // Find the parent chapter
          const parentChapter = fetchedChapters.find(c => c.id === topic.chapter_id);
          const chapterInfo = parentChapter ? ` from ${parentChapter.name}` : '';
          return `${topic.name}${chapterInfo}`;
        });
        
        setChapters([...chapterEntries, ...topicEntries]);
        
        // Mark loading as complete to prevent unnecessary reloads
        setLoadingComplete(true);
      } catch (error) {
        console.error('Error loading chapters:', error);
        setLoadingError('Failed to load chapters. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only set loading state to true if not already loaded
    if (!loadingComplete) {
      loadChapters();
    } else {
      setIsLoading(false);
    }
  }, [clerkUser, surveyData, getToken, loadingComplete]);

  // Count of actual topics studied (for progress bar)
  const topicsStudiedCount = useMemo(() => 
    studiedTopics.topics.length + studiedTopics.chapters.length, 
    [studiedTopics.topics.length, studiedTopics.chapters.length]
  );

  // When initialChapters change from parent, update our state
  useEffect(() => {
    if (initialChapters.length > 0 && !loadingComplete) {
      console.log('Setting initial chapters:', initialChapters);
      setChapters(initialChapters);
      // We still need to fetch details when data comes from parent
      setLoadingComplete(false);
    }
  }, [initialChapters, loadingComplete]);

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

  // Initialize analytics and start study session
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        // Record daily login
        if (clerkUser?.id) {
          console.log("Recording daily login for user:", clerkUser.id);
          await recordDailyLogin(clerkUser.id);
          
          // Start a study session
          console.log("Starting study session for user:", clerkUser.id);
          const sessionId = await startStudySession(clerkUser.id);
          if (sessionId) {
            console.log("Study session started with ID:", sessionId);
            setCurrentStudySessionId(sessionId);
          }
        }
      } catch (error) {
        console.error("Error initializing analytics:", error);
      }
    };

    if (isLoading === false && loadingComplete && clerkUser?.id) {
      initAnalytics();
    }
  }, [isLoading, loadingComplete, clerkUser?.id]);

  // End study session when component unmounts
  useEffect(() => {
    return () => {
      if (currentStudySessionId && clerkUser?.id) {
        console.log("Ending study session:", currentStudySessionId);
        endStudySession(currentStudySessionId, clerkUser.id).catch(error => {
          console.error("Error ending study session:", error);
        });
      }
    };
  }, [currentStudySessionId, clerkUser?.id]);

  const handleAddChapter = useCallback(() => {
    setShowModal(true);
    setSaveError(null);
  }, []);

  const handleSubjectSelect = useCallback((subject: SubjectType) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
  }, []);
  
  const handleChapterSelect = useCallback(
    (chapter: ChapterType) => {
      if (chapter.topics && chapter.topics.length > 0) {
        // If chapter has topics, show topics listing
        setSelectedChapter(chapter);
      } else {
        // If no topics, mark the entire chapter as studied
        handleChapterStudied(chapter);
      }
    },
    []
  );
  
  const handleChapterStudied = useCallback(
    async (chapter: ChapterType) => {
      if (!clerkUser?.id) return;
      
      setSaveError(null);
      setIsSaving(true);
      
      try {
        // Get Clerk token for RLS authentication
        const token = await getToken() || undefined;
        
        console.log('Adding chapter with user ID:', {
          userId: clerkUser.id,
          chapterId: chapter.id,
          chapterName: chapter.name
        });
        
        // Update in Supabase
        const result = await updateChapterStudyStatus(
          clerkUser.id,
          chapter.id,
          true,
          token // Pass token to authenticate the request
        );
        
        console.log('Chapter study status update result:', result);
        
        if (result.success) {
          // Update local state
          const chapterDisplay = `${chapter.name} (${chapter.class_level})`;
          if (!chapters.includes(chapterDisplay)) {
            const updatedChapters = [...chapters, chapterDisplay];
            setChapters(updatedChapters);
            onSave(updatedChapters);
            
            // Add to studied chapters
            const updatedChapter = { ...chapter, isStudied: true };
            setStudiedTopics(prev => ({
              ...prev,
              chapters: [...prev.chapters, updatedChapter]
            }));
            
            // If we're tracking a study session, update it with this chapter's topics
            if (currentStudySessionId && chapter.topics && chapter.topics.length > 0) {
              // In a real implementation, we would update the study session with these topic IDs
              const topicIds = chapter.topics.map(t => t.id);
              console.log('Adding topics to study session:', {
                sessionId: currentStudySessionId,
                topicIds
              });
            }
          }
          
          // Close modal and reset state
          setShowModal(false);
          setSelectedSubject(null);
          setSelectedChapter(null);
          setSearchQuery("");
          // Optionally show a success message
          Alert.alert(
            "Success!",
            `${chapter.name} marked as studied`
          );
        } else {
          setSaveError('Failed to save chapter. Please try again.');
        }
      } catch (error) {
        console.error('Error marking chapter as studied:', error);
        setSaveError('An error occurred. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [chapters, onSave, clerkUser, getToken, currentStudySessionId]
  );

  const handleTopicStudied = useCallback(
    async (topic: TopicType, chapter: ChapterType) => {
      if (!clerkUser?.id) return;
      
      setSaveError(null);
      setIsSaving(true);
      
      try {
        // Get Clerk token for RLS authentication
        const token = await getToken() || undefined;
        
        console.log('Adding topic with user ID:', {
          userId: clerkUser.id,
          chapterId: chapter.id,
          topicId: topic.id,
          topicName: topic.name
        });
        
        // Update in Supabase
        const result = await updateTopicStudyStatus(
          clerkUser.id,
          chapter.id,
          topic.id,
          topic.name,
          true,
          token // Pass token to authenticate the request
        );
        
        console.log('Topic study status update result:', result);
        
        if (result.success) {
          // Update local state
          const parentChapterInfo = chapter ? ` from ${chapter.name}` : '';
          const topicDisplay = `${topic.name}${parentChapterInfo}`;
          
          if (!chapters.includes(topicDisplay)) {
            const updatedChapters = [...chapters, topicDisplay];
            setChapters(updatedChapters);
            onSave(updatedChapters);
            
            // Add to studied topics
            const updatedTopic = { ...topic, isStudied: true, chapter_id: chapter.id };
            setStudiedTopics(prev => ({
              ...prev,
              topics: [...prev.topics, updatedTopic]
            }));
            
            // If we're tracking a study session, update it with this topic
            if (currentStudySessionId) {
              // In a real implementation, we would update the study session with this topic ID
              console.log('Adding topic to study session:', {
                sessionId: currentStudySessionId,
                topicId: topic.id
              });
            }
          }
          // Optionally show a success message
          Alert.alert(
            "Success!",
            `${topic.name} marked as studied`
          );
        } else {
          setSaveError('Failed to save topic. Please try again.');
        }
      } catch (error) {
        console.error('Error marking topic as studied:', error);
        setSaveError('An error occurred. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [chapters, onSave, clerkUser, getToken, currentStudySessionId]
  );

  const handleRemoveChapter = useCallback(
    async (displayText: string) => {
      if (!clerkUser?.id) return;
      
      setSaveError(null);
      setIsSaving(true);
      
      try {
        // Check if this is a chapter or topic entry
        const isChapter = displayText.includes('(');
        
        if (isChapter) {
          // Extract chapter name from display format "Name (Class Level)"
          const nameMatch = displayText.match(/(.*) \((.*)\)/);
          if (!nameMatch) return;
          
          const chapterName = nameMatch[1];
          const classLevel = nameMatch[2];
          
          // Find the chapter in studied chapters
          const chapterToRemove = studiedTopics.chapters.find(
            c => c.name === chapterName && c.class_level === classLevel
          );
          
          if (chapterToRemove) {
            // Get Clerk token for RLS authentication
            const token = await getToken() || undefined;
            
            console.log('Removing chapter with user ID:', {
              userId: clerkUser.id,
              chapterId: chapterToRemove.id,
              chapterName: chapterToRemove.name
            });
            
            // Update in Supabase
            const result = await updateChapterStudyStatus(
              clerkUser.id,
              chapterToRemove.id,
              false,
              token // Pass token to authenticate the request
            );
            
            console.log('Chapter removal status update result:', result);
            
            if (result.success) {
              // Update local state
              const updatedChapters = chapters.filter(c => c !== displayText);
              setChapters(updatedChapters);
              onSave(updatedChapters);
              setStudiedTopics(prev => ({
                ...prev,
                chapters: prev.chapters.filter(c => c.id !== chapterToRemove.id)
              }));
            } else {
              setSaveError('Failed to remove chapter. Please try again.');
            }
          }
        } else {
          // This is a topic entry
          // Format is "Topic Name from Chapter Name"
          const parts = displayText.split(' from ');
          if (parts.length !== 2) return;
          
          const topicName = parts[0];
          const chapterName = parts[1];
          
          // Find the topic in studied topics
          const topicToRemove = studiedTopics.topics.find(
            t => t.name === topicName
          );
          
          if (topicToRemove && topicToRemove.chapter_id) {
            // Get Clerk token for RLS authentication
            const token = await getToken() || undefined;
            
            console.log('Removing topic with user ID:', {
              userId: clerkUser.id,
              topicId: topicToRemove.id,
              topicName: topicToRemove.name
            });
            
            // Find parent chapter
            const parentChapter = subjects
              .flatMap(s => s.chapters)
              .find(c => c.id === topicToRemove.chapter_id);
              
            if (!parentChapter) return;
            
            // Update in Supabase
            const result = await updateTopicStudyStatus(
              clerkUser.id,
              topicToRemove.chapter_id,
              topicToRemove.id,
              topicToRemove.name,
              false,
              token // Pass token to authenticate the request
            );
            
            console.log('Topic removal status update result:', result);
            
            if (result.success) {
              // Update local state
              const updatedChapters = chapters.filter(c => c !== displayText);
              setChapters(updatedChapters);
              onSave(updatedChapters);
              setStudiedTopics(prev => ({
                ...prev,
                topics: prev.topics.filter(t => t.id !== topicToRemove.id)
              }));
            } else {
              setSaveError('Failed to remove topic. Please try again.');
            }
          }
        }
      } catch (error) {
        console.error('Error removing item:', error);
        setSaveError('An error occurred. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [chapters, onSave, studiedTopics, clerkUser, getToken, subjects]
  );

  const handleBack = useCallback(() => {
    if (selectedChapter) {
      // If we're showing topics, go back to chapters
      setSelectedChapter(null);
    } else {
      // If we're showing chapters, go back to subjects
      setSelectedSubject(null);
    }
    setSearchQuery("");
    setSaveError(null);
  }, [selectedChapter, selectedSubject]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    // Reset modal state
    setTimeout(() => {
      setSelectedSubject(null);
      setSelectedChapter(null);
      setSearchQuery("");
      setSaveError(null);
    }, 300); // Wait for animation to complete
  }, []);

  // Memoize filtered chapters and topics
  const filteredChapters = useMemo(() => 
    selectedSubject?.chapters.filter((chapter) =>
      chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !chapter.isStudied
    ),
    [selectedSubject, searchQuery]
  );
  
  const filteredTopics = useMemo(() =>
    selectedChapter?.topics?.filter((topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !topic.isStudied
    ) || [],
    [selectedChapter, searchQuery]
  );

  // Calculate progress percentages - using topicsStudiedCount instead of chapters.length
  const progressPercentage = useMemo(() => 
    Math.min(100, (topicsStudiedCount / TOTAL_GOAL) * 100),
    [topicsStudiedCount]
  );
  
  const questionsPercentage = useMemo(() => 
    Math.min(100, (questionsCompleted / QUESTIONS_GOAL) * 100),
    [questionsCompleted]
  );

  // Memoize the motivational message - using topicsStudiedCount
  const motivationalMessage = useMemo(() => 
    topicsStudiedCount >= TOTAL_GOAL
      ? "Amazing! You've hit your goal for today."
      : `Add ${TOTAL_GOAL - topicsStudiedCount} more topic${TOTAL_GOAL - topicsStudiedCount !== 1 ? 's' : ''} to reach your daily goal.`,
    [topicsStudiedCount]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (loadingError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{loadingError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoadingError(null);
            setLoadingComplete(false);
            setIsLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
              <Text style={styles.progressLabel}>Topics: {topicsStudiedCount}/{TOTAL_GOAL}</Text>
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
              {chapters.map((item, index) => (
                <View key={index} style={styles.topicItem}>
                  <View style={styles.topicContent}>
                    <CheckCircle size={16} color={COLORS.accent} style={styles.topicIcon} />
                    <Text style={styles.topicText}>{item}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveChapter(item)}>
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
              {selectedSubject || selectedChapter ? (
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
                {selectedChapter 
                  ? `Topics in ${selectedChapter.name}` 
                  : selectedSubject 
                    ? selectedSubject.name 
                    : "Select Subject"}
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Error message area */}
            {saveError && (
              <View style={styles.saveErrorContainer}>
                <Text style={styles.saveErrorText}>{saveError}</Text>
              </View>
            )}

            {/* Saving indicator */}
            {isSaving && (
              <View style={styles.savingOverlay}>
                <ActivityIndicator size="small" color={COLORS.accent} />
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            )}

            {/* Search box */}
            {(selectedSubject || selectedChapter) && (
              <View style={styles.searchContainer}>
                <Search size={20} color="#6B7280" />
                <TextInput
                  style={styles.searchInput}
                  placeholder={selectedChapter ? "Search topics..." : "Search chapters..."}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}
            
            {/* Topics list (if chapter selected) */}
            {selectedChapter ? (
              <>
                {/* Complete chapter option */}
                <TouchableOpacity
                  style={styles.completeChapterBtn}
                  onPress={() => handleChapterStudied(selectedChapter)}
                  disabled={isSaving}
                >
                  <CheckCircle size={20} color={COLORS.accent} />
                  <Text style={styles.completeChapterText}>
                    Mark entire chapter as studied
                  </Text>
                </TouchableOpacity>
                
                {/* Topics list */}
                <ScrollView style={styles.modalList}>
                  {filteredTopics && filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                      <TouchableOpacity
                        key={topic.id}
                        style={styles.topicListItem}
                        onPress={() => handleTopicStudied(topic, selectedChapter)}
                        disabled={isSaving}
                      >
                        <View style={styles.topicListItemContent}>
                          <Text style={styles.modalItemText}>{topic.name}</Text>
                        </View>
                        <View
                          style={[
                            styles.subjectIndicator,
                            { backgroundColor: selectedSubject?.color || COLORS.accent },
                          ]}
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.noResults}>
                      <Text style={styles.noResultsText}>
                        {searchQuery 
                          ? "No matching topics found" 
                          : "All topics in this chapter have been studied"}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </>
            ) : selectedSubject ? (
              // Chapters list
              <ScrollView style={styles.modalList}>
                {filteredChapters && filteredChapters.length > 0 ? (
                  filteredChapters.map((chapter) => (
                    <TouchableOpacity
                      key={chapter.id}
                      style={styles.modalItem}
                      onPress={() => handleChapterSelect(chapter)}
                      disabled={isSaving}
                    >
                      <View style={styles.chapterItemContent}>
                        <Text style={styles.modalItemText}>{chapter.name}</Text>
                        <View style={styles.classLevelTag}>
                          <Text style={styles.classLevelText}>{chapter.class_level}</Text>
                        </View>
                      </View>
                      
                      {/* Show dropdown icon if chapter has topics */}
                      {chapter.topics && chapter.topics.length > 0 ? (
                        <ChevronDown size={18} color="#6B7280" style={{marginRight: 8}} />
                      ) : null}
                      
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
            ) : (
              // Subjects list
              <ScrollView style={styles.modalList}>
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <TouchableOpacity
                      key={subject.id}
                      style={styles.subjectItem}
                      onPress={() => handleSubjectSelect(subject)}
                      disabled={isSaving}
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
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>
                      No subjects found for {surveyData.examType || 'your exam type'}. Please check your onboarding survey or try again later.
                    </Text>
                    <Text style={[styles.noResultsText, { marginTop: 8, fontSize: 12 }]}>
                      Exam Type: {surveyData.examType || 'Not set'}{'\n'}
                      Class: {surveyData.currentClass || 'Not set'}{'\n'}
                      Level: {surveyData.preparationLevel || 'Not set'}
                    </Text>
                    <TouchableOpacity 
                      style={[styles.retryButton, { marginTop: 16 }]}
                      onPress={() => {
                        setLoadingComplete(false);
                        setIsLoading(true);
                      }}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.gray,
  },
  errorContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  topicListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  topicListItemContent: {
    flex: 1,
    paddingRight: 8,
  },
  completeChapterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  completeChapterText: {
    color: COLORS.accent,
    fontWeight: '500',
    marginLeft: 8,
  },
  saveErrorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  saveErrorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  savingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
  savingText: {
    fontSize: 14,
    color: COLORS.accent,
    marginLeft: 8,
  },
});

export default ChapterInput;
