import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Check, 
  CheckCircle, 
  Search, 
  Shield,
  RefreshCw,
  Filter
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');

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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  const appItemAnimations = useRef(
    MOCK_APPS.map(() => new Animated.Value(0))
  ).current;

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
        
        // Start animations after loading
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Staggered item animations
        Animated.stagger(50, 
          appItemAnimations.map(anim => 
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            })
          )
        ).start();
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
      
      // Show success message with custom UI
      Alert.alert(
        "Setup Complete",
        "Your focus mode is now active. You'll receive mindful reminders when opening these apps.",
        [
          { 
            text: "Done", 
            onPress: () => router.push("/")
          }
        ]
      );
    } catch (error) {
      console.error("Error saving blocked apps:", error);
      Alert.alert("Error", "Failed to save your settings. Please try again.");
    }
  };

  const renderAppItem = ({ item, index }: { item: typeof MOCK_APPS[0]; index: number }) => {
    const isSelected = selectedApps.includes(item.id);
    
    return (
      <Animated.View
        style={{
          opacity: appItemAnimations[index],
          transform: [{ 
            translateY: appItemAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            }) 
          }]
        }}
      >
        <TouchableOpacity 
          style={[styles.appItem, isSelected && styles.appItemSelected]} 
          onPress={() => toggleAppSelection(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.appIconContainer}>
            <Image source={{ uri: item.icon }} style={styles.appIcon} />
          </View>
          <Text style={styles.appName}>{item.name}</Text>
          <View style={styles.checkboxContainer}>
            {isSelected ? (
              <LinearGradient
                colors={['#6C5CE7', '#4834d4']}
                style={styles.checkboxSelected}
              >
                <CheckCircle size={20} color="white" />
              </LinearGradient>
            ) : (
              <View style={styles.checkbox} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Apps to Block</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header Section with Instructions */}
        <Animated.View
          style={[
            styles.instructionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <LinearGradient
            colors={['#6C5CE7', '#4834d4']}
            style={styles.instructionsIconContainer}
          >
            <Shield size={28} color="white" />
          </LinearGradient>
          <Text style={styles.instructionsTitle}>
            Choose Your Focus Environment
          </Text>
          <Text style={styles.instructions}>
            Select apps that distract you during study time. You'll get mindful reminders when opening them.
          </Text>
        </Animated.View>

        {/* Status Bar */}
        <Animated.View
          style={[
            styles.statusContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressSteps}>
              <View style={[styles.progressStep, styles.progressStepCompleted]}>
                <CheckCircle size={16} color="white" />
              </View>
              <View style={[styles.progressLine, styles.progressLineActive]} />
              <View style={[styles.progressStep, styles.progressStepActive]}>
                <Text style={styles.progressStepText}>2</Text>
              </View>
              <View style={styles.progressLine} />
              <View style={styles.progressStep}>
                <Text style={styles.progressStepText}>3</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.selectionStatus}>
            <Text style={styles.selectionCount}>
              {selectedApps.length} {selectedApps.length === 1 ? 'app' : 'apps'} selected
            </Text>
          </View>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C5CE7" />
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6C5CE7', '#4834d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.buttonGradient,
              selectedApps.length === 0 && { opacity: 0.6 }
            ]}
          >
            <Text style={styles.saveButtonText}>
              Complete Setup {selectedApps.length > 0 ? `(${selectedApps.length})` : ''}
            </Text>
            <Check size={20} color="white" />
          </LinearGradient>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  instructionsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  instructions: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  statusContainer: {
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  progressStepActive: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
  },
  progressStepCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  progressStepText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: "#10B981",
  },
  selectionStatus: {
    alignItems: "center",
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C5CE7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  appList: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appItemSelected: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  appName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  checkboxSelected: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
}); 