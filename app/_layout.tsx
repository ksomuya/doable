import { useEffect } from "react";
import { SplashScreen } from "expo-router";
import * as SplashScreenModule from "expo-splash-screen";
import { useFonts } from "expo-font";
import { AppProvider } from "./context/AppContext";
import { ClerkProvider } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import ClerkSupabaseSync from "./components/ClerkSupabaseSync";
import * as SecureStore from "expo-secure-store";
import "../global.css";
import { Stack } from "expo-router";

// Keep the splash screen visible until we're ready
SplashScreenModule.preventAutoHideAsync();
SplashScreen.preventAutoHideAsync();

// Create a secure token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

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
