import { supabase } from './supabase';
import { getSupabaseWithAuth } from './supabaseAuth';

/**
 * Records a daily login for a user
 * Ensures only one record per day using an upsert operation
 */
export const recordDailyLogin = async (userId: string, token?: string) => {
  try {
    // Set up supabase client with or without token
    const client = token ? await getSupabaseWithAuth(token) : supabase;
    
    // Format today's date to YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await client.from('evt_daily_logins')
      .upsert(
        { 
          user_id: userId, // Pass the ID directly as text
          login_date: today 
        }, 
        { onConflict: 'user_id,login_date' }
      );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording daily login:', error);
    throw error;
  }
};

/**
 * Starts a study session for a user
 * Returns the session ID for further tracking
 */
export const startStudySession = async (
  userId: string, 
  initialTopicIds: string[] = [],
  token?: string
): Promise<string> => {
  try {
    // Set up supabase client with or without token
    const client = token ? await getSupabaseWithAuth(token) : supabase;
    
    // Create a new study session record
    const { data, error } = await client
      .from('evt_study_sessions')
      .insert({
        user_id: userId, // Pass the ID directly as text
        start_time: new Date().toISOString(),
        topic_ids: initialTopicIds
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error starting study session:', error);
    throw error;
  }
};

/**
 * Ends a study session by updating the record with end time and duration
 */
export const endStudySession = async (
  sessionId: string,
  token?: string
): Promise<void> => {
  try {
    // Set up supabase client with or without token
    const client = token ? await getSupabaseWithAuth(token) : supabase;
    
    const endTime = new Date().toISOString();
    
    // Get the start time to calculate duration
    const { data: sessionData, error: fetchError } = await client
      .from('evt_study_sessions')
      .select('start_time')
      .eq('id', sessionId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Calculate duration in seconds
    const startTime = new Date(sessionData.start_time);
    const durationSeconds = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000);
    
    // Update the session record
    const { error: updateError } = await client
      .from('evt_study_sessions')
      .update({
        end_time: endTime,
        duration_seconds: durationSeconds
      })
      .eq('id', sessionId);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error ending study session:', error);
    throw error;
  }
};

/**
 * Updates a topic's mastery level based on recent activity
 * Note: The actual algorithm for determining mastery would be more complex
 */
export const updateTopicMastery = async (
  userId: string,
  topicId: string,
  token?: string
): Promise<void> => {
  try {
    // Set up supabase client with or without token
    const client = token ? await getSupabaseWithAuth(token) : supabase;
    
    console.log(`Would update mastery for user ${userId} on topic ${topicId}`);
    // This is where we would implement the mastery tracking logic
  } catch (error) {
    console.error('Error updating topic mastery:', error);
    throw error;
  }
};

/**
 * Triggers an update of the user's analytics reports
 * This can be called periodically to ensure reports are up-to-date
 * @param userId User ID 
 * @returns Promise indicating success
 */
export const updateUserReports = async (userId: string): Promise<boolean> => {
  try {
    // Trigger stored procedure to update reports
    const { data, error } = await supabase
      .rpc('update_all_reports');

    if (error) {
      console.error('Error updating user reports:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating user reports:', error);
    return false;
  }
}; 