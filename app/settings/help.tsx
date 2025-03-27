import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Mail,
  MessageSquare,
} from "lucide-react-native";

export default function HelpScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleBackPress = () => {
    router.back();
  };

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const handleSendFeedback = () => {
    if (feedbackMessage.trim() === "") {
      Alert.alert(
        "Empty Feedback",
        "Please enter your feedback before submitting.",
      );
      return;
    }

    // In a real app, this would send the feedback to your backend
    Alert.alert(
      "Feedback Sent",
      "Thank you for your feedback! We appreciate your input.",
      [{ text: "OK", onPress: () => setFeedbackMessage("") }],
    );
  };

  const faqs = [
    {
      question: "How do I track my study progress?",
      answer:
        "You can track your study progress through the home screen dashboard. It shows your daily streak, completed chapters, and overall performance metrics. You can also view detailed reports in the Reports section.",
    },
    {
      question: "How do I customize my practice sessions?",
      answer:
        "To customize your practice sessions, go to the Practice screen and select 'Custom Test'. From there, you can choose specific subjects, set time limits, and adjust the difficulty level according to your preferences.",
    },
    {
      question: "Can I use Doable offline?",
      answer:
        "Yes, many features of Doable work offline. You can download practice questions and study materials for offline use. However, some features like leaderboards and syncing progress across devices require an internet connection.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "To reset your password, go to the login screen and tap on 'Forgot Password'. Enter your registered email address, and we'll send you instructions to reset your password. If you're still having trouble, contact our support team.",
    },
    {
      question: "How does the virtual pet feature work?",
      answer:
        "Your virtual pet grows and evolves as you study and complete practice sessions. Regular study sessions increase your pet's health and happiness. You can interact with your pet on the home screen, and it will provide motivation and encouragement for your studies.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>

          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFaq(index)}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                {expandedFaq === index ? (
                  <ChevronUp size={20} color="#6B7280" />
                ) : (
                  <ChevronDown size={20} color="#6B7280" />
                )}
              </TouchableOpacity>

              {expandedFaq === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Contact Support</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Need more help? Our support team is ready to assist you.
          </Text>

          <TouchableOpacity style={styles.supportButton}>
            <Mail size={20} color="#FFFFFF" />
            <Text style={styles.supportButtonText}>Email Support</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Send Feedback</Text>
          </View>

          <Text style={styles.sectionDescription}>
            We value your feedback! Let us know how we can improve Doable.
          </Text>

          <TextInput
            style={styles.feedbackInput}
            placeholder="Type your feedback here..."
            multiline
            numberOfLines={4}
            value={feedbackMessage}
            onChangeText={setFeedbackMessage}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendFeedback}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.sendButtonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoText}>Doable v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2023 Doable Education</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#F3F4F6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 24,
  },
  faqItem: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  answerText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  appInfoSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
});
