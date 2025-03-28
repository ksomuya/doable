import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAppContext } from "../context/AppContext";

interface VirtualPetProps {
  onPetInteract?: () => void;
  temperature?: number;
}

const VirtualPet = ({
  onPetInteract = () => {},
  temperature = 30,
}: VirtualPetProps) => {
  const { user } = useAppContext();
  const rotation = useSharedValue(20);

  const isDistressed = temperature > 50;
  const isWarning = temperature > 20 && temperature <= 50;

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(-10, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, []);

  const animatedWingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPetInteract}
        style={[
          styles.petContainer,
          isDistressed
            ? styles.hotBackground
            : isWarning
              ? styles.warmBackground
              : styles.coldBackground,
        ]}
      >
        {isDistressed && (
          <View style={styles.warningBubble}>
            <Text style={styles.warningText}>Too hot!</Text>
          </View>
        )}

        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Hi, {user.firstName || user.name.split(" ")[0]}!
          </Text>
          <View style={styles.speechTail} />
        </View>

        <View style={styles.pet}>
          <View style={styles.penguinBody}>
            <View style={styles.penguinHead}>
              <View style={styles.penguinFace}>
                <View style={styles.eyes}>
                  <View style={styles.eye} />
                  <View style={styles.eye} />
                </View>
                <View style={styles.blush} />
                <View style={styles.blushRight} />
                <View style={styles.beak} />
              </View>
            </View>

            <View style={styles.wings}>
              <Animated.View style={[styles.wing, animatedWingStyle]} />
              <View style={styles.wing} />
            </View>

            <View style={styles.feet}>
              <View style={styles.foot} />
              <View style={styles.foot} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
  },
  coldBackground: {
    backgroundColor: "#DBEAFE",
  },
  warmBackground: {
    backgroundColor: "#FEF3C7",
  },
  hotBackground: {
    backgroundColor: "#FEE2E2",
  },
  warningBubble: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  warningText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
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
  },
  penguinBody: {
    alignItems: "center",
  },
  penguinHead: {
    width: 90,
    height: 90,
    backgroundColor: "#1E293B",
    borderRadius: 45,
  },
  penguinFace: {
    width: 70,
    height: 70,
    backgroundColor: "white",
    borderRadius: 35,
    marginTop: 10,
    alignItems: "center",
  },
  eyes: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 40,
    marginTop: 8,
  },
  eye: {
    width: 10,
    height: 10,
    backgroundColor: "black",
    borderRadius: 5,
  },
  blush: {
    width: 8,
    height: 8,
    backgroundColor: "#F87171",
    borderRadius: 4,
    position: "absolute",
    left: 10,
    bottom: 20,
  },
  blushRight: {
    width: 8,
    height: 8,
    backgroundColor: "#F87171",
    borderRadius: 4,
    position: "absolute",
    right: 10,
    bottom: 20,
  },
  beak: {
    width: 12,
    height: 8,
    backgroundColor: "#F59E0B",
    borderRadius: 4,
  },
  wings: {
    flexDirection: "row",
    width: 100,
  },
  wing: {
    width: 25,
    height: 50,
    backgroundColor: "#1E293B",
    borderRadius: 12,
  },
  feet: {
    flexDirection: "row",
    width: 60,
  },
  foot: {
    width: 16,
    height: 8,
    backgroundColor: "#F59E0B",
    borderRadius: 4,
  },
});

export default VirtualPet;
