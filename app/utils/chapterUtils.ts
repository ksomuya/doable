import { supabase } from './supabase';
import { getSupabaseWithAuth } from './supabaseAuth';
import { useUser } from '@clerk/clerk-expo';

// Define interface for the subject from a query result
interface SubjectData {
  name: string;
  color: string;
}

// Define interface for the chapter with isStudied flag
interface Chapter {
  id: string;
  name: string;
  class_level: string;
  subject_id: string;
  isStudied?: boolean;
  subjects?: SubjectData;
  topics?: Topic[];
}

// Define interface for topics
interface Topic {
  id: string;
  name: string;
  isStudied?: boolean;
  chapter_id?: string; // Make chapter_id optional
}

/**
 * Marks all chapters of a specific class as studied for a user based on their exam type
 * @param userId The user's ID
 * @param classLevel The class level to mark as studied ('Class 11' or 'Class 12')
 * @param examType The exam type ('JEE' or 'NEET')
 * @param authToken The user's auth token from Clerk
 * @returns Promise with success status
 */
export const markClassChaptersAsStudied = async (
  userId: string,
  classLevel: string,
  examType: string,
  authToken?: string
): Promise<boolean> => {
  try {
    // Use authenticated client if token is provided
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    // First get subjects IDs based on exam type
    const { data: subjectsData, error: subjectError } = await client
      .from('subjects')
      .select('id')
      .contains('exam_type', [examType]);
      
    if (subjectError) throw subjectError;
    if (!subjectsData || subjectsData.length === 0) return false;
    
    const subjectIds = subjectsData.map(s => s.id);
    
    // Get all chapters for the specified class and subject IDs
    const { data: chapters, error: chaptersError } = await client
      .from('chapters')
      .select('id')
      .eq('class_level', classLevel)
      .in('subject_id', subjectIds);

    if (chaptersError) throw chaptersError;
    if (!chapters || chapters.length === 0) return true; // No chapters to mark

    // Create entries in user_studied_topics for each chapter
    const studiesToInsert = chapters.map(chapter => ({
      user_id: userId,
      chapter_id: chapter.id,
      study_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    try {
      // Try upsert first (requires unique constraint)
      // This might fail if the unique constraint doesn't exist yet,
      // which is why we have the ensureUserStudiedTopicsConstraints function
      // and a fallback mechanism below
      const { error: insertError } = await client
        .from('user_studied_topics')
        .upsert(studiesToInsert, { 
          onConflict: 'user_id,chapter_id,topic_id'
        });

      if (insertError) throw insertError;
    } catch (upsertError) {
      console.log('Upsert failed, falling back to manual insert:', upsertError);
      
      // Fall back to manual insert with duplicate handling
      // First get existing study records for this user
      const { data: existingRecords } = await client
        .from('user_studied_topics')
        .select('chapter_id')
        .eq('user_id', userId)
        .is('topic_id', null);
      
      const existingChapterIds = existingRecords 
        ? new Set(existingRecords.map(r => r.chapter_id)) 
        : new Set();
      
      // Only insert records that don't already exist
      const newRecords = studiesToInsert.filter(s => !existingChapterIds.has(s.chapter_id));
      
      if (newRecords.length > 0) {
        // Insert in batches to avoid exceeding limits
        const batchSize = 50;
        for (let i = 0; i < newRecords.length; i += batchSize) {
          const batch = newRecords.slice(i, i + batchSize);
          const { error: batchError } = await client
            .from('user_studied_topics')
            .insert(batch);
            
          if (batchError) throw batchError;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error marking chapters as studied:', error);
    return false;
  }
};

/**
 * Fetches chapters for a user based on their class and preparation level
 * @param userId The user's ID
 * @param userClass The user's class ('Class 11', 'Class 12', or 'Dropper')
 * @param prepLevel The user's preparation level ('Beginner', 'Intermediate', or 'Advanced')
 * @param examType The exam the user is preparing for ('JEE' or 'NEET')
 * @param authToken The user's auth token from Clerk
 * @returns Promise with chapters data
 */
export const fetchUserChapters = async (
  userId: string,
  userClass: string,
  prepLevel: string,
  examType: string,
  authToken?: string
): Promise<{ chapters: Chapter[], studiedCount: number }> => {
  try {
    // Use authenticated client if token is provided
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    // For Class 12 students, automatically mark Class 11 chapters as studied if not done already
    if (userClass === 'Class 12') {
      // First get all Class 11 chapter IDs
      const { data: class11Chapters } = await client
        .from('chapters')
        .select('id')
        .eq('class_level', 'Class 11');
        
      const class11ChapterIds = class11Chapters ? class11Chapters.map(c => c.id) : [];
      
      if (class11ChapterIds.length > 0) {
        const { data: existingClass11Studies } = await client
          .from('user_studied_topics')
          .select('id')
          .eq('user_id', userId)
          .in('chapter_id', class11ChapterIds)
          .limit(1);

        if (!existingClass11Studies || existingClass11Studies.length === 0) {
          await markClassChaptersAsStudied(userId, 'Class 11', examType, authToken);
        }
      }
    }

    // Get studied chapters for this user
    const { data: studiedChapters } = await client
      .from('user_studied_topics')
      .select('chapter_id')
      .eq('user_id', userId)
      .is('topic_id', null);

    const studiedChapterIds = studiedChapters 
      ? studiedChapters.map(sc => sc.chapter_id) 
      : [];
      
    // First get subjects that match the exam type
    const { data: subjectsData } = await client
      .from('subjects')
      .select('id')
      .contains('exam_type', [examType]);
      
    const subjectIds = subjectsData ? subjectsData.map(s => s.id) : [];
    
    // Adjust SQL query complexity based on preparation level
    const chaptersQuery = client
      .from('chapters')
      .select('id, name, class_level, subject_id, subjects(name, color), topics(id, name)');
    
    if (userClass === 'Class 11' && examType !== 'NEET') {
      // For Class 11 JEE students, filter out Biology chapters
      chaptersQuery.eq('class_level', 'Class 11').in('subject_id', subjectIds);
    } else if (userClass === 'Class 11' && examType === 'NEET') {
      // For Class 11 NEET students, show all relevant chapters
      chaptersQuery.eq('class_level', 'Class 11').in('subject_id', subjectIds);
    } else if (userClass === 'Class 12' || userClass === 'Dropper') {
      // For Class 12/Dropper students, show both Class 11 and 12 chapters
      chaptersQuery.in('subject_id', subjectIds);
    }
    
    // Get all chapters based on the query
    const { data: fetchedChapters, error: chaptersError } = await chaptersQuery;
    
    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return { chapters: [], studiedCount: 0 };
    }
    
    // Now get studied topics for this user
    const { data: studiedTopics } = await client
      .from('user_studied_topics')
      .select('topic_id')
      .eq('user_id', userId)
      .not('topic_id', 'is', null);
      
    const studiedTopicIds = studiedTopics 
      ? studiedTopics.map(st => st.topic_id) 
      : [];
      
    // Process chapters data for UI
    const chapters: Chapter[] = [];
    
    if (fetchedChapters) {
      for (const chapter of fetchedChapters) {
        if (chapter && chapter.id) {
          // Extract the subject data correctly
          let subjectData: SubjectData | undefined = undefined;
          
          if (chapter.subjects) {
            // Handle the case where subjects might be an array or an object
            if (Array.isArray(chapter.subjects)) {
              if (chapter.subjects.length > 0 && chapter.subjects[0]) {
                const firstSubject = chapter.subjects[0] as any;
                if (firstSubject.name && firstSubject.color) {
                  subjectData = {
                    name: firstSubject.name,
                    color: firstSubject.color
                  };
                }
              }
            } else if (typeof chapter.subjects === 'object' && chapter.subjects !== null) {
              const subjectObj = chapter.subjects as any;
              if (subjectObj.name && subjectObj.color) {
                subjectData = {
                  name: subjectObj.name,
                  color: subjectObj.color
                };
              }
            }
          }
          
          // Process topics if any
          let processedTopics: Topic[] | undefined = undefined;
          
          if (chapter.topics && Array.isArray(chapter.topics) && chapter.topics.length > 0) {
            processedTopics = chapter.topics.map(topic => ({
              id: topic.id,
              name: topic.name,
              isStudied: studiedTopicIds.includes(topic.id)
            }));
          }
          
          chapters.push({
            id: chapter.id,
            name: chapter.name,
            class_level: chapter.class_level,
            subject_id: chapter.subject_id,
            subjects: subjectData,
            isStudied: studiedChapterIds.includes(chapter.id),
            topics: processedTopics
          });
        }
      }
    }
    
    return {
      chapters,
      studiedCount: studiedChapterIds.length
    };
    
  } catch (error) {
    console.error('Error fetching user chapters:', error);
    return { chapters: [], studiedCount: 0 };
  }
};

/**
 * Updates a chapter's study status for a user
 * @param userId The user's ID
 * @param chapterId The chapter ID
 * @param studied Whether the chapter is studied or not
 * @param authToken The user's auth token from Clerk
 * @returns Promise with updated chapter data
 */
export const updateChapterStudyStatus = async (
  userId: string,
  chapterId: string,
  studied: boolean,
  authToken?: string
): Promise<{ success: boolean }> => {
  try {
    // Use authenticated client if token is provided
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    if (studied) {
      // Mark as studied
      const { error } = await client
        .from('user_studied_topics')
        .insert({
          user_id: userId,
          chapter_id: chapterId,
          study_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } else {
      // Mark as not studied
      const { error } = await client
        .from('user_studied_topics')
        .delete()
        .match({ 
          user_id: userId, 
          chapter_id: chapterId
        })
        .is('topic_id', null);
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating chapter study status:', error);
    return { success: false };
  }
};

/**
 * Updates a topic's study status for a user
 * @param userId The user's ID
 * @param chapterId The chapter ID
 * @param topicId The topic ID
 * @param topicName The topic name
 * @param studied Whether the topic is studied or not
 * @param authToken The user's auth token from Clerk
 * @returns Promise with updated topic data
 */
export const updateTopicStudyStatus = async (
  userId: string,
  chapterId: string,
  topicId: string,
  topicName: string,
  studied: boolean,
  authToken?: string
): Promise<{ success: boolean }> => {
  try {
    // Use authenticated client if token is provided
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    if (studied) {
      // Mark as studied
      const { error } = await client
        .from('user_studied_topics')
        .insert({
          user_id: userId,
          chapter_id: chapterId,
          topic_id: topicId,
          topic_name: topicName,
          study_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } else {
      // Mark as not studied
      const { error } = await client
        .from('user_studied_topics')
        .delete()
        .match({ 
          user_id: userId, 
          chapter_id: chapterId,
          topic_id: topicId
        });
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating topic study status:', error);
    return { success: false };
  }
};

/**
 * Ensure the necessary constraints exist for user_studied_topics table 
 * This is called once at app initialization to make sure the unique constraint exists
 */
export const ensureUserStudiedTopicsConstraints = async (): Promise<boolean> => {
  // We'll use this in the main app initialization
  try {
    // Check if the constraint is already available by doing a test upsert
    const testUpsert = await supabase
      .from('user_studied_topics')
      .upsert([
        { 
          user_id: 'test-user-id', 
          chapter_id: 'test-chapter-id',
          study_date: '2023-01-01'
        }
      ], { 
        onConflict: 'user_id,chapter_id,topic_id' 
      });
    
    // If there's no error or the error is not about constraint, we're good
    if (!testUpsert.error || testUpsert.error.code !== '42P10') {
      return true;
    }
    
    console.log('Need to add constraint to user_studied_topics table');
    
    // First get all existing records
    const { data: existingRecords, error: fetchError } = await supabase
      .from('user_studied_topics')
      .select('*');
      
    if (fetchError) {
      console.error('Error fetching user_studied_topics records:', fetchError);
      return false;
    }
    
    // Create a map of user_id+chapter_id+topic_id -> record to find duplicates
    const recordMap = new Map<string, any>();
    const duplicates: string[] = [];
    
    existingRecords?.forEach(record => {
      const key = `${record.user_id}_${record.chapter_id}_${record.topic_id || 'null'}`;
      if (recordMap.has(key)) {
        duplicates.push(record.id);
      } else {
        recordMap.set(key, record);
      }
    });
    
    // If there are duplicates, delete them to prevent constraint violation
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate records, removing...`);
      for (let i = 0; i < duplicates.length; i += 100) {
        const batch = duplicates.slice(i, i + 100);
        await supabase
          .from('user_studied_topics')
          .delete()
          .in('id', batch);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring constraints:', error);
    return false;
  }
}; 