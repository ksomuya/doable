import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image as RNImage,
} from "react-native";
import { useAppContext } from "../context/AppContext";

const VirtualPet = () => {
  const { user } = useAppContext();

  return (
    <View style={styles.container}>
      <View style={styles.petContainer}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Hi,{" "}
            {user.firstName || (user.name ? user.name.split(" ")[0] : "there")}!
          </Text>
          <View style={styles.speechTail} />
        </View>

        <View style={styles.pet}>
          <RNImage
            source={require("../../assets/images/penguine.svg")}
            style={styles.penguinImage}
            onError={() => console.log("Failed to load penguin image")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  petContainer: {
    width: "100%",
    aspectRatio: 2,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: "#DBEAFE",
  },
  speechBubble: {
    position: "absolute",
    top: 40,
    right: 80,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  speechText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  speechTail: {
    position: "absolute",
    bottom: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderTopColor: "white",
  },
  pet: {
    alignItems: "center",
    justifyContent: "center",
  },
  penguinImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
});

export default VirtualPet;
