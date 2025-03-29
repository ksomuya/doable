import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react-native";

const GoalSelectionScreen = () => {
  const router = useRouter();
  const [xpGoal, setXpGoal] = useState<number>(100);

  const handleIncreaseXP = () => {
    setXpGoal((prev) => Math.min(prev + 50, 500));
  };

  const handleDecreaseXP = () => {
    setXpGoal((prev) => Math.max(prev - 50, 50));
  };

  const handleStartSession = () => {
    router.push({
      pathname: "/practice/question",
      params: {
        xp: xpGoal.toString(),
        subject: "mathematics", // Default subject
        type: "refine", // Default type
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Goal</Text>
        <Text style={styles.subtitle}>Select a Xp Goal for this session</Text>

        <View style={styles.xpSelectorContainer}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handleIncreaseXP}
          >
            <ChevronUp size={24} color="#22C55E" />
          </TouchableOpacity>

          <View style={styles.xpValueContainer}>
            <Text style={styles.xpValue}>{xpGoal}</Text>
            <Text style={styles.xpLabel}>Xp</Text>
          </View>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handleDecreaseXP}
          >
            <ChevronDown size={24} color="#22C55E" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartSession}
        >
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginHorizontal: 12,
  },
  progressFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  xpSelectorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  arrowButton: {
    padding: 16,
  },
  xpValueContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  xpValue: {
    fontSize: 72,
    fontWeight: "700",
    color: "#22C55E",
  },
  xpLabel: {
    fontSize: 24,
    color: "#22C55E",
    marginTop: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  startButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GoalSelectionScreen;
