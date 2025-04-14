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
    
    console.log('Recording daily login with auth:', {
      userId,
      hasToken: !!token,
      date: today
    });
    
    // Attempt to insert the record - temporarily removed upsert
    // Note: This might fail if the record already exists, but we want to isolate the UUID error
    const { data, error } = await client.from('evt_daily_logins')
      .insert(
        { 
          user_id: userId, // Pass the ID directly as text
          login_date: today,
          created_at: new Date().toISOString()
        }
      );
    
    if (error) {
      // Check if it's a duplicate key error (expected if record exists)
      if (error.code === '23505') { // 23505 is unique_violation
        console.log('Daily login record already exists for today.');
        return null; // Or return something to indicate success/existence
      } else {
        // If it's not a duplicate error, log and throw the original error
        console.error('Error details for daily login:', {
          error,
          userId,
          date: today
        });
        throw error;
      }
    }
    
    console.log('Successfully recorded daily login');
    return data;
  } catch (error) {
    console.error('Error recording daily login (in catch block):', error);
    throw error; // Re-throw the error
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
        topics_covered: initialTopicIds
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
    // Use the regular supabase client if token has issues
    let client;
    try {
      client = token ? await getSupabaseWithAuth(token) : supabase;
    } catch (tokenError) {
      console.log('Token error in endStudySession, using default client:', tokenError);
      client = supabase;
    }
    
    const endTime = new Date().toISOString();
    
    // Just update the end_time field without trying to calculate duration
    // since the duration_seconds column doesn't exist in the schema
    try {
      const { error: updateError } = await client
        .from('evt_study_sessions')
        .update({
          end_time: endTime
        })
        .eq('id', sessionId);
      
      if (updateError) {
        console.log('Error updating session end time:', updateError);
      } else {
        console.log('Successfully ended study session:', sessionId);
      }
    } catch (innerError) {
      console.log('Error in endStudySession:', innerError);
    }
  } catch (error) {
    // Log error but don't throw it outside
    console.error('Error ending study session (contained):', error);
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
 * @param userId User ID (not directly passed to RPC but used for logging)
 * @returns Promise indicating success
 */
export const updateUserReports = async (userId: string, token?: string): Promise<boolean> => {
  try {
    // Use the authenticated client if token is provided
    // This ensures auth.uid() will return the correct user in the stored procedure
    let client;
    try {
      console.log('Setting up authenticated client for reports update');
      client = token ? await getSupabaseWithAuth(token) : supabase;
    } catch (tokenError) {
      console.error('Error setting up authenticated client:', tokenError);
      client = supabase;
    }
    
    console.log('Calling update_all_reports RPC');
    
    // Call update_all_reports without parameters - it uses auth.uid() internally
    const { data, error } = await client.rpc('update_all_reports');

    if (error) {
      console.error('Error updating user reports:', error);
      // Don't throw the error, just return false to prevent cascading errors
      return false;
    }

    console.log('Successfully updated reports for user:', userId);
    return true;
  } catch (error) {
    console.error('Exception updating user reports:', error);
    // Returning false instead of throwing to prevent cascading errors
    return false;
  }
};

/**
 * Updates an existing study session with additional topic IDs
 */
export const updateStudySessionTopics = async (
  sessionId: string,
  topicIds: string[],
  token?: string
): Promise<void> => {
  try {
    // Use the regular supabase client if token has issues
    let client;
    try {
      client = token ? await getSupabaseWithAuth(token) : supabase;
    } catch (tokenError) {
      console.log('Token error in updateStudySessionTopics, using default client:', tokenError);
      client = supabase;
    }

    // First get the current topics_covered array
    const { data: sessionData, error: fetchError } = await client
      .from('evt_study_sessions')
      .select('topics_covered')
      .eq('id', sessionId)
      .single();
    
    if (fetchError) {
      console.log('Could not fetch session data:', fetchError);
      return;
    }
    
    // Combine existing topics with new ones, removing duplicates
    const existingTopics = sessionData.topics_covered || [];
    const allTopics = [...new Set([...existingTopics, ...topicIds])];
    
    // Update the session with the combined topics
    const { error: updateError } = await client
      .from('evt_study_sessions')
      .update({
        topics_covered: allTopics
      })
      .eq('id', sessionId);
    
    if (updateError) {
      console.log('Error updating session topics:', updateError);
    } else {
      console.log('Successfully updated study session topics:', {
        sessionId,
        topicCount: allTopics.length
      });
    }
  } catch (error) {
    console.error('Error updating study session topics:', error);
  }
};

// Default export to satisfy Expo Router's requirement
export default {
  recordDailyLogin,
  startStudySession,
  endStudySession,
  updateTopicMastery,
  updateUserReports,
  updateStudySessionTopics,
  isRouteComponent: false
}; 