import { supabase } from './supabase';
import { getSupabaseWithAuth } from './supabaseAuth';

/**
 * Checks if the user has already completed the initial evaluation
 * @param userId The user's ID
 * @param authToken The user's auth token from Clerk
 * @returns Promise with boolean indicating if the evaluation is completed
 */
export const hasCompletedEvaluation = async (
  userId: string,
  authToken?: string
): Promise<boolean> => {
  try {
    // Use authenticated client if token is provided
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    // Check user_profiles table for evaluation_completed flag
    const { data, error } = await client
      .from('user_profiles')
      .select('evaluation_completed')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking evaluation status:', error);
      return false;
    }
    
    return data?.evaluation_completed || false;
  } catch (error) {
    console.error('Error checking if evaluation completed:', error);
    return false;
  }
};

/**
 * Fetches questions for the initial evaluation
 * Selects up to 15 questions based on studied topics
 * @param userId The user's ID
 * @param authToken The user's auth token from Clerk
 * @returns Promise with array of questions
 */
export const fetchEvaluationQuestions = async (
  userId: string,
  authToken?: string
) => {
  try {
    // Use authenticated client if token is provided
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    // First get the user's studied topics
    const { data: studiedTopics, error: topicsError } = await client
      .from('user_studied_topics')
      .select('topic_id, chapter_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (topicsError) {
      console.error('Error fetching studied topics:', topicsError);
      return [];
    }
    
    if (!studiedTopics || studiedTopics.length === 0) {
      console.log('No studied topics found for user:', userId);
      return [];
    }
    
    // Extract unique topic and chapter IDs
    const topicIds = studiedTopics
      .filter(item => item.topic_id)
      .map(item => item.topic_id);
      
    const chapterIds = studiedTopics
      .filter(item => !item.topic_id && item.chapter_id)
      .map(item => item.chapter_id);
    
    // Prepare query for questions based on topics
    let query = client
      .from('questions')
      .select('id, text, options, answer, explanation, difficulty, topic_id, chapter_id')
      .order('importance', { ascending: false });
    
    // If we have topics, prioritize those first
    if (topicIds.length > 0) {
      query = query.in('topic_id', topicIds);
    } else if (chapterIds.length > 0) {
      // Fallback to chapters if no specific topics
      query = query.in('chapter_id', chapterIds);
    } else {
      return []; // No topics or chapters found
    }
    
    // Limit results and fetch
    const { data: allQuestions, error: questionsError } = await query.limit(50);
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return [];
    }
    
    if (!allQuestions || allQuestions.length === 0) {
      console.log('No questions found for topics/chapters');
      return [];
    }
    
    // Process to ensure max 2 questions per topic
    const selectedQuestions = [];
    const topicQuestionCount = new Map();
    
    // First pass - get up to 2 questions per topic based on importance
    for (const question of allQuestions) {
      const topicKey = question.topic_id || `chapter_${question.chapter_id}`;
      const currentCount = topicQuestionCount.get(topicKey) || 0;
      
      if (currentCount < 2) {
        selectedQuestions.push(question);
        topicQuestionCount.set(topicKey, currentCount + 1);
        
        // Break if we have 15 questions
        if (selectedQuestions.length >= 15) {
          break;
        }
      }
    }
    
    // Shuffle the questions to randomize order
    return selectedQuestions.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error fetching evaluation questions:', error);
    return [];
  }
};

/**
 * Saves an evaluation attempt
 * @param userId The user's ID
 * @param questionId The question ID
 * @param isCorrect Whether the answer was correct
 * @param selectedOption The option selected by the user
 * @param timeSpent Time spent on the question in seconds
 * @param authToken The user's auth token from Clerk
 * @returns Promise with success status
 */
export const saveEvaluationAttempt = async (
  userId: string,
  questionId: string,
  isCorrect: boolean,
  selectedOption: string,
  timeSpent: number,
  authToken?: string
): Promise<boolean> => {
  try {
    // Use authenticated client if token is provided
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    // Save attempt to evt_question_attempts table
    const { error } = await client
      .from('evt_question_attempts')
      .insert({
        user_id: userId,
        question_id: questionId,
        is_correct: isCorrect,
        selected_option: selectedOption,
        time_spent_seconds: timeSpent,
        attempt_type: 'evaluation',
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving evaluation attempt:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving evaluation attempt:', error);
    return false;
  }
};

/**
 * Marks the evaluation as completed for a user
 * @param userId The user's ID
 * @param authToken The user's auth token from Clerk
 * @returns Promise with success status
 */
export const markEvaluationCompleted = async (
  userId: string,
  authToken?: string
): Promise<boolean> => {
  try {
    // Use authenticated client if token is provided
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    // Update user_profiles table to mark evaluation as completed
    const { error } = await client
      .from('user_profiles')
      .update({ 
        evaluation_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error marking evaluation as completed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error marking evaluation as completed:', error);
    return false;
  }
};

// Default export to satisfy Expo Router's requirement
export default {
  hasCompletedEvaluation,
  fetchEvaluationQuestions,
  saveEvaluationAttempt,
  markEvaluationCompleted,
  isRouteComponent: false
}; 