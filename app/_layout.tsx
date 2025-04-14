import { useEffect } from "react";
import { SplashScreen, useSegments, useRouter } from "expo-router";
import * as SplashScreenModule from "expo-splash-screen";
import { useFonts } from "expo-font";
import { AppProvider } from "./context/AppContext";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import ClerkSupabaseSync from "./components/ClerkSupabaseSync";
import * as SecureStore from "expo-secure-store";
import "../global.css";
import { Stack } from "expo-router";

// Keep the splash screen visible until we're ready
SplashScreenModule.preventAutoHideAsync();
SplashScreen.preventAutoHideAsync();

// Enhanced secure token cache for Clerk with improved error handling
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('Failed to get token from SecureStore:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('Failed to save token to SecureStore:', err);
      return;
    }
  },
  async clearToken(key: string) {
    try {
      return await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.error('Failed to clear token from SecureStore:', err);
      return;
    }
  },
};

// Auth routing component that redirects based on auth state
function AuthMiddleware() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Skip if auth isn't loaded yet
    if (!isLoaded) return;

    // Check if the route is the auth screen
    const isAuthGroup = segments[0] === 'auth';

    // Handle routing based on auth state and current location
    if (!isSignedIn && !isAuthGroup) {
      // Redirect to auth screen if not signed in and not already on auth screen
      router.replace('/auth');
    } else if (isSignedIn && isAuthGroup) {
      // Redirect to main screen if signed in but on auth screen
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    // Add any other custom fonts here
  });

  useEffect(() => {
    // Hide the splash screen after a short delay or when fonts are loaded
    const hideSplash = async () => {
      if (fontsLoaded || fontError) {
        // Add a slight delay to ensure everything is properly loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        await SplashScreenModule.hideAsync();
        await SplashScreen.hideAsync();
      }
    };

    hideSplash();
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <AppProvider>
        <ClerkSupabaseSync />
        <AuthMiddleware />
        <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'light'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#fff" },
          }}
        />
      </AppProvider>
    </ClerkProvider>
  );
}
