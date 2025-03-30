import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, CheckCircle, Search } from "lucide-react-native";
import { colors, typography, spacing, buttonStyles } from "../styles/designSystem";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock data for installed apps (in a real app, this would come from native module)
const MOCK_APPS = [
  {
    id: 'com.instagram.android',
    name: 'Instagram',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png',
  },
  {
    id: 'com.facebook.katana',
    name: 'Facebook',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  },
  {
    id: 'com.twitter.android',
    name: 'Twitter',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/2491px-Logo_of_Twitter.svg.png',
  },
  {
    id: 'com.zhiliaoapp.musically',
    name: 'TikTok',
    icon: 'https://static.vecteezy.com/system/resources/previews/014/414/683/original/tiktok-logo-transparent-free-png.png',
  },
  {
    id: 'com.snapchat.android',
    name: 'Snapchat',
    icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Snapchat_logo.svg/1200px-Snapchat_logo.svg.png',
  },
  {
    id: 'com.reddit.frontpage',
    name: 'Reddit',
    icon: 'https://www.redditinc.com/assets/images/site/reddit-logo.png',
  },
  {
    id: 'com.discord',
    name: 'Discord',
    icon: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
  },
  {
    id: 'com.whatsapp',
    name: 'WhatsApp',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/767px-WhatsApp.svg.png',
  },
  {
    id: 'com.netflix.mediaclient',
    name: 'Netflix',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Netflix_icon.svg/2048px-Netflix_icon.svg.png',
  },
  {
    id: 'com.amazon.avod.thirdpartyclient',
    name: 'Prime Video',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Amazon_Prime_Video_logo.svg/2048px-Amazon_Prime_Video_logo.svg.png',
  },
];

export default function AppSelectionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [installedApps, setInstalledApps] = useState(MOCK_APPS);

  useEffect(() => {
    // In a real app, you would use a native module to get the list of installed apps
    // For now, we'll use the mock data with a simulated delay
    const fetchInstalledApps = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retrieve previously selected apps from storage
        const savedSelectedApps = await AsyncStorage.getItem('blockedApps');
        if (savedSelectedApps) {
          setSelectedApps(JSON.parse(savedSelectedApps));
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching installed apps:", error);
        setLoading(false);
      }
    };

    fetchInstalledApps();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const toggleAppSelection = (appId: string) => {
    setSelectedApps(prev => {
      if (prev.includes(appId)) {
        return prev.filter(id => id !== appId);
      } else {
        return [...prev, appId];
      }
    });
  };

  const handleSave = async () => {
    try {
      if (selectedApps.length === 0) {
        Alert.alert(
          "No Apps Selected",
          "Please select at least one app to block.",
          [{ text: "OK" }]
        );
        return;
      }

      // Save selected apps to storage
      await AsyncStorage.setItem('blockedApps', JSON.stringify(selectedApps));
      
      // Show success message
      Alert.alert(
        "Success",
        "Your distraction blocker is now set up. You'll receive mindful reminders when opening these apps.",
        [
          { 
            text: "OK", 
            onPress: () => router.push("/") 
          }
        ]
      );
    } catch (error) {
      console.error("Error saving blocked apps:", error);
      Alert.alert("Error", "Failed to save your settings. Please try again.");
    }
  };

  const renderAppItem = ({ item }: { item: typeof MOCK_APPS[0] }) => {
    const isSelected = selectedApps.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.appItem, isSelected && styles.appItemSelected]} 
        onPress={() => toggleAppSelection(item.id)}
      >
        <Image source={{ uri: item.icon }} style={styles.appIcon} />
        <Text style={styles.appName}>{item.name}</Text>
        <View style={styles.checkboxContainer}>
          {isSelected && <CheckCircle size={24} color={colors.primary} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Apps to Block</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Instructions */}
        <Text style={styles.instructions}>
          Select apps that distract you during study time. You'll get mindful reminders when opening them.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Scanning installed apps...</Text>
          </View>
        ) : (
          <FlatList
            data={installedApps}
            renderItem={renderAppItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.appList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Footer with Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            selectedApps.length === 0 && styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={selectedApps.length === 0}
        >
          <Text style={styles.saveButtonText}>
            Save {selectedApps.length > 0 ? `(${selectedApps.length} Selected)` : ''}
          </Text>
          <Check size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.subtitle,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  instructions: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  appList: {
    paddingBottom: spacing.xl,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  appItemSelected: {
    backgroundColor: `${colors.primary}10`, // Light green background with 10% opacity
    borderColor: colors.primary,
    borderWidth: 1,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  appName: {
    ...typography.bodyBold,
    flex: 1,
  },
  checkboxContainer: {
    width: 30,
    alignItems: "center",
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  saveButton: {
    ...buttonStyles.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  saveButtonText: {
    ...typography.button,
    marginRight: spacing.sm,
  },
}); 