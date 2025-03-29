import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import {
  X,
  Heart,
  Thermometer,
  Utensils,
  Snowflake,
  Calendar,
  Smile,
  Play,
} from "lucide-react-native";

const { width, height } = Dimensions.get("window");

interface PetDetailModalProps {
  visible: boolean;
  onClose: () => void;
  pet: {
    name: string;
    health: number;
    foodLevel: number;
    temperature: number;
    mood: number;
    age: number;
  };
  onFeed: () => void;
  onPlay: () => void;
  snowballs: number;
}

const PetDetailModal = ({
  visible,
  onClose,
  pet,
  onFeed,
  onPlay,
  snowballs,
}: PetDetailModalProps) => {
  const getHealthColor = (health: number) => {
    if (health > 70) return "#10B981";
    if (health > 40) return "#F59E0B";
    return "#EF4444";
  };

  const getFoodColor = (food: number) => {
    if (food > 70) return "#10B981";
    if (food > 40) return "#F59E0B";
    return "#EF4444";
  };

  const getMoodColor = (mood: number) => {
    if (mood > 70) return "#10B981";
    if (mood > 40) return "#F59E0B";
    return "#EF4444";
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 20) return "#3B82F6";
    if (temp <= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <View style={styles.handle} />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.petInfoContainer}>
            <View style={styles.petImageContainer}>
              <Image
                source={{
                  uri: "https://api.dicebear.com/7.x/bottts/svg?seed=penguin",
                }}
                style={styles.petImage}
                contentFit="contain"
                onError={() => console.log("Failed to load pet image")}
              />
            </View>

            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name || "Dodo"}</Text>
              <Text style={styles.petDescription}>
                Your study companion penguin
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: getHealthColor(pet.health) + "20" },
                  ]}
                >
                  <Heart size={20} color={getHealthColor(pet.health)} />
                </View>
                <Text style={styles.statLabel}>Health</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: getHealthColor(pet.health) },
                  ]}
                >
                  {pet.health}%
                </Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: getFoodColor(pet.foodLevel) + "20" },
                  ]}
                >
                  <Utensils size={20} color={getFoodColor(pet.foodLevel)} />
                </View>
                <Text style={styles.statLabel}>Food</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: getFoodColor(pet.foodLevel) },
                  ]}
                >
                  {pet.foodLevel}%
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor:
                        getTemperatureColor(pet.temperature) + "20",
                    },
                  ]}
                >
                  <Thermometer
                    size={20}
                    color={getTemperatureColor(pet.temperature)}
                  />
                </View>
                <Text style={styles.statLabel}>Temperature</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: getTemperatureColor(pet.temperature) },
                  ]}
                >
                  {pet.temperature}°
                </Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: getMoodColor(pet.mood) + "20" },
                  ]}
                >
                  <Smile size={20} color={getMoodColor(pet.mood)} />
                </View>
                <Text style={styles.statLabel}>Mood</Text>
                <Text
                  style={[styles.statValue, { color: getMoodColor(pet.mood) }]}
                >
                  {pet.mood}%
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
                  <Calendar size={20} color="#4F46E5" />
                </View>
                <Text style={styles.statLabel}>Age</Text>
                <Text style={[styles.statValue, { color: "#4F46E5" }]}>
                  {pet.age} days
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#E0F2FE" }]}>
                  <Snowflake size={20} color="#0EA5E9" />
                </View>
                <Text style={styles.statLabel}>Snowballs</Text>
                <Text style={[styles.statValue, { color: "#0EA5E9" }]}>
                  {snowballs}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.feedButton]}
              onPress={onFeed}
            >
              <Utensils size={20} color="white" />
              <Text style={styles.actionButtonText}>Feed Pet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.playButton]}
              onPress={onPlay}
            >
              <Play size={20} color="white" />
              <Text style={styles.actionButtonText}>Play</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Pet Care Tips</Text>
            <Text style={styles.tipText}>
              • Feed your pet regularly to maintain health
            </Text>
            <Text style={styles.tipText}>
              • Keep temperature low with snowballs
            </Text>
            <Text style={styles.tipText}>
              • Play with your pet to improve mood
            </Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
    maxHeight: height * 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 16,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  petInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  petImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    marginRight: 16,
    overflow: "hidden",
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  petDescription: {
    fontSize: 16,
    color: "#6B7280",
  },
  statsContainer: {
    marginBottom: 24,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
  },
  feedButton: {
    backgroundColor: "#F59E0B",
  },
  playButton: {
    backgroundColor: "#4F46E5",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#065F46",
    marginBottom: 4,
  },
});

export default PetDetailModal;
