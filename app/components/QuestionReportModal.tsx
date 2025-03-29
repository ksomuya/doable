import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { Flag, X, Send } from "lucide-react-native";

interface QuestionReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  questionId: string;
}

const QuestionReportModal = ({
  visible,
  onClose,
  onSubmit,
  questionId,
}: QuestionReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");

  const reportReasons = [
    "Incorrect answer",
    "Confusing question",
    "Typo or grammatical error",
    "Duplicate question",
    "Inappropriate content",
    "Other",
  ];

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason, details);
      // Reset form
      setSelectedReason(null);
      setDetails("");
      onClose();
    }
  };

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
                <Flag size={20} color="#EF4444" />
                <Text style={styles.title}>Report Question</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Please let us know why you're reporting this question
              </Text>

              <View style={styles.reasonsContainer}>
                {reportReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonItem,
                      selectedReason === reason && styles.selectedReason,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text
                      style={[
                        styles.reasonText,
                        selectedReason === reason && styles.selectedReasonText,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.detailsInput}
                placeholder="Additional details (optional)"
                multiline
                numberOfLines={4}
                value={details}
                onChangeText={setDetails}
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !selectedReason && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={!selectedReason}
              >
                <Send size={16} color="white" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>

              <Text style={styles.questionIdText}>
                Question ID: {questionId}
              </Text>
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
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 16,
  },
  reasonsContainer: {
    marginBottom: 16,
  },
  reasonItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedReason: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  reasonText: {
    fontSize: 14,
    color: "#4B5563",
  },
  selectedReasonText: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  questionIdText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 16,
  },
});

export default QuestionReportModal;
