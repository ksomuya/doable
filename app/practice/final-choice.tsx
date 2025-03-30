import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { Home, BookOpen, ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";
import { useAppContext } from "../context/AppContext";
import { spacing, typography, colors, buttonStyles, layoutStyles, cardStyles, getShadow } from "../styles/designSystem";

interface CustomStyles {
  content: ViewStyle;
  image: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle; 
  optionsContainer: ViewStyle;
  optionCard: ViewStyle;
  optionIconContainer: ViewStyle;
  optionContent: ViewStyle;
  optionTitle: TextStyle;
  optionDescription: TextStyle;
}

const FinalChoiceScreen = () => {
  const router = useRouter();
  
  const handleGoHome = () => {
    router.push("/");
  };
  
  const handleStartNewSession = () => {
    router.push("/practice/goal");
  };
  
  return (
    <SafeAreaView style={layoutStyles.safeArea}>
      <View style={styles.content}>
        <Image
          source={{
            uri: "https://cdn.jsdelivr.net/gh/duolingo/images@master/owl-trophy.png",
          }}
          style={styles.image}
          contentFit="contain"
        />
        
        <Text style={styles.title}>Great Work!</Text>
        <Text style={styles.subtitle}>
          You've completed your practice session. What would you like to do next?
        </Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={handleStartNewSession}
          >
            <View style={styles.optionIconContainer}>
              <BookOpen size={24} color={colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Start a New Practice Session</Text>
              <Text style={styles.optionDescription}>
                Choose a new subject and continue improving your skills
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={handleGoHome}
          >
            <View style={styles.optionIconContainer}>
              <Home size={24} color={colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Go to Home Page</Text>
              <Text style={styles.optionDescription}>
                Return to the main dashboard and explore other activities
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<CustomStyles>({
  content: {
    flex: 1,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    color: colors.textDark,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textMedium,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  optionsContainer: {
    width: "100%",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    ...getShadow(1),
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E5F8D9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.bodyBold.fontSize,
    fontWeight: typography.bodyBold.fontWeight,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.textLight,
  },
});

export default FinalChoiceScreen; 