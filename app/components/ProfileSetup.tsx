import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  User,
} from "lucide-react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  parentMobile: string;
}

interface ProfileSetupProps {
  onComplete?: (profileData: ProfileData) => void;
}

const ProfileSetup = ({ onComplete = () => {} }: ProfileSetupProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    parentMobile: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    parentMobile: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const steps = [
    {
      title: "What's your name?",
      description: "Please enter your full name",
      fields: ["firstName", "lastName"],
    },
    {
      title: "When were you born?",
      description: "Your date of birth helps us personalize your experience",
      fields: ["dateOfBirth"],
    },
    {
      title: "Parent's contact information",
      description: "We'll send progress reports to this number",
      fields: ["parentMobile"],
    },
  ];

  const validateStep = () => {
    const currentFields = steps[currentStep].fields;
    const newErrors = { ...errors };
    let isValid = true;

    currentFields.forEach((field) => {
      if (field === "firstName" && !profileData.firstName.trim()) {
        newErrors.firstName = "First name is required";
        isValid = false;
      } else if (field === "firstName" && profileData.firstName.trim()) {
        newErrors.firstName = "";
      }

      if (field === "lastName" && !profileData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
        isValid = false;
      } else if (field === "lastName" && profileData.lastName.trim()) {
        newErrors.lastName = "";
      }

      if (field === "dateOfBirth" && !profileData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
        isValid = false;
      } else if (field === "dateOfBirth" && profileData.dateOfBirth) {
        newErrors.dateOfBirth = "";
      }

      if (field === "parentMobile" && !profileData.parentMobile.trim()) {
        newErrors.parentMobile = "Parent's mobile number is required";
        isValid = false;
      } else if (field === "parentMobile" && profileData.parentMobile.trim()) {
        // Simple phone validation - can be enhanced
        if (!/^\d{10}$/.test(profileData.parentMobile.trim())) {
          newErrors.parentMobile =
            "Please enter a valid 10-digit mobile number";
          isValid = false;
        } else {
          newErrors.parentMobile = "";
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(profileData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });

    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const handleDateChange = (selectedDate: Date) => {
    handleInputChange("dateOfBirth", selectedDate);
    setShowDatePicker(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <User size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={profileData.firstName}
            onChangeText={(text) => handleInputChange("firstName", text)}
          />
        </View>
        {errors.firstName ? (
          <Text style={styles.errorText}>{errors.firstName}</Text>
        ) : null}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <User size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={profileData.lastName}
            onChangeText={(text) => handleInputChange("lastName", text)}
          />
        </View>
        {errors.lastName ? (
          <Text style={styles.errorText}>{errors.lastName}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderDateOfBirthStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Calendar size={20} color="#6B7280" />
        <Text style={styles.datePickerText}>
          {profileData.dateOfBirth
            ? formatDate(profileData.dateOfBirth)
            : "Select Date of Birth"}
        </Text>
      </TouchableOpacity>
      {errors.dateOfBirth ? (
        <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
      ) : null}

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handleDateChange(profileData.dateOfBirth || new Date())
              }
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerContent}>
            {/* Custom date picker UI */}
            <View style={styles.customDatePicker}>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => handleDateChange(new Date(2000, 0, 1))}
              >
                <Text style={styles.dateOptionText}>Jan 1, 2000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => handleDateChange(new Date(2001, 0, 1))}
              >
                <Text style={styles.dateOptionText}>Jan 1, 2001</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => handleDateChange(new Date(2002, 0, 1))}
              >
                <Text style={styles.dateOptionText}>Jan 1, 2002</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => handleDateChange(new Date(2003, 0, 1))}
              >
                <Text style={styles.dateOptionText}>Jan 1, 2003</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => handleDateChange(new Date(2004, 0, 1))}
              >
                <Text style={styles.dateOptionText}>Jan 1, 2004</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderParentMobileStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <Phone size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Parent's Mobile Number"
            value={profileData.parentMobile}
            onChangeText={(text) => handleInputChange("parentMobile", text)}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
        {errors.parentMobile ? (
          <Text style={styles.errorText}>{errors.parentMobile}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderNameStep();
      case 1:
        return renderDateOfBirthStep();
      case 2:
        return renderParentMobileStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={[
            styles.backButton,
            currentStep === 0 && styles.backButtonHidden,
          ]}
          disabled={currentStep === 0}
        >
          <ChevronLeft
            color={currentStep === 0 ? "transparent" : "#000"}
            size={24}
          />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.stepCount}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInRight}
          exiting={FadeOutLeft}
          key={currentStep}
          style={styles.questionContainer}
        >
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.description}>
            {steps[currentStep].description}
          </Text>

          {renderStepContent()}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
          <Text style={styles.continueButtonText}>
            {currentStep === steps.length - 1 ? "Complete" : "Continue"}
          </Text>
          <ChevronRight color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backButtonHidden: {
    opacity: 0,
  },
  progressContainer: {
    flex: 1,
  },
  progressBackground: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ED7930",
    borderRadius: 2,
  },
  stepCount: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  questionContainer: {
    minHeight: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  stepContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F9FAFB",
  },
  datePickerText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueButton: {
    backgroundColor: "#ED7930",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  datePickerContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cancelText: {
    color: "#6B7280",
    fontSize: 16,
  },
  doneText: {
    color: "#ED7930",
    fontSize: 16,
    fontWeight: "600",
  },
  datePickerContent: {
    padding: 12,
  },
  customDatePicker: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateOptionText: {
    fontSize: 16,
    color: "#374151",
  },
});

export default ProfileSetup;
