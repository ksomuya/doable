import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

interface VirtualPetProps {
  onPetInteract?: () => void;
}

const VirtualPet = ({
  onPetInteract = () => {},
}: VirtualPetProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onPetInteract}
        style={styles.petContainer}
      >
        <View style={styles.pet}>
          <View style={styles.ears}>
            <View style={styles.ear} />
            <View style={styles.ear} />
          </View>
          <View style={styles.face}>
            <View style={styles.eyes}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            <View style={styles.nose} />
          </View>
          <View style={styles.body} />
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
    backgroundColor: "#FF8C00",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pet: {
    alignItems: "center",
  },
  ears: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 80,
    marginBottom: -5,
  },
  ear: {
    width: 25,
    height: 25,
    backgroundColor: "white",
    borderRadius: 12.5,
  },
  face: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  eyes: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: 60,
    marginBottom: 10,
  },
  eye: {
    width: 12,
    height: 12,
    backgroundColor: "black",
    borderRadius: 6,
  },
  nose: {
    width: 16,
    height: 16,
    backgroundColor: "#FF8C00",
    borderRadius: 8,
  },
  body: {
    width: 80,
    height: 60,
    backgroundColor: "#FF8C00",
    borderRadius: 20,
    marginTop: -20,
  },
});

export default VirtualPet;