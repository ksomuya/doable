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
  Thermometer,
  Zap,
  ClipboardList,
  ChartBar as BarChart2,
  Settings,
  Bell,
  ArrowUpRight,
} from "lucide-react-native";
import ChapterInput from "./components/ChapterInput";
import VirtualPet from "./components/VirtualPet";
import UserStats from "./components/UserStats";
import TemperatureAdjustmentModal from "./components/TemperatureAdjustmentModal";
import { useAppContext } from "./context/AppContext";

export default function HomeScreen() {
  const router = useRouter();
  const {
    user,
    pet,
    studiedChapters,
    updateStudiedChapters,
    feedPet,
    playWithPet,
    updateTemperature,
    coolDownPenguin,
    signOut,
  } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showTemperatureModal, setShowTemperatureModal] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Update temperature when component mounts
    updateTemperature();

    return () => clearTimeout(timer);
  }, []);

  // Check temperature periodically
  useEffect(() => {
    const temperatureCheckInterval = setInterval(() => {
      updateTemperature();
    }, 60000); // Check every minute

    return () => clearInterval(temperatureCheckInterval);
  }, []);

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
    } else if (cardType === "Custom Test") {
      router.push("/customtest");
    } else if (cardType === "Reports") {
      router.push("/reports");
    }
  };

  const handleChapterSave = (savedChapters: string[]) => {
    updateStudiedChapters(savedChapters);
  };

  const handleTemperaturePress = () => {
    setShowTemperatureModal(true);
  };

  const handleCoolDown = () => {
    const success = coolDownPenguin();
    if (success) {
      // Close modal after successful cool down
      setTimeout(() => setShowTemperatureModal(false), 1000);
    }
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
                  uri: user.photoUrl,
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
            temperature={pet.temperature}
            energy={user.xp}
            snowballs={user.snowballs}
            streak={user.streak}
            onTemperaturePress={handleTemperaturePress}
            onStreakPress={handleStreakPress}
          />
        </View>

        {/* Virtual Pet */}
        <View style={styles.petSection}>
          <VirtualPet
            onPetInteract={playWithPet}
            temperature={pet.temperature}
          />
        </View>

        {/* Temperature Adjustment Modal */}
        <TemperatureAdjustmentModal
          visible={showTemperatureModal}
          onClose={() => setShowTemperatureModal(false)}
          temperature={pet.temperature}
          snowballs={user.snowballs}
          onAdjustTemperature={handleCoolDown}
          adjustmentCost={50}
        />

        {/* Chapter Input CTA */}
        <View style={styles.chapterSection}>
          <ChapterInput
            onSave={handleChapterSave}
            initialChapters={studiedChapters}
          />
        </View>

        {/* Bento Box Layout */}
        <View style={styles.bentoSection}>
          {/* Side by Side Layout */}
          <View style={styles.bentoRow}>
            {/* Left Column - Two Small Boxes */}
            <View style={styles.bentoLeftColumn}>
              {/* Leader Board Card */}
              <TouchableOpacity
                onPress={() => handleCardPress("Leader Board")}
                style={[styles.bentoCard, styles.orangeCard]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Leader Board</Text>
                  <View style={styles.iconContainer}>
                    <ArrowUpRight size={12} color="#000" />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <BarChart2 size={28} color="#f97316" />
                </View>
              </TouchableOpacity>

              {/* Custom Test Card */}
              <TouchableOpacity
                onPress={() => handleCardPress("Custom Test")}
                style={[styles.bentoCard, styles.purpleCard]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Custom Test</Text>
                  <View style={styles.iconContainer}>
                    <ArrowUpRight size={12} color="#000" />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Settings size={28} color="#8b5cf6" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Right Column - One Large Box */}
            <View style={styles.bentoRightColumn}>
              <TouchableOpacity
                onPress={() => handleCardPress("Reports")}
                style={[styles.bentoCard, styles.greenCard, styles.largeCard]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Reports</Text>
                  <View style={styles.iconContainer}>
                    <ArrowUpRight size={12} color="#000" />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <ClipboardList size={28} color="#10b981" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
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
  chapterSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bentoSection: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
  },
  bentoLeftColumn: {
    flex: 1,
    gap: 12,
  },
  bentoRightColumn: {
    flex: 1,
  },
  bentoCard: {
    padding: 12,
    borderRadius: 16,
  },
  orangeCard: {
    backgroundColor: "#FFF7ED",
    height: 128,
  },
  purpleCard: {
    backgroundColor: "#F5F3FF",
    height: 128,
  },
  greenCard: {
    backgroundColor: "#ECFDF5",
  },
  largeCard: {
    height: 268,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  iconContainer: {
    backgroundColor: "white",
    padding: 4,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
