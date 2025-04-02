import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from "react-native";
import { Zap, Flame, X, Trophy, Book, CheckCircle } from "lucide-react-native";

interface UserStatsProps {
  energy?: number;
  streak?: number;
  onStreakPress?: () => void;
}

const UserStats = ({
  energy = 126,
  streak = 7,
  onStreakPress = () => {},
}: UserStatsProps) => {
  const [showXpTooltip, setShowXpTooltip] = useState(false);

  const handleXpPress = useCallback(() => {
    setShowXpTooltip(true);
  }, []);

  const handleCloseTooltip = useCallback(() => {
    setShowXpTooltip(false);
  }, []);

  return (
    <>
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem} onPress={handleXpPress}>
          <Zap size={18} color="#FFB443" />
          <Text style={styles.statText}>{energy}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={onStreakPress}
        >
          <Flame size={18} color="#FF4D4D" />
          <Text style={styles.statText}>{streak}</Text>
        </TouchableOpacity>
      </View>

      {/* XP Tooltip Modal */}
      <Modal
        visible={showXpTooltip}
        transparent
        animationType="fade"
        onRequestClose={handleCloseTooltip}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={handleCloseTooltip}
        >
          <View style={styles.tooltipContainer}>
            <View style={styles.tooltipHeader}>
              <View style={styles.tooltipTitleContainer}>
                <Zap size={18} color="#FFB443" />
                <Text style={styles.tooltipTitle}>How to Earn XP</Text>
              </View>
              <TouchableOpacity onPress={handleCloseTooltip}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipDescription}>
                Earn XP to level up and climb the leaderboard rankings!
              </Text>

              <View style={styles.xpItemContainer}>
                <View style={styles.xpItem}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.xpItemText}>Complete practice sessions (+50 XP)</Text>
                </View>

                <View style={styles.xpItem}>
                  <Book size={16} color="#3b82f6" />
                  <Text style={styles.xpItemText}>Add study topics (+10 XP each)</Text>
                </View>

                <View style={styles.xpItem}>
                  <Flame size={16} color="#FF4D4D" />
                  <Text style={styles.xpItemText}>Maintain daily streak (+15 XP per day)</Text>
                </View>

                <View style={styles.xpItem}>
                  <Trophy size={16} color="#f97316" />
                  <Text style={styles.xpItemText}>Rank in top 10 leaderboard (+100 XP bonus)</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 10,
  },
  statText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  // Tooltip Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipContainer: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tooltipTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  tooltipContent: {
    padding: 16,
  },
  tooltipDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 16,
  },
  xpItemContainer: {
    gap: 12,
  },
  xpItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  xpItemText: {
    fontSize: 14,
    color: "#1F2937",
  },
});

export default React.memo(UserStats);
