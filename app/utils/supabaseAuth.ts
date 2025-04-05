import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Get environment variables 
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a Supabase client with the user's JWT token from Clerk
 * This allows the RLS policies to work correctly
 */
export const getSupabaseWithAuth = async (clerkToken: string) => {
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

  // Create a new Supabase client with the auth token
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
};

/**
 * Alternative solution: temporarily disable RLS for testing
 */
export const disableRLSForTable = async (tableName: string) => {
  try {
    const { error } = await supabase.rpc('disable_rls_for_table', {
      table_name: tableName
    });
    
    if (error) {
      console.error('Error disabling RLS:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to disable RLS:', err);
    return false;
  }
}; 