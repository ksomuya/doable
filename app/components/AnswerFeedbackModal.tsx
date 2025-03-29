import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { CheckCircle, XCircle, Eye, ArrowRight } from "lucide-react-native";

interface AnswerFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  isCorrect: boolean;
  explanation: string;
  correctAnswer: string;
  hint?: string;
  onTryAgain?: () => void;
  onSeeAnswer?: () => void;
  onNextQuestion?: () => void;
  attemptCount: number;
}

const AnswerFeedbackModal = ({
  visible,
  onClose,
  isCorrect,
  explanation,
  correctAnswer,
  hint,
  onTryAgain,
  onSeeAnswer,
  onNextQuestion,
  attemptCount,
}: AnswerFeedbackModalProps) => {
  const showHint = !isCorrect && attemptCount === 1 && hint;
  const showAnswer = !isCorrect && attemptCount >= 2;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                isCorrect ? styles.correctContainer : styles.incorrectContainer,
              ]}
            >
              <View style={styles.header}>
                {isCorrect ? (
                  <CheckCircle size={24} color="#10B981" />
                ) : (
                  <XCircle size={24} color="#EF4444" />
                )}
                <Text
                  style={[
                    styles.title,
                    isCorrect ? styles.correctTitle : styles.incorrectTitle,
                  ]}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </Text>
              </View>

              <ScrollView style={styles.content}>
                {showHint ? (
                  <View style={styles.hintContainer}>
                    <Text style={styles.hintTitle}>Hint:</Text>
                    <Text style={styles.hintText}>{hint}</Text>
                  </View>
                ) : showAnswer ? (
                  <>
                    <View style={styles.answerContainer}>
                      <Text style={styles.answerTitle}>Correct Answer:</Text>
                      <Text style={styles.answerText}>{correctAnswer}</Text>
                    </View>
                    <View style={styles.explanationContainer}>
                      <Text style={styles.explanationTitle}>Explanation:</Text>
                      <Text style={styles.explanationText}>{explanation}</Text>
                    </View>
                  </>
                ) : isCorrect ? (
                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanationTitle}>Explanation:</Text>
                    <Text style={styles.explanationText}>{explanation}</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.buttonContainer}>
                {showHint && onTryAgain && (
                  <TouchableOpacity
                    style={styles.tryAgainButton}
                    onPress={onTryAgain}
                  >
                    <Text style={styles.tryAgainButtonText}>Try Again</Text>
                  </TouchableOpacity>
                )}

                {!isCorrect && attemptCount === 1 && onSeeAnswer && (
                  <TouchableOpacity
                    style={styles.seeAnswerButton}
                    onPress={onSeeAnswer}
                  >
                    <Eye size={16} color="#4B5563" />
                    <Text style={styles.seeAnswerButtonText}>See Answer</Text>
                  </TouchableOpacity>
                )}

                {(isCorrect || showAnswer) && onNextQuestion && (
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={onNextQuestion}
                  >
                    <Text style={styles.nextButtonText}>Next Question</Text>
                    <ArrowRight size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
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
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "70%",
  },
  correctContainer: {
    borderTopWidth: 4,
    borderTopColor: "#10B981",
  },
  incorrectContainer: {
    borderTopWidth: 4,
    borderTopColor: "#EF4444",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
  },
  correctTitle: {
    color: "#10B981",
  },
  incorrectTitle: {
    color: "#EF4444",
  },
  content: {
    maxHeight: 300,
  },
  hintContainer: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  answerContainer: {
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
    lineHeight: 20,
  },
  explanationContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tryAgainButton: {
    flex: 1,
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  tryAgainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  seeAnswerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  seeAnswerButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default AnswerFeedbackModal;
