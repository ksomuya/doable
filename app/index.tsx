import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Zap,
  ClipboardList,
  ChartBar as BarChart2,
  Bell,
  ArrowUpRight,
  Focus,
} from "lucide-react-native";
import ChapterInput from "./components/ChapterInput";
import VirtualPet from "./components/VirtualPet";
import UserStats from "./components/UserStats";
import { useAppContext } from "./context/AppContext";

export default function HomeScreen() {
  const router = useRouter();
  const {
    user,
    pet,
    studiedChapters,
    updateStudiedChapters,
    signOut,
    practiceSession,
  } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Update questions answered from practice session
  useEffect(() => {
    if (practiceSession) {
      setQuestionsAnswered(practiceSession.questionsAnswered || 0);
    }
  }, [practiceSession]);

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  const handleStreakPress = () => {
    router.push("/activity");
  };

  const handleStartPractice = () => {
    router.push("/practice");
  };

  const handleCardPress = (cardType: string) => {
    if (cardType === "Leader Board") {
      router.push("/leaderboard");
    } else if (cardType === "Reports") {
      router.push("/reports");
    } else if (cardType === "Remove Distractions") {
      router.push("/distraction-blocker");
    }
  };

  const handleChapterSave = (savedChapters: string[]) => {
    updateStudiedChapters(savedChapters);
  };

  const handleSignOut = () => {
    signOut();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your study buddy...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleProfilePress}>
            <View style={styles.profileImage}>
              <Image
                source={{
                  uri:
                    user.photoUrl ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
                }}
                style={styles.avatar}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationsPress}
          >
            <Bell size={24} color="#000" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* User Stats */}
        <View style={styles.statsSection}>
          <UserStats
            energy={user.xp}
            streak={user.streak}
            onStreakPress={handleStreakPress}
          />
        </View>

        {/* Virtual Pet */}
        <View style={styles.petSection}>
          <VirtualPet />
        </View>

        {/* Circular Navigation Buttons */}
        <View style={styles.circularButtonsContainer}>
          <View style={styles.buttonWithLabel}>
            <TouchableOpacity 
              style={styles.circularButton}
              onPress={() => handleCardPress("Leader Board")}
            >
              <BarChart2 size={24} color="#f97316" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Leaderboard</Text>
          </View>
          
          <View style={styles.buttonWithLabel}>
            <TouchableOpacity 
              style={styles.circularButton}
              onPress={() => handleCardPress("Reports")}
            >
              <ClipboardList size={24} color="#10b981" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Reports</Text>
          </View>
          
          <View style={styles.buttonWithLabel}>
            <TouchableOpacity 
              style={styles.circularButton}
              onPress={() => handleCardPress("Remove Distractions")}
            >
              <Focus size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Focus</Text>
          </View>
        </View>

        {/* Chapter Input CTA */}
        <View style={styles.chapterSection}>
          <ChapterInput
            onSave={handleChapterSave}
            initialChapters={studiedChapters}
            questionsCompleted={questionsAnswered}
          />
        </View>

        {/* Extra space at the bottom */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Floating Start Practice Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleStartPractice}
        >
          <Text style={styles.buttonText}>Start Practice Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    backgroundColor: "#1F2937",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statsSection: {
    marginBottom: 12,
  },
  petSection: {
    marginBottom: 12,
  },
  circularButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonWithLabel: {
    alignItems: "center",
  },
  circularButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F9FAFB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#4B5563",
    textAlign: "center",
  },
  chapterSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  bottomSpace: {
    height: 64,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  floatingButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationButton: {
    position: "relative",
    padding: 4,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
