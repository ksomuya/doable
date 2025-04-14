import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Animated,
  Platform,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { ArrowRight } from "lucide-react-native";
import { useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";

const { height } = Dimensions.get("window");

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const buttonOpacity = React.useRef(new Animated.Value(1)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;

  // Set up OAuth with Clerk
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  // Function to safely navigate to onboarding
  const safeNavigateToOnboarding = useCallback(() => {
    try {
      // Reset any navigation state first to avoid conflicts
      router.replace("/");
      
      // Use a longer delay to ensure everything is loaded properly
      setTimeout(() => {
        router.replace("/onboarding");
      }, 1000);
    } catch (navError) {
      console.error("Navigation error:", navError);
      // If navigation fails, try one more time after a delay
      setTimeout(() => {
        try {
          router.replace("/onboarding");
        } catch (finalError) {
          console.error("Final navigation error:", finalError);
          setAuthError("Navigation failed. Please restart the app.");
          setIsRedirecting(false);
        }
      }, 2000);
    }
  }, []);

  const onGooglePress = useCallback(async () => {
    try {
      setAuthError(null);
      setIsLoading(true);

      // Animate button press
      Animated.sequence([
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Start OAuth flow with Google
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        // Show redirecting state to prevent "page not found" flash
        setIsRedirecting(true);
        
        if (setActive) {
          try {
            // Activate the session
            await setActive({ session: createdSessionId });
            // Navigate to onboarding with the safe navigation function
            safeNavigateToOnboarding();
          } catch (activationError) {
            console.error("Session activation error:", activationError);
            // If session activation fails, attempt navigation anyway
            safeNavigateToOnboarding();
          }
        } else {
          // If setActive is not available, still attempt navigation
          safeNavigateToOnboarding();
        }
      } else {
        // If no session was created, show an error
        setAuthError("Authentication failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setAuthError("Sign in failed. Please try again.");
      setIsRedirecting(false);
      setIsLoading(false);
    }
  }, [startOAuthFlow, safeNavigateToOnboarding]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* Solid Background */}
      <View style={styles.background} />

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://api.dicebear.com/7.x/shapes/svg?seed=doable",
              }}
              contentFit="contain"
              style={styles.logo}
            />
            <Text style={styles.appTitle}>Doable</Text>
            <Text style={styles.appDescription}>
              Fun, Interactive & Effective Way to Practice
            </Text>
          </View>

          {/* Spacer to push footer to bottom */}
          <View style={{ flex: 1 }} />

          {/* Footer with Google button at bottom */}
          <View style={styles.footerContainer}>
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  opacity: buttonOpacity,
                  transform: [{ scale: buttonScale }],
                },
              ]}
            >
              <TouchableOpacity
                onPress={onGooglePress}
                style={styles.googleButton}
                disabled={isLoading}
              >
                <Image
                  source={{
                    uri: "https://developers.google.com/identity/images/g-logo.png",
                  }}
                  contentFit="contain"
                  style={styles.googleIcon}
                />
                <Text style={styles.buttonText}>
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </Text>
                {!isLoading && <ArrowRight size={20} color="#333" />}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {(isLoading || isRedirecting) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#ED7930"
              style={styles.loadingIndicator}
            />
            <Text style={styles.loadingText}>
              {isRedirecting ? "Taking you to Doable..." : "Signing in with Google..."}
            </Text>
            {authError && (
              <Text style={styles.errorText}>{authError}</Text>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#F9F9F9",
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    paddingBottom: 0,
    justifyContent: "flex-start",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.2,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ED7930",
    marginBottom: 12,
    textAlign: "center",
  },
  appDescription: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 24,
    marginBottom: 40,
  },
  footerContainer: {
    width: "100%",
    marginBottom: 0,
    paddingBottom: Platform.OS === "ios" ? 16 : 8,
  },
  buttonContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
  },
  googleButton: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "ios" ? 16 : 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  buttonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginRight: 8,
    flex: 1,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 0,
  },
  errorText: {
    fontSize: 14,
    color: "#E53935",
    textAlign: "center",
    marginTop: 8,
  },
});

export default AuthScreen;
