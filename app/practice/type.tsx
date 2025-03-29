import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";

const PracticeTypeScreen = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>("refine");

  const practiceTypes = [
    {
      id: "refine",
      title: "Refine",
      description: "Strengthen your weak areas",
      iconSymbol: "⟲",
      color: "#E0E7FF",
    },
    {
      id: "recall",
      title: "Recall",
      description: "Sharpen your skills with balanced practice",
      iconSymbol: "⇄",
      color: "#FEF3C7",
    },
    {
      id: "conquer",
      title: "Conquer",
      description: "Test your limits with challenging problems",
      iconSymbol: "⏋",
      color: "#EDE9FE",
    },
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleContinue = () => {
    if (!selectedType) return;

    router.push("/practice/goal");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Type</Text>
        <Text style={styles.subtitle}>
          Select what you want to focus upon in this practice session
        </Text>

        <View style={styles.typesContainer}>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                { backgroundColor: practiceTypes[0].color },
                selectedType === practiceTypes[0].id && styles.selectedTypeCard,
              ]}
              onPress={() => handleTypeSelect(practiceTypes[0].id)}
            >
              <View style={styles.typeHeader}>
                <Text style={styles.typeTitle}>{practiceTypes[0].title}</Text>
                {selectedType === practiceTypes[0].id && (
                  <View style={styles.checkContainer}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text style={styles.typeDescription}>
                {practiceTypes[0].description}
              </Text>
              <View style={styles.iconContainer}>
                <Text style={styles.iconPlaceholder}>
                  {practiceTypes[0].iconSymbol}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                { backgroundColor: practiceTypes[1].color },
                selectedType === practiceTypes[1].id && styles.selectedTypeCard,
              ]}
              onPress={() => handleTypeSelect(practiceTypes[1].id)}
            >
              <View style={styles.typeHeader}>
                <Text style={styles.typeTitle}>{practiceTypes[1].title}</Text>
                {selectedType === practiceTypes[1].id && (
                  <View style={styles.checkContainer}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text style={styles.typeDescription}>
                {practiceTypes[1].description}
              </Text>
              <View style={styles.iconContainer}>
                <Text style={styles.iconPlaceholder}>
                  {practiceTypes[1].iconSymbol}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.typeCard,
              styles.singleTypeCard,
              { backgroundColor: practiceTypes[2].color },
              selectedType === practiceTypes[2].id && styles.selectedTypeCard,
            ]}
            onPress={() => handleTypeSelect(practiceTypes[2].id)}
          >
            <View style={styles.typeHeader}>
              <Text style={styles.typeTitle}>{practiceTypes[2].title}</Text>
              {selectedType === practiceTypes[2].id && (
                <View style={styles.checkContainer}>
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.typeDescription}>
              {practiceTypes[2].description}
            </Text>
            <View style={styles.iconContainer}>
              <Text style={styles.iconPlaceholder}>
                {practiceTypes[2].iconSymbol}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginHorizontal: 12,
  },
  progressFill: {
    width: "66%",
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  typesContainer: {
    gap: 16,
  },
  typeRow: {
    flexDirection: "row",
    gap: 16,
  },
  typeCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    height: 160,
    justifyContent: "space-between",
  },
  singleTypeCard: {
    marginTop: 16,
  },
  selectedTypeCard: {
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  typeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  typeDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 8,
  },
  iconContainer: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
    flex: 1,
  },
  iconPlaceholder: {
    fontSize: 32,
    color: "#4B5563",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PracticeTypeScreen;
