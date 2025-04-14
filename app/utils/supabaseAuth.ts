import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Get environment variables 
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Add a client cache to avoid recreating clients for the same token
const clientCache = new Map();

/**
 * Creates a Supabase client with the user's JWT token from Clerk
 * This allows the RLS policies to work correctly
 */
export const getSupabaseWithAuth = async (clerkToken: string) => {
  // Return cached client if it exists for this token
  if (clientCache.has(clerkToken)) {
    console.log('Using cached Supabase client');
    return clientCache.get(clerkToken);
  }
  
  console.log('Creating Supabase client with auth token');
  
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

  // Create a new Supabase client with the auth token in global headers
  const client = createClient(supabaseUrl, supabaseAnonKey, {
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
  
  // Cache the client for future use with this token
  clientCache.set(clerkToken, client);
  
  // Limit cache size to prevent memory leaks (e.g., keep only the last 5 clients)
  if (clientCache.size > 5) {
    const oldestKey = clientCache.keys().next().value;
    clientCache.delete(oldestKey);
  }
  
  return client;
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

// Default export to satisfy Expo Router's requirement
export default { 
  getSupabaseWithAuth, 
  disableRLSForTable,
  isRouteComponent: false
}; 