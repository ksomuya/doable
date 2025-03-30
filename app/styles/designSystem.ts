// Design System for standardized UI
import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from "react-native";

// Spacing (multiples of 8)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const typography: Record<string, TextStyle> = {
  largeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600", 
    color: "#1F2937",
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    color: "#4B4B4B",
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B4B4B",
  },
  caption: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
};

// Colors
export const colors = {
  // Brand colors
  primary: "#58CC02",
  primaryDark: "#45a800",
  secondary: "#4F46E5",
  secondaryDark: "#3c35c5",
  accent: "#FF9500",
  
  // Text colors
  textDark: "#1F2937",
  textMedium: "#4B4B4B",  
  textLight: "#6B7280",
  
  // Background colors
  background: "#FFFFFF",
  backgroundSecondary: "#F9FAFB",
  backgroundTertiary: "#F3F4F6",
  
  // Utility colors
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#6366F1",
  
  // Border colors
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  
  // Misc
  disabled: "#D1D5DB",
  overlay: "rgba(0, 0, 0, 0.5)",
};

interface ButtonStyles {
  primary: ViewStyle;
  secondary: ViewStyle;
  outline: ViewStyle;
  text: TextStyle;
  icon: ViewStyle;
  disabled: ViewStyle;
}

// Common component styles
export const buttonStyles = StyleSheet.create<ButtonStyles>({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  outline: {
    backgroundColor: "transparent",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: spacing.sm,
  },
  icon: {
    marginLeft: spacing.sm,
  },
  disabled: {
    backgroundColor: colors.disabled,
  },
});

interface CardStyles {
  container: ViewStyle;
  title: TextStyle;
}

export const cardStyles = StyleSheet.create<CardStyles>({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    ...typography.subtitle,
    marginBottom: spacing.md,
  },
});

interface FormStyles {
  input: ViewStyle & TextStyle;
  label: TextStyle;
  inputGroup: ViewStyle;
}

export const formStyles = StyleSheet.create<FormStyles>({
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textDark,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
});

interface LayoutStyles {
  container: ViewStyle;
  safeArea: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  footer: ViewStyle;
}

export const layoutStyles = StyleSheet.create<LayoutStyles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

// Helper for creating consistent shadows
export const getShadow = (elevation = 1): ViewStyle => {
  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: 0.1,
    shadowRadius: elevation * 2,
    elevation: elevation,
  };
};

export default {
  spacing,
  typography,
  colors,
  buttonStyles,
  cardStyles,
  formStyles,
  layoutStyles,
  getShadow,
}; 