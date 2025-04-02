import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";
import PenguinImage from "../components/PenguinImage";
import TypingText from "../components/TypingText";

const PracticeIntroScreen = () => {
  const { user } = useAppContext();
  const [typingComplete, setTypingComplete] = useState(false);
  const message = `Let's get this part going, ${user.firstName || user.name.split(" ")[0]}! Ready to start your practice session?`;

  const handleContinue = () => {
    router.push("/practice");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Speech Bubble */}
        <View style={styles.speechBubble}>
          <TypingText
            text={message}
            style={styles.speechText}
            typingSpeed={40}
            onTypingComplete={() => setTypingComplete(true)}
          />
          <View style={styles.speechTail} />
        </View>

        {/* Penguin Image - using Lottie animation */}
        <View style={styles.imageContainer}>
          <PenguinImage 
            size={200} 
            animation="excited" 
            loop={true}
          />
        </View>

        <Text style={styles.description}>
          We'll help you practice the topics you've selected. Let's strengthen
          your knowledge together!
        </Text>
      </View>
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !typingComplete && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!typingComplete}
        >
          <Text style={styles.continueButtonText}>Select Subject</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  speechBubble: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    maxWidth: "90%",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  speechText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 26,
  },
  speechTail: {
    position: "absolute",
    bottom: -15,
    left: "50%",
    marginLeft: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 15,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#F9FAFB",
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginVertical: 30,
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
    maxWidth: "90%",
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: 34, // Extra padding at bottom for safe area
    width: "100%",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ED7930",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
    opacity: 0.8
  },
});

export default PracticeIntroScreen;
