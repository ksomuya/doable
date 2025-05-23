import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { getSupabaseWithAuth } from '../utils/supabaseAuth';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ChevronRight } from 'lucide-react-native';

type Subject = {
  id: string;
  name: string;
  color: string;
  exam_type: string[];
  chapters: Chapter[];
};

type Chapter = {
  id: string;
  name: string;
  class: string[];
  isSelected: boolean;
};

type OnboardingData = {
  exam_type: string;
  current_class: string;
  preparation_level: string;
};

interface StudyProgressSelectionProps {
  onComplete: () => void;
}

const StudyProgressSelection: React.FC<StudyProgressSelectionProps> = ({ onComplete }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  
  const { user } = useUser();
  const { getToken } = useAuth();
  
  // Add refs to track initialization state and store the authenticated client
  const dataFetchedRef = useRef(false);
  const supabaseClientRef = useRef<any>(null);
  
  useEffect(() => {
    // Prevent multiple fetches on re-renders
    if (dataFetchedRef.current) return;
    
    const initializeData = async () => {
      if (!user) return;
      dataFetchedRef.current = true;

      try {
        // Get token and create authenticated client once
        const token = await getToken({ template: "supabase" });
        if (!token) {
          console.error('Could not get authentication token');
          setLoading(false);
          return;
        }
        
        // Store the client for reuse
        supabaseClientRef.current = await getSupabaseWithAuth(token);
        
        // Fetch onboarding data
        const onboardingResult = await fetchOnboardingData();
        if (onboardingResult) {
          await fetchSubjectsAndChapters();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  // No dependency on onboardingData anymore - we'll call this internally
  useEffect(() => {
    if (onboardingData) {
      filterChaptersByClass(subjects);
    }
  }, [onboardingData, subjects, showAllChapters]);

  const fetchOnboardingData = async () => {
    if (!user || !supabaseClientRef.current) return false;

    try {
      // Use the stored client
      const supabaseWithAuth = supabaseClientRef.current;
      
      // Get user's onboarding data
      const { data, error } = await supabaseWithAuth
        .from('onboarding_surveys')
        .select('exam_type, current_class, preparation_level')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching onboarding data:', error);
        return false;
      }

      if (data) {
        setOnboardingData({
          exam_type: data.exam_type,
          current_class: data.current_class,
          preparation_level: data.preparation_level
        });
        
        // If user is advanced level, show all chapters
        if (data.preparation_level === 'Advanced') {
          setShowAllChapters(true);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in fetchOnboardingData:', error);
      return false;
    }
  };

  const fetchSubjectsAndChapters = async () => {
    if (!onboardingData || !supabaseClientRef.current) return;

    try {
      setLoading(true);
      
      // Get subjects based on exam type (JEE or NEET)
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .contains('exam_type', [onboardingData.exam_type])
        .order('name');

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
        setLoading(false);
        return;
      }

      // Get chapters from all relevant subjects
      const subjectIds = subjectsData.map(subject => subject.id);
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .in('subject_id', subjectIds)
        .order('name');

      if (chaptersError) {
        console.error('Error fetching chapters:', chaptersError);
        setLoading(false);
        return;
      }

      // Check which chapters the user has already studied
      let studiedChapters: string[] = [];
      
      if (user) {
        try {
          // Use the stored authenticated client
          const supabaseWithAuth = supabaseClientRef.current;
          const { data: userChapters, error: userChaptersError } = await supabaseWithAuth
            .from('user_studied_chapters')
            .select('chapter_id')
            .eq('user_id', user.id);
              
          if (!userChaptersError && userChapters) {
            studiedChapters = userChapters.map(item => item.chapter_id);
          }
        } catch (err) {
          console.error('Error fetching user studied chapters:', err);
        }
      }

      // If user is in Class 12, automatically mark all Class 11 chapters as studied
      const isClass12 = onboardingData.current_class === 'Class 12';
      const isTopper = onboardingData.preparation_level === 'Advanced';

      // Define default colors for subjects
      const subjectColors: Record<string, string> = {
        'Physics': '#4F46E5', // blue
        'Chemistry': '#10B981', // green 
        'Biology': '#F97316', // orange
        'Mathematics': '#8B5CF6', // purple
      };

      // Structure data with subjects containing their chapters
      const formattedSubjects = subjectsData.map(subject => {
        const subjectChapters = chaptersData
          .filter(chapter => chapter.subject_id === subject.id)
          .map(chapter => {
            // For Class 12 users, auto-mark Class 11 chapters as selected
            const isClass11Chapter = chapter.class && chapter.class.includes('Class 11');
            const shouldAutoSelect = isClass12 && isClass11Chapter;
            
            return {
              id: chapter.id,
              name: chapter.name,
              class: chapter.class || [],
              isSelected: studiedChapters.includes(chapter.id) || shouldAutoSelect
            };
          });
          
        return {
          id: subject.id,
          name: subject.name,
          color: subjectColors[subject.name] || '#333333', // Use default color mapping instead of database value
          exam_type: subject.exam_type || [],
          chapters: subjectChapters
        };
      });

      setSubjects(formattedSubjects);
      
      // Filter subjects/chapters based on user's class
      filterChaptersByClass(formattedSubjects);

    } catch (error) {
      console.error('Error in fetchSubjectsAndChapters:', error);
      Alert.alert('Error', 'Failed to load subjects and chapters');
    } finally {
      setLoading(false);
    }
  };

  // Filter chapters by class
  const filterChaptersByClass = (subjectsToFilter: Subject[]) => {
    if (!onboardingData) return;

    const userClass = onboardingData.current_class;
    const isTopper = onboardingData.preparation_level === 'Advanced';

    // If user is a topper or we want to show all chapters, don't filter
    if (isTopper || showAllChapters) {
      setFilteredSubjects(subjectsToFilter);
      return;
    }

    // Filter chapters by class
    const filtered = subjectsToFilter.map(subject => {
      const filteredChapters = subject.chapters.filter(chapter => 
        chapter.class.includes(userClass)
      );

      return {
        ...subject,
        chapters: filteredChapters
      };
    }).filter(subject => subject.chapters.length > 0); // Only include subjects with chapters

    setFilteredSubjects(filtered);
  };

  // Toggle showing all chapters vs current class only
  const toggleShowAllChapters = () => {
    setShowAllChapters(!showAllChapters);
    filterChaptersByClass(subjects);
  };

  // Check if all current class chapters are selected
  const areAllCurrentClassChaptersSelected = () => {
    if (!onboardingData) return false;
    
    const userClass = onboardingData.current_class;
    
    // Get all chapters for current class
    const currentClassChapters = subjects.flatMap(subject => 
      subject.chapters.filter(chapter => chapter.class.includes(userClass))
    );
    
    // Return true if all are selected or if there are no chapters
    return currentClassChapters.length > 0 && 
           currentClassChapters.every(chapter => chapter.isSelected);
  };

  const toggleChapterSelection = (chapterId: string) => {
    setSubjects(prevSubjects => {
      const updatedSubjects = prevSubjects.map(subject => {
        const updatedChapters = subject.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return { ...chapter, isSelected: !chapter.isSelected };
          }
          return chapter;
        });
        return { ...subject, chapters: updatedChapters };
      });
      
      // After updating selection, check if all current class chapters are selected
      const allCurrentSelected = areAllCurrentClassChaptersSelected();
      
      // If Class 11 user has finished all chapters, show Class 12 content
      if (allCurrentSelected && !showAllChapters && 
          onboardingData?.current_class === 'Class 11') {
        setShowAllChapters(true);
        // Update filtered subjects to include all chapters
        filterChaptersByClass(updatedSubjects);
      } else {
        // Just update filtered list with current filter settings
        filterChaptersByClass(updatedSubjects);
      }
      
      return updatedSubjects;
    });
  };

  const saveStudiedChapters = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save your progress');
      return;
    }

    try {
      setSaving(true);
      
      // Get selected chapters from all subjects (not just filtered ones)
      const selectedChapterIds = subjects.flatMap(subject => 
        subject.chapters.filter(chapter => chapter.isSelected).map(chapter => chapter.id)
      );

      console.log('Selected chapter IDs:', selectedChapterIds);
      
      // Check if we have a stored client, if not, create one
      if (!supabaseClientRef.current) {
        const token = await getToken({ template: "supabase" });
        if (!token) {
          throw new Error('Could not get authentication token');
        }
        supabaseClientRef.current = await getSupabaseWithAuth(token);
      }
      
      // Use the stored authenticated client
      const supabaseWithAuth = supabaseClientRef.current;
      
      console.log('Deleting existing user studied chapters');
      
      // Delete existing entries
      const { error: deleteError } = await supabaseWithAuth
        .from('user_studied_chapters')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) {
        console.error('Error deleting existing records:', deleteError);
        Alert.alert('Error', 'Failed to update your study progress');
        return false;
      }
      
      console.log('Existing entries deleted successfully');
        
      // Only insert if there are selected chapters
      if (selectedChapterIds.length > 0) {
        // Create records for insertion
        const chaptersToInsert = selectedChapterIds.map(chapterId => ({
          user_id: user.id,
          chapter_id: chapterId,
          study_date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
        }));
        
        console.log('Inserting new records:', chaptersToInsert);
        
        // Insert records - use RPC call instead of direct insert for better reliability
        const { data, error } = await supabaseWithAuth
          .from('user_studied_chapters')
          .insert(chaptersToInsert)
          .select();
          
        if (error) {
          console.error('Error saving studied chapters:', error);
          Alert.alert('Error', 'Failed to save your study progress');
          return false;
        }
        
        console.log('Saved successfully:', data);
      } else {
        console.log('No chapters selected to insert');
      }
      
      // Update user's is_profile_setup to true
      const { error: updateError } = await supabaseWithAuth
        .from('users')
        .update({ is_profile_setup: true })
        .eq('id', user.id);
        
      if (updateError) {
        console.error('Error updating profile setup status:', updateError);
        // Continue anyway as the main operation succeeded
      }
      
      Alert.alert('Success', 'Your study progress has been saved!');
      onComplete();
      return true;
    } catch (error) {
      console.error('Error in saveStudiedChapters:', error);
      Alert.alert('Error', 'Failed to save your study progress');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const nextSubject = () => {
    if (currentSubjectIndex < filteredSubjects.length - 1) {
      setCurrentSubjectIndex(currentSubjectIndex + 1);
    } else {
      saveStudiedChapters();
    }
  };

  const prevSubject = () => {
    if (currentSubjectIndex > 0) {
      setCurrentSubjectIndex(currentSubjectIndex - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED7930" />
        <Text style={styles.loadingText}>Loading subjects and chapters...</Text>
      </View>
    );
  }

  if (!onboardingData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Missing onboarding data. Please complete onboarding first.</Text>
      </View>
    );
  }

  const currentSubject = filteredSubjects[currentSubjectIndex];
  const isLastSubject = currentSubjectIndex === filteredSubjects.length - 1;
  
  // Show a message if no subjects were found for the current filter
  if (filteredSubjects.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Study Progress</Text>
        
        <View style={styles.noSubjectsContainer}>
          <Text style={styles.noSubjectsText}>
            No chapters found for {onboardingData.current_class} {onboardingData.exam_type}.
          </Text>
          
          {!showAllChapters && (
            <TouchableOpacity
              style={[styles.navigationButton, styles.primaryButton]}
              onPress={toggleShowAllChapters}
            >
              <Text style={styles.primaryButtonText}>Show All Chapters</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.navigationButton, styles.secondaryButton, { marginTop: 12 }]}
            onPress={onComplete}
          >
            <Text style={styles.secondaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What have you studied so far?</Text>
        <Text style={styles.subtitle}>
          {onboardingData.current_class} - {onboardingData.exam_type}
        </Text>
        
        {/* Toggle to show all chapters vs current class only */}
        {onboardingData.preparation_level !== 'Advanced' && ( // Only show toggle if not a topper
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleShowAllChapters}
          >
            <Text style={styles.toggleButtonText}>
              {showAllChapters ? "Show Only My Class" : "Show All Classes"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Subject tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectTabs}>
        {filteredSubjects.map((subject, index) => (
          <TouchableOpacity
            key={subject.id}
            style={[
              styles.subjectTab,
              { backgroundColor: subject.color + '20' }, // 20% opacity version of the color
              currentSubjectIndex === index && { backgroundColor: subject.color + '40' }
            ]}
            onPress={() => setCurrentSubjectIndex(index)}
          >
            <Text
              style={[
                styles.subjectTabText,
                { color: subject.color },
                currentSubjectIndex === index && styles.subjectTabTextActive
              ]}
            >
              {subject.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Chapters list */}
      <ScrollView style={styles.chaptersContainer}>
        {currentSubject?.chapters.map(chapter => (
          <TouchableOpacity
            key={chapter.id}
            style={[
              styles.chapterItem,
              chapter.isSelected && [
                styles.chapterItemSelected,
                { borderColor: currentSubject.color }
              ]
            ]}
            onPress={() => toggleChapterSelection(chapter.id)}
          >
            <View style={styles.chapterHeader}>
              <Text
                style={[
                  styles.chapterText,
                  chapter.isSelected && [
                    styles.chapterTextSelected,
                    { color: currentSubject.color }
                  ]
                ]}
              >
                {chapter.name}
              </Text>
              <Text style={styles.chapterClass}>
                {chapter.class.join(', ')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Navigation buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navigationButton, currentSubjectIndex === 0 && styles.navigationButtonDisabled]}
          onPress={prevSubject}
          disabled={currentSubjectIndex === 0}
        >
          <Text style={styles.navigationButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navigationButton, styles.primaryButton, saving && styles.savingButton]}
          onPress={nextSubject}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>
                {isLastSubject ? 'Save Progress' : 'Next Subject'}
              </Text>
              <ChevronRight color="#FFF" size={18} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#555',
  },
  subjectTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  subjectTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  subjectTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subjectTabTextActive: {
    fontWeight: '700',
  },
  chaptersContainer: {
    flex: 1,
  },
  chapterItem: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterItemSelected: {
    backgroundColor: '#FFF',
  },
  chapterText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  chapterClass: {
    fontSize: 12,
    color: '#888',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chapterTextSelected: {
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  navigationButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  navigationButtonDisabled: {
    opacity: 0.5,
  },
  navigationButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#ED7930',
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  savingButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginRight: 4,
  },
  noSubjectsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSubjectsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default StudyProgressSelection; 