import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Check, Trash2 } from "lucide-react-native";

// Sample notification data
const initialNotifications = [
  {
    id: "1",
    title: "New Achievement Unlocked",
    message: "Congratulations! You've completed 5 practice sessions this week.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    title: "Daily Streak Reminder",
    message: "Don't forget to practice today to maintain your 7-day streak!",
    time: "Yesterday",
    read: true,
  },
  {
    id: "3",
    title: "New Study Material Available",
    message: "Check out the new Physics practice questions in the library.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "4",
    title: "Weekly Progress Report",
    message:
      "Your weekly progress report is now available. You've improved by 15%!",
    time: "1 week ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleBackPress = () => {
    router.back();
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: !notification.read }
          : notification,
      ),
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Check size={16} color={unreadCount === 0 ? "#9CA3AF" : "#4F46E5"} />
          <Text
            style={[
              styles.actionText,
              { color: unreadCount === 0 ? "#9CA3AF" : "#4F46E5" },
            ]}
          >
            Mark all as read
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={clearAllNotifications}
          disabled={notifications.length === 0}
        >
          <Trash2
            size={16}
            color={notifications.length === 0 ? "#9CA3AF" : "#EF4444"}
          />
          <Text
            style={[
              styles.actionText,
              {
                color: notifications.length === 0 ? "#9CA3AF" : "#EF4444",
              },
            ]}
          >
            Clear all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                notification.read
                  ? styles.readNotification
                  : styles.unreadNotification,
              ]}
              onPress={() => toggleReadStatus(notification.id)}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
              </View>
              {!notification.read && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateMessage}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
  },
  readNotification: {
    backgroundColor: "white",
  },
  unreadNotification: {
    backgroundColor: "#F9FAFB",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  notificationTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: "80%",
  },
});
