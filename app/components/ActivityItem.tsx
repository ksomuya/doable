import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  BookOpen,
  Award,
  Zap,
  Calendar,
  CheckCircle,
  Flame,
} from "lucide-react-native";

export type ActivityType =
  | "study"
  | "practice"
  | "achievement"
  | "streak"
  | "login";

export interface ActivityItemData {
  id: string;
  type: ActivityType;
  date: string; // ISO date string
  title: string;
  description?: string;
  xpEarned?: number;
}

interface ActivityItemProps {
  activity: ActivityItemData;
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "study":
        return <BookOpen size={20} color="#4F46E5" />;
      case "practice":
        return <Zap size={20} color="#F59E0B" />;
      case "achievement":
        return <Award size={20} color="#10B981" />;
      case "streak":
        return <Flame size={20} color="#EF4444" />;
      case "login":
        return <Calendar size={20} color="#6366F1" />;
      default:
        return <CheckCircle size={20} color="#6B7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{getActivityIcon(activity.type)}</View>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.date}>{formatDate(activity.date)}</Text>
        </View>
        {activity.description && (
          <Text style={styles.description}>{activity.description}</Text>
        )}
        {activity.xpEarned !== undefined && activity.xpEarned > 0 && (
          <View style={styles.xpContainer}>
            <Zap size={14} color="#F59E0B" />
            <Text style={styles.xpText}>+{activity.xpEarned} XP</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#F59E0B",
    marginLeft: 4,
  },
});

export default ActivityItem;
