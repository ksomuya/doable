import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Slider,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Volume2, Smartphone } from "lucide-react-native";

export default function AppSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    soundEffects: true,
    vibration: true,
    volumeLevel: 0.7,
  });

  const handleBackPress = () => {
    router.back();
  };

  const toggleSwitch = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleVolumeChange = (value) => {
    setSettings((prev) => ({
      ...prev,
      volumeLevel: value,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            Customize your app experience
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Play sounds for achievements and interactions
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
              thumbColor={settings.soundEffects ? "#4F46E5" : "#F3F4F6"}
              onValueChange={() => toggleSwitch("soundEffects")}
              value={settings.soundEffects}
            />
          </View>

          {settings.soundEffects && (
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Volume</Text>
              <View style={styles.sliderRow}>
                <Volume2 size={16} color="#6B7280" />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={settings.volumeLevel}
                  onValueChange={handleVolumeChange}
                  minimumTrackTintColor="#4F46E5"
                  maximumTrackTintColor="#D1D5DB"
                  thumbTintColor="#4F46E5"
                />
                <Volume2 size={24} color="#6B7280" />
              </View>
            </View>
          )}

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Vibration</Text>
              <Text style={styles.settingDescription}>
                Enable haptic feedback for interactions
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
              thumbColor={settings.vibration ? "#4F46E5" : "#F3F4F6"}
              onValueChange={() => toggleSwitch("vibration")}
              value={settings.vibration}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Smartphone size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            These settings affect how the app behaves on your device. Changes
            are saved automatically.
          </Text>
        </View>
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionDescription: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 24,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  sliderContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sliderLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  infoSection: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
