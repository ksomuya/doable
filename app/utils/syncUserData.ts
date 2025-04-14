import { supabase } from './supabase';
import { useUser } from '@clerk/clerk-expo';
import { useState, useCallback } from 'react';

/**
 * Hook to sync user data from Clerk to Supabase
 * @returns Object with syncUser function and loading/error states
 */
export function useSyncUser() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncUser = useCallback(async () => {
    if (!user) {
      setError(new Error('No authenticated user found'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare user data for Supabase
      const userData = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        photo_url: user.imageUrl,
        // These fields would be updated separately as they're not available from Clerk
        // date_of_birth: null,
        // parent_mobile: null,
        // is_onboarded and is_profile_setup remain as defaults (false)
        updated_at: new Date().toISOString(),
      };
      
      // Try to use the edge function first for better reliability
      try {
        // Call the sync-user-profile edge function if it exists
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sync-user-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ user })
        });
        
        if (response.ok) {
          console.log('User synced via edge function');
          return true;
        }
      } catch (edgeFuncError) {
        // Edge function failed, continue with client-side logic
        console.log('Edge function failed, falling back to client logic:', edgeFuncError);
      }
      
      // First check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, is_onboarded, is_profile_setup')
        .eq('id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // Not found error code
        throw fetchError;
      }
        
      if (existingUser) {
        // Update user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            ...userData,
            // Preserve existing onboarding and profile setup status
            is_onboarded: existingUser.is_onboarded,
            is_profile_setup: existingUser.is_profile_setup
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            ...userData,
            is_onboarded: false,
            is_profile_setup: false,
            created_at: new Date().toISOString()
          });
          
        if (insertError) throw insertError;
      }
      
      // Check if user profile exists, create if not
      const { data: profile, error: profileFetchError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (profileFetchError && profileFetchError.code !== 'PGRST116') {
        throw profileFetchError;
      }
        
      if (!profile) {
        // Create user profile with default values
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            xp: 0,
            level: 1,
            streak: 0,
            streak_goal: 0,
            notifications_enabled: true,
            rank: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (profileError) throw profileError;
        
        // Also create user_streaks entry
        const { error: streakError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (streakError) throw streakError;
        
        // Create study preferences with defaults
        const { error: prefError } = await supabase
          .from('study_preferences')
          .insert({
            user_id: user.id,
            daily_questions_goal: 20,
            weekly_topics_goal: 3,
            streak_goal: 7,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (prefError) throw prefError;
      }
      
      console.log('User successfully synced to Supabase with profile');
      return true;
    } catch (err) {
      console.error('Failed to sync user to Supabase:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { syncUser, loading, error };
}

// Default export to satisfy Expo Router's requirement
export default { 
  useSyncUser,
  isRouteComponent: false 
}; 