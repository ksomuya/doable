import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Edit2,
  Bell,
  Settings,
  FileText,
  HelpCircle,
  LogOut,
  Check,
  X,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  ChevronRight,
} from "lucide-react-native";
import { useAppContext } from "./context/AppContext";
import ProfileSetup from "./components/ProfileSetup";
import { ProfileData } from "./components/ProfileSetup";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, completeProfileSetup } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const handleBackPress = () => {
    router.back();
  };

  const handleEditName = () => {
    setNewName(user.name);
    setEditNameModalVisible(true);
  };

  const handleSaveName = () => {
    // In a real app, this would update the user's name in the context and backend
    // For now, we'll just close the modal
    setEditNameModalVisible(false);
    // Update would happen here
  };

  const navigateToSettings = (settingType) => {
    router.push(`/settings/${settingType}`);
  };

  const handleSocialLink = (platform) => {
    // These would be your actual social media links
    const links = {
      instagram: "https://instagram.com/doableapp",
      twitter: "https://twitter.com/doableapp",
      youtube: "https://youtube.com/doableapp",
      facebook: "https://facebook.com/doableapp",
    };

    Linking.openURL(links[platform]).catch((err) => {
      console.error("Couldn't open link: ", err);
    });
  };

  const handleProfileSetupComplete = (profileData: ProfileData) => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      completeProfileSetup(
        profileData.firstName,
        profileData.lastName,
        profileData.dateOfBirth,
        profileData.parentMobile,
      );
      setIsLoading(false);
    }, 1500);
  };

  if (!user.isProfileSetup) {
    return (
      <>
        <ProfileSetup onComplete={handleProfileSetupComplete} />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ED7930" />
              <Text style={styles.loadingText}>Setting up your profile...</Text>
            </View>
          </View>
        )}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                user.photoUrl ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
            }}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{user.name}</Text>
            <TouchableOpacity onPress={handleEditName}>
              <Edit2 size={18} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Main Settings Buttons */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateToSettings("notifications")}
          >
            <View style={styles.menuItemContent}>
              <Bell size={24} color="#4B5563" />
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Notification Settings</Text>
                <Text style={styles.menuItemDescription}>
                  Manage your notification preferences
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateToSettings("app-settings")}
          >
            <View style={styles.menuItemContent}>
              <Settings size={24} color="#4B5563" />
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>App Settings</Text>
                <Text style={styles.menuItemDescription}>
                  Customize your app experience
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateToSettings("terms")}
          >
            <View style={styles.menuItemContent}>
              <FileText size={24} color="#4B5563" />
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Terms & Conditions</Text>
                <Text style={styles.menuItemDescription}>
                  Read our terms of service
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateToSettings("help")}
          >
            <View style={styles.menuItemContent}>
              <HelpCircle size={24} color="#4B5563" />
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Help & Support</Text>
                <Text style={styles.menuItemDescription}>
                  Get assistance with the app
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/feature-requests")}
          >
            <View style={styles.menuItemContent}>
              <FileText size={24} color="#4B5563" />
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Feature Requests</Text>
                <Text style={styles.menuItemDescription}>
                  Suggest and vote on new features
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={signOut}>
            <View style={styles.menuItemContent}>
              <LogOut size={24} color="#EF4444" />
              <View style={styles.menuItemTextContainer}>
                <Text style={[styles.menuItemText, { color: "#EF4444" }]}>
                  Sign Out
                </Text>
                <Text style={styles.menuItemDescription}>
                  Log out of your account
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Social Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          <Text style={styles.sectionSubtitle}>
            Follow us for updates and tips
          </Text>

          <View style={styles.socialLinksContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#E1306C" }]}
              onPress={() => handleSocialLink("instagram")}
            >
              <Instagram size={24} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#1DA1F2" }]}
              onPress={() => handleSocialLink("twitter")}
            >
              <Twitter size={24} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#FF0000" }]}
              onPress={() => handleSocialLink("youtube")}
            >
              <Youtube size={24} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#4267B2" }]}
              onPress={() => handleSocialLink("facebook")}
            >
              <Facebook size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Doable v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editNameModalVisible}
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>

            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditNameModalVisible(false)}
              >
                <X size={20} color="#4B5563" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveName}
              >
                <Check size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
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
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#F3F4F6",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 8,
  },
  userEmail: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  socialLinksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    marginLeft: 8,
  },
});
