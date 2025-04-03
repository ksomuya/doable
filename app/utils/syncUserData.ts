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
      
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (existingUser) {
        // Update user
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', user.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert user
        const { error: insertError } = await supabase
          .from('users')
          .insert(userData);
          
        if (insertError) throw insertError;
      }
      
      console.log('User successfully synced to Supabase');
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