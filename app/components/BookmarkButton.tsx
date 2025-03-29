import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { Bookmark } from "lucide-react-native";

interface BookmarkButtonProps {
  questionId: string;
  isBookmarked: boolean;
  onToggleBookmark: (questionId: string, isBookmarked: boolean) => void;
}

const BookmarkButton = ({
  questionId,
  isBookmarked,
  onToggleBookmark,
}: BookmarkButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePress = () => {
    onToggleBookmark(questionId, !isBookmarked);

    // Show tooltip briefly
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <View style={styles.container}>
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.button, isBookmarked && styles.bookmarkedButton]}
        onPress={handlePress}
      >
        <Bookmark
          size={20}
          color={isBookmarked ? "#4F46E5" : "#6B7280"}
          fill={isBookmarked ? "#4F46E5" : "transparent"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  bookmarkedButton: {
    backgroundColor: "#EEF2FF",
  },
  tooltip: {
    position: "absolute",
    bottom: 40,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    width: 160,
  },
  tooltipText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
});

export default BookmarkButton;
