import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import PenguinImage from "./PenguinImage";

const { width } = Dimensions.get('window');

const VirtualPet = () => {
  const { user } = useAppContext();
  
  // Memoize this calculation to avoid unnecessary recomputation
  const userName = useMemo(() => {
    return user.firstName || (user.name ? user.name.split(" ")[0] : "there");
  }, [user.firstName, user.name]);

  return (
    <View style={styles.container}>
      <View style={styles.petWrapper}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Hi, {userName}!
          </Text>
          <View style={styles.speechTailBorder} />
          <View style={styles.speechTail} />
        </View>
        
        <View style={styles.penguinContainer}>
          <PenguinImage 
            size={160} 
            animation="waving" 
            loop={true}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  petWrapper: {
    position: "relative",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  penguinContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  speechBubble: {
    position: "absolute",
    top: 5,
    left: -15,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  speechText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  speechTailBorder: {
    position: "absolute",
    bottom: -13,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 14,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#E5E7EB",
  },
  speechTail: {
    position: "absolute",
    bottom: -11,
    right: 21,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#F9FAFB",
  },
});

export default React.memo(VirtualPet);
