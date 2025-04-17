import { supabase } from './supabase';
import { getSupabaseWithAuth } from './supabaseAuth';
import { PracticeType, PracticeStats, PracticeUnlock, Subject } from './types';

/**
 * Fetches available subjects for a user
 * @param userId The user's ID
 * @param examType The exam type ('JEE' or 'NEET')
 * @param authToken The user's auth token
 * @returns Promise with subjects data and their unlock status
 */
export const getAvailableSubjects = async (
  userId: string,
  examType: string,
  authToken?: string
) => {
  try {
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    const { data, error } = await client.rpc('get_available_subjects', {
      p_user_id: userId,
      p_exam_id: examType
    });
    
    if (error) {
      console.error('Error fetching available subjects:', error);
      return { subjects: [], error: error.message };
    }
    
    return { subjects: data || [], error: null };
  } catch (error: any) {
    console.error('Exception fetching available subjects:', error);
    return { subjects: [], error: error.message };
  }
};

/**
 * Fetches user's practice stats
 * @param userId The user's ID
 * @param authToken The user's auth token
 * @returns Promise with practice stats
 */
export const getUserPracticeStats = async (
  userId: string,
  authToken?: string
) => {
  try {
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    const { data, error } = await client
      .from('user_practice_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user practice stats:', error);
      return { 
        stats: { recall_attempts: 0, refine_attempts: 0, conquer_attempts: 0 }, 
        error: error.message 
      };
    }
    
    // If no record exists yet, return default values
    if (!data) {
      return { 
        stats: { recall_attempts: 0, refine_attempts: 0, conquer_attempts: 0 }, 
        error: null 
      };
    }
    
    return { stats: data, error: null };
  } catch (error: any) {
    console.error('Exception fetching user practice stats:', error);
    return { 
      stats: { recall_attempts: 0, refine_attempts: 0, conquer_attempts: 0 }, 
      error: error.message 
    };
  }
};

/**
 * Fetches user's practice unlocks
 * @param userId The user's ID
 * @param authToken The user's auth token
 * @returns Promise with practice unlocks
 */
export const getPracticeUnlocks = async (
  userId: string,
  authToken?: string
) => {
  try {
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    const { data, error } = await client
      .from('practice_unlocks')
      .select('practice_type, unlocked_at')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching practice unlocks:', error);
      return { unlocks: [], error: error.message };
    }
    
    return { unlocks: data || [], error: null };
  } catch (error: any) {
    console.error('Exception fetching practice unlocks:', error);
    return { unlocks: [], error: error.message };
  }
};

/**
 * Increments practice attempt count for a user
 * @param userId The user's ID
 * @param practiceType The practice type
 * @param count Number of attempts to increment
 * @param authToken The user's auth token
 * @returns Promise with updated stats and newly unlocked practice types
 */
export const incrementPracticeAttempt = async (
  userId: string,
  practiceType: PracticeType,
  count: number = 1,
  authToken?: string
) => {
  try {
    const client = authToken ? await getSupabaseWithAuth(authToken) : supabase;
    
    const { data, error } = await client.rpc('increment_practice_attempt', {
      p_user_id: userId,
      p_practice_type: practiceType,
      p_increment: count
    });
    
    if (error) {
      console.error('Error incrementing practice attempt:', error);
      return { 
        stats: null, 
        newlyUnlocked: [], 
        error: error.message 
      };
    }
    
    return { 
      stats: {
        recall_attempts: data[0].recall_attempts,
        refine_attempts: data[0].refine_attempts,
        conquer_attempts: data[0].conquer_attempts
      },
      newlyUnlocked: data[0].newly_unlocked || [],
      error: null
    };
  } catch (error: any) {
    console.error('Exception incrementing practice attempt:', error);
    return { stats: null, newlyUnlocked: [], error: error.message };
  }
};

/**
 * Checks which practice types are available for a user
 * @param userId The user's ID
 * @param authToken The user's auth token
 * @returns Promise with available practice types
 */
export const getAvailablePracticeTypes = async (
  userId: string,
  authToken?: string
) => {
  try {
    // Get user practice stats
    const { stats, error: statsError } = await getUserPracticeStats(userId, authToken);
    if (statsError) {
      return { 
        available: { recall: true, refine: false, conquer: false },
        stats,
        error: statsError
      };
    }
    
    // Get practice unlocks
    const { unlocks, error: unlocksError } = await getPracticeUnlocks(userId, authToken);
    if (unlocksError) {
      return { 
        available: { recall: true, refine: false, conquer: false },
        stats,
        error: unlocksError
      };
    }
    
    // Check which practice types are available
    const refineUnlocked = unlocks.some((u: PracticeUnlock) => u.practice_type === 'refine') ||
                           (stats.recall_attempts >= 50);
    
    const conquerUnlocked = unlocks.some((u: PracticeUnlock) => u.practice_type === 'conquer') ||
                            (stats.recall_attempts >= 100 && stats.refine_attempts >= 100);
    
    return {
      available: {
        recall: true, // Always available
        refine: refineUnlocked,
        conquer: conquerUnlocked
      },
      stats,
      unlocks,
      error: null
    };
  } catch (error: any) {
    console.error('Exception checking available practice types:', error);
    return { 
      available: { recall: true, refine: false, conquer: false },
      stats: { recall_attempts: 0, refine_attempts: 0, conquer_attempts: 0 },
      unlocks: [],
      error: error.message
    };
  }
};

// Default export to satisfy Expo Router's requirement
export default {
  getAvailableSubjects,
  getUserPracticeStats,
  getPracticeUnlocks,
  incrementPracticeAttempt,
  getAvailablePracticeTypes,
  isRouteComponent: false
}; 