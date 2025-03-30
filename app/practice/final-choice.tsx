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
            uri: "https://api.dicebear.com/7.x/bottts/svg?seed=congrats&backgroundColor=blue",
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
              <BookOpen size={24} color="#4F46E5" />
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
              <Home size={24} color="#4F46E5" />
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
    backgroundColor: "#F9FAFB",
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
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
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
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EEF2FF",
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
    color: "#1F2937",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default FinalChoiceScreen; 