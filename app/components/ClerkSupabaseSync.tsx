import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSyncUser } from '../utils/syncUserData';
import { supabase } from '../utils/supabase';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { useAppContext } from '../context/AppContext';

// Get environment variables directly from process.env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Component that syncs Clerk user data to Supabase when a user signs in
 * Include this in your app's layout or authentication flow
 */
export default function ClerkSupabaseSync() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { syncUser } = useSyncUser();
  const { setSupabaseAuthStatus } = useAppContext();
  const [authSynced, setAuthSynced] = useState(false);
  
  // Set Clerk token in Supabase for authenticated API calls
  useEffect(() => {
    const setupSupabaseAuth = async () => {
      if (isLoaded && isSignedIn) {
        try {
          // Get JWT token from Clerk
          const token = await getToken({ template: 'supabase' });
          
          if (token) {
            // Create a storage adapter for Supabase using Expo's SecureStore
            const ExpoSecureStoreAdapter = {
              getItem: (key: string) => {
                return SecureStore.getItemAsync(key);
              },
              setItem: (key: string, value: string) => {
                SecureStore.setItemAsync(key, value);
              },
              removeItem: (key: string) => {
                SecureStore.deleteItemAsync(key);
              },
            };

            // Override the global supabase instance with one that uses auth headers
            (global as any).supabase = createClient(supabaseUrl, supabaseAnonKey, {
              global: {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
              auth: {
                storage: ExpoSecureStoreAdapter,
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
              },
            });
            
            console.log('Supabase client configured with Clerk token');
            setAuthSynced(true);
            setSupabaseAuthStatus(true);
          }
        } catch (err) {
          console.error('Failed to set Supabase auth token:', err);
          setSupabaseAuthStatus(false);
        }
      } else if (isLoaded && !isSignedIn) {
        // User is not signed in, reset the supabase client
        try {
          (global as any).supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: false,
            },
          });
          
          console.log('Supabase client reset to anonymous access');
          setAuthSynced(false);
          setSupabaseAuthStatus(false);
        } catch (err) {
          console.error('Failed to reset Supabase client:', err);
          setSupabaseAuthStatus(false);
        }
      }
    };
    
    setupSupabaseAuth();
  }, [isSignedIn, isLoaded, getToken, setSupabaseAuthStatus]);
  
  // Sync user data between Clerk and Supabase
  useEffect(() => {
    // Only sync when user is signed in, auth is loaded, and Supabase auth is ready
    if (isLoaded && isSignedIn && authSynced) {
      syncUser().catch(err => {
        console.error('Failed to sync user data:', err);
      });
    }
  }, [isSignedIn, isLoaded, syncUser, authSynced]);

  // This is a utility component with no UI
  return null;
} 