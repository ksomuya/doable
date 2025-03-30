import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Home, BookOpen, ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";
import { useAppContext } from "../context/AppContext";

const FinalChoiceScreen = () => {
  const router = useRouter();
  
  const handleGoHome = () => {
    router.push("/");
  };
  
  const handleStartNewSession = () => {
    router.push("/practice/goal");
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{
            uri: "https://cdn.jsdelivr.net/gh/duolingo/images@master/owl-trophy.png",
          }}
          style={styles.image}
          contentFit="contain"
        />
        
        <Text style={styles.title}>Great Work!</Text>
        <Text style={styles.subtitle}>
          You've completed your practice session. What would you like to do next?
        </Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={handleStartNewSession}
          >
            <View style={styles.optionIconContainer}>
              <BookOpen size={24} color="#58CC02" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Start a New Practice Session</Text>
              <Text style={styles.optionDescription}>
                Choose a new subject and continue improving your skills
              </Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={handleGoHome}
          >
            <View style={styles.optionIconContainer}>
              <Home size={24} color="#58CC02" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Go to Home Page</Text>
              <Text style={styles.optionDescription}>
                Return to the main dashboard and explore other activities
              </Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    width: "100%",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E5F8D9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B4B4B",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default FinalChoiceScreen; 