import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSyncUser } from '../utils/syncUserData';

/**
 * Component that syncs Clerk user data to Supabase when a user signs in
 * Include this in your app's layout or authentication flow
 */
export default function ClerkSupabaseSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const { syncUser } = useSyncUser();
  
  useEffect(() => {
    // Only sync when user is signed in and auth is loaded
    if (isLoaded && isSignedIn) {
      syncUser().catch(err => {
        console.error('Failed to sync user data:', err);
      });
    }
  }, [isSignedIn, isLoaded, syncUser]);

  // This is a utility component with no UI
  return null;
} 