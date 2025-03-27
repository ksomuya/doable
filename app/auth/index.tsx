import React, { useState } from "react";
import {
  View,
  Text,
  Animated,
  Platform,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useAppContext } from "../context/AppContext";

const { height } = Dimensions.get("window");

const AuthScreen = () => {
  const { signIn } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const buttonOpacity = React.useRef(new Animated.Value(1)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;

  const handleSignInSuccess = () => {
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

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      signIn();
      setIsLoading(false);
      router.replace("/onboarding");
    }, 1500);
  };

  // Using a solid color background instead of an image to avoid image loading issues
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      {/* Solid Background */}
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "#F9F9F9",
        }}
      />

      {/* Main Content */}
      <View style={{ flex: 1, justifyContent: "space-between", padding: 24 }}>
        {/* Logo and Welcome Text */}
        <View style={{ alignItems: "center", marginTop: height * 0.3 }}>
          <Image
            source={{
              uri: "https://api.dicebear.com/7.x/shapes/svg?seed=doable",
            }}
            style={{ width: 120, height: 120, marginBottom: 24 }}
          />
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: "#ED7930",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Doable
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#666",
              textAlign: "center",
              maxWidth: "80%",
              lineHeight: 24,
            }}
          >
            Fun, Interactive & Effective Way to Practice
          </Text>
        </View>

        {/* Sign In Button */}
        <View style={{ width: "100%" }}>
          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <TouchableOpacity
              onPress={handleSignInSuccess}
              style={{
                backgroundColor: "#ED7930",
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: Platform.OS === "ios" ? 0 : 16,
              }}
              disabled={isLoading}
            >
              {!isLoading && (
                <Image
                  source={{ uri: "https://www.google.com/favicon.ico" }}
                  style={{ width: 24, height: 24, marginRight: 12 }}
                />
              )}
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 18,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Text
            style={{
              fontSize: 12,
              color: "#666",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              size="large"
              color="#ED7930"
              style={{ marginBottom: 16 }}
            />
            <Text style={{ fontSize: 18, fontWeight: "500" }}>
              Signing in...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AuthScreen;
