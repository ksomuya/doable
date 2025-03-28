import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Thermometer, Snowflake, ArrowDown } from "lucide-react-native";

interface TemperatureAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  temperature: number;
  snowballs: number;
  onAdjustTemperature: () => void;
  adjustmentCost: number;
}

const TemperatureAdjustmentModal = ({
  visible,
  onClose,
  temperature,
  snowballs,
  onAdjustTemperature,
  adjustmentCost = 50,
}: TemperatureAdjustmentModalProps) => {
  const getTemperatureColor = (temp: number) => {
    if (temp <= 20) return "#3B82F6"; // Blue - optimal
    if (temp <= 50) return "#FBBF24"; // Yellow - warning
    return "#EF4444"; // Red - critical
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp <= 20) return "Optimal";
    if (temp <= 50) return "Warning";
    return "Critical";
  };

  const canAffordAdjustment = snowballs >= adjustmentCost;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Thermometer
                  size={24}
                  color={getTemperatureColor(temperature)}
                />
                <Text style={styles.title}>Temperature Control</Text>
              </View>

              <View style={styles.temperatureDisplay}>
                <Text
                  style={[
                    styles.temperatureValue,
                    { color: getTemperatureColor(temperature) },
                  ]}
                >
                  {temperature}°
                </Text>
                <Text
                  style={[
                    styles.temperatureStatus,
                    { color: getTemperatureColor(temperature) },
                  ]}
                >
                  {getTemperatureStatus(temperature)}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Your penguin needs cold temperatures to thrive! Use snowballs
                  to cool down the environment.
                </Text>
              </View>

              <View style={styles.costContainer}>
                <Text style={styles.costLabel}>Cost to reduce by 20°:</Text>
                <View style={styles.snowballCost}>
                  <Snowflake size={20} color="#3B82F6" />
                  <Text style={styles.costValue}>{adjustmentCost}</Text>
                </View>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Your balance:</Text>
                <View style={styles.snowballBalance}>
                  <Snowflake size={20} color="#3B82F6" />
                  <Text style={styles.balanceValue}>{snowballs}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  !canAffordAdjustment && styles.disabledButton,
                ]}
                onPress={onAdjustTemperature}
                disabled={!canAffordAdjustment}
              >
                <ArrowDown size={20} color="white" />
                <Text style={styles.adjustButtonText}>Cool Down</Text>
              </TouchableOpacity>

              {!canAffordAdjustment && (
                <Text style={styles.insufficientFunds}>
                  Not enough snowballs!
                </Text>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#1F2937",
  },
  temperatureDisplay: {
    alignItems: "center",
    marginBottom: 20,
  },
  temperatureValue: {
    fontSize: 48,
    fontWeight: "bold",
  },
  temperatureStatus: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 5,
  },
  infoContainer: {
    backgroundColor: "#EFF6FF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    color: "#1E40AF",
    textAlign: "center",
    lineHeight: 20,
  },
  costContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  costLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  snowballCost: {
    flexDirection: "row",
    alignItems: "center",
  },
  costValue: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
    color: "#3B82F6",
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  snowballBalance: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
    color: "#3B82F6",
  },
  adjustButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
    marginBottom: 10,
  },
  adjustButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  insufficientFunds: {
    color: "#EF4444",
    fontSize: 14,
    marginBottom: 10,
  },
  closeButton: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#6B7280",
    fontSize: 16,
  },
});

export default TemperatureAdjustmentModal;
