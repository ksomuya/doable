import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";

const PracticeIntroScreen = () => {
  const { user } = useAppContext();

  const handleContinue = () => {
    router.push("/practice");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Speech Bubble */}
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Let's get this part going,{" "}
            {user.firstName || user.name.split(" ")[0]}! Ready to start your
            practice session?
          </Text>
          <View style={styles.speechTail} />
        </View>

        {/* Penguin Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://api.dicebear.com/7.x/bottts/svg?seed=penguin&backgroundColor=orange",
            }}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        <Text style={styles.description}>
          We'll help you practice the topics you've selected. Let's strengthen
          your knowledge together!
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
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
  image: {
    width: "100%",
    height: "100%",
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: "90%",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
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
});

export default PracticeIntroScreen;
