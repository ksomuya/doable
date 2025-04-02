import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image as RNImage,
  Dimensions,
} from "react-native";
import { useAppContext } from "../context/AppContext";

const { width } = Dimensions.get('window');

const VirtualPet = () => {
  const { user } = useAppContext();
  const userName = user.firstName || (user.name ? user.name.split(" ")[0] : "there");

  return (
    <View style={styles.container}>
      <View style={styles.petWrapper}>
        <RNImage
          source={require("../../assets/images/penguine.svg")}
          style={styles.penguinImage}
          onError={() => console.log("Failed to load penguin image")}
        />
        
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Hi, {userName}!
          </Text>
          <View style={styles.speechTail} />
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
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  penguinImage: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  speechBubble: {
    position: "absolute",
    top: 10,
    right: -10,
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
});

export default VirtualPet;
