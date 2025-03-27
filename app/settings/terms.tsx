import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText } from "lucide-react-native";

export default function TermsScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.termsHeader}>
            <FileText size={24} color="#4F46E5" />
            <Text style={styles.termsTitle}>Terms of Service</Text>
          </View>

          <Text style={styles.lastUpdated}>Last Updated: October 1, 2023</Text>

          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to Doable ("we," "our," or "us"). These Terms of Service
            ("Terms") govern your access to and use of the Doable application,
            including any content, functionality, and services offered on or
            through the application.
          </Text>
          <Text style={styles.paragraph}>
            By accessing or using Doable, you agree to be bound by these Terms.
            If you do not agree to these Terms, you must not access or use the
            application.
          </Text>

          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.paragraph}>
            When you create an account with us, you must provide accurate,
            complete, and current information. You are responsible for
            safeguarding your password and for all activities that occur under
            your account.
          </Text>
          <Text style={styles.paragraph}>
            We reserve the right to disable any user account at any time if, in
            our opinion, you have failed to comply with any provision of these
            Terms.
          </Text>

          <Text style={styles.sectionTitle}>3. User Content</Text>
          <Text style={styles.paragraph}>
            Our application may allow you to create, upload, post, send,
            receive, and store content. When you do so, you retain ownership
            rights in such content, but you grant us a license to use it.
          </Text>
          <Text style={styles.paragraph}>
            You represent and warrant that your content does not violate any
            third-party rights and complies with all applicable laws and
            regulations.
          </Text>

          <Text style={styles.sectionTitle}>4. Prohibited Uses</Text>
          <Text style={styles.paragraph}>
            You may use our application only for lawful purposes and in
            accordance with these Terms. You agree not to use the application:
          </Text>
          <Text style={styles.bulletPoint}>
            • In any way that violates any applicable law or regulation.
          </Text>
          <Text style={styles.bulletPoint}>
            • To transmit any material that is defamatory, obscene, or
            offensive.
          </Text>
          <Text style={styles.bulletPoint}>
            • To impersonate or attempt to impersonate another person or entity.
          </Text>
          <Text style={styles.bulletPoint}>
            • To engage in any conduct that restricts or inhibits anyone's use
            of the application.
          </Text>

          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The application and its entire contents, features, and functionality
            are owned by Doable, its licensors, or other providers and are
            protected by copyright, trademark, and other intellectual property
            laws.
          </Text>

          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to the
            application at our sole discretion, without notice, for any reason,
            including if you breach these Terms.
          </Text>

          <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            The application is provided on an "as is" and "as available" basis,
            without any warranties of any kind, either express or implied.
          </Text>

          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event will we be liable for damages of any kind arising from
            the use of the application, including but not limited to direct,
            indirect, incidental, and consequential damages.
          </Text>

          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may revise these Terms at any time by updating this page. Your
            continued use of the application following the posting of revised
            Terms means you accept the changes.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at
            support@doableapp.com.
          </Text>
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
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 16,
  },
});
