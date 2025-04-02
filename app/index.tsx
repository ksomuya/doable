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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Zap,
  ClipboardList,
  ChartBar as BarChart2,
  Bell,
  Focus,
  BookOpen,
} from "lucide-react-native";
import ChapterInput from "./components/ChapterInput";
import VirtualPet from "./components/VirtualPet";
import UserStats from "./components/UserStats";
import { useAppContext } from "./context/AppContext";

// Brand colors
const COLORS = {
  background: "#f4f5ee",
  accent: "#f97316", // Orange accent color
  white: "#FFFFFF",
  black: "#000000",
  gray: "#6B7280",
  lightGray: "#F9FAFB",
};

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
    } else if (cardType === "Study Habits") {
      router.push("/study-habits");
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
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading your study buddy...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Content Area - Pet and Floating UI */}
      <View style={styles.topContent}>
        {/* Floating Header */}
        <View style={styles.floatingHeader}>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            <Image
              source={{
                uri:
                  user.photoUrl ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <View style={styles.floatingStats}>
            <UserStats
              energy={user.xp}
              streak={user.streak}
              onStreakPress={handleStreakPress}
            />
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationsPress}
          >
            <Bell size={24} color={COLORS.black} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pet Section (Transparent Background) */}
        <View style={styles.petContainer}>
          <VirtualPet />
        </View>
      </View>

      {/* Fixed Drawer - Always Visible */}
      <View style={styles.fixedDrawer}>
        <ScrollView
          style={styles.drawerContent}
          contentContainerStyle={styles.drawerContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Action Buttons */}
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>Quick Actions</Text>
          </View>
          
          <View style={styles.circularButtonsContainer}>
            <View style={styles.buttonWithLabel}>
              <TouchableOpacity 
                style={styles.circularButton}
                onPress={() => handleCardPress("Leader Board")}
              >
                <BarChart2 size={24} color={COLORS.accent} />
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
                onPress={() => handleCardPress("Study Habits")}
              >
                <BookOpen size={24} color="#8b5cf6" />
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Study Habits</Text>
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

          {/* Study Progress */}
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>Today's Progress</Text>
          </View>

          <View style={styles.chapterSection}>
            <ChapterInput
              onSave={handleChapterSave}
              initialChapters={studiedChapters}
              questionsCompleted={questionsAnswered}
            />
          </View>
          
          {/* Space to ensure content isn't hidden behind the fixed button */}
          <View style={styles.bottomPadding} />
        </ScrollView>
        
        {/* Fixed Practice Button */}
        <View style={styles.practiceButtonFixed}>
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={handleStartPractice}
          >
            <Text style={styles.practiceButtonText}>Start Practice Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.gray,
  },
  topContent: {
    height: "35%",
    backgroundColor: COLORS.background,
  },
  floatingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  floatingStats: {
    // No additional styling needed, the component handles its own styling
  },
  notificationButton: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCount: {
    color: COLORS.black,
    fontSize: 10,
    fontWeight: "bold",
  },
  petContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  fixedDrawer: {
    height: "65%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
    position: "relative",
  },
  drawerContent: {
    flex: 1,
  },
  drawerContentContainer: {
    paddingTop: 16,
    paddingBottom: 84, // Extra padding to account for fixed button
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
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
    backgroundColor: COLORS.lightGray,
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
    color: COLORS.gray,
    textAlign: "center",
  },
  chapterSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bottomPadding: {
    height: 80,
  },
  practiceButtonFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  practiceButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  practiceButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
