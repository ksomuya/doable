import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import { useAppContext } from "../context/AppContext";
import { LogOut } from "lucide-react-native";

interface SignOutButtonProps {
  color?: string;
  textColor?: string;
  showIcon?: boolean;
}

export const SignOutButton = ({
  color = "#EF4444",
  textColor = "#FFFFFF",
  showIcon = true,
}: SignOutButtonProps) => {
  const { signOut: clerkSignOut } = useClerk();
  const { signOut: appSignOut } = useAppContext();

  const handleSignOut = async () => {
    try {
      await clerkSignOut();
      appSignOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={handleSignOut}
    >
      {showIcon && <LogOut size={20} color={textColor} style={styles.icon} />}
      <Text style={[styles.text, { color: textColor }]}>Sign Out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SignOutButton;
