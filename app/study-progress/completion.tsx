import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Home, BookOpen } from "lucide-react-native";
import { useAppContext } from "../context/AppContext";

const CompletionScreen = () => {
  const { studiedChapters } = useAppContext();

  const handleStartPractice = () => {
    router.push("/practice");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{
            uri: "https://api.dicebear.com/7.x/shapes/svg?seed=success",
          }}
          style={styles.image}
        />

        <Text style={styles.title}>Setup Complete!</Text>

        <Text style={styles.description}>
          {studiedChapters.length > 0
            ? `Great job! You've marked ${studiedChapters.length} topics as studied. Your personalized practice sessions are now ready.`
            : "Your profile is set up and ready to go. You can start practicing right away or explore the dashboard."}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{studiedChapters.length}</Text>
            <Text style={styles.statLabel}>Topics Marked as Studied</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Profile Setup Complete</Text>
          </View>
        </View>

        <Text style={styles.nextStepsText}>
          What would you like to do next?
        </Text>

        <TouchableOpacity
          style={styles.practiceButton}
          onPress={handleStartPractice}
        >
          <BookOpen size={20} color="#FFFFFF" />
          <Text style={styles.practiceButtonText}>Start Practice Session</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Home size={20} color="#4B5563" />
          <Text style={styles.homeButtonText}>Go to Dashboard</Text>
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
  image: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4F46E5",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  nextStepsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
  },
  practiceButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 12,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginLeft: 12,
  },
});

export default CompletionScreen;
