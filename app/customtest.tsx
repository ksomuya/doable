import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Zap,
  ChevronRight,
} from "lucide-react-native";

export default function CustomTestScreen() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [timeLimit, setTimeLimit] = useState(30); // minutes
  const [questionCount, setQuestionCount] = useState(20);
  const [includeHardQuestions, setIncludeHardQuestions] = useState(false);

  const subjects = [
    {
      id: 1,
      name: "Physics",
      topics: ["Mechanics", "Thermodynamics", "Optics", "Electromagnetism"],
    },
    {
      id: 2,
      name: "Chemistry",
      topics: ["Organic", "Inorganic", "Physical", "Analytical"],
    },
    {
      id: 3,
      name: "Mathematics",
      topics: ["Calculus", "Algebra", "Geometry", "Statistics"],
    },
    {
      id: 4,
      name: "Biology",
      topics: ["Botany", "Zoology", "Human Physiology", "Genetics"],
    },
  ];

  const handleBackPress = () => {
    router.back();
  };

  const toggleSubject = (id) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(
        selectedSubjects.filter((subjectId) => subjectId !== id),
      );
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const handleStartTest = () => {
    // In a real app, this would navigate to the test with the custom settings
    console.log("Starting custom test with:", {
      subjects: selectedSubjects,
      timeLimit,
      questionCount,
      includeHardQuestions,
    });
    // Navigate to practice question screen with custom parameters
    router.push("/practice/question");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="mr-4">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Custom Test</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* Subject Selection */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3">Select Subjects</Text>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              onPress={() => toggleSubject(subject.id)}
              className={`flex-row items-center justify-between p-4 mb-2 rounded-xl ${selectedSubjects.includes(subject.id) ? "bg-purple-100 border border-purple-300" : "bg-gray-50"}`}
            >
              <View className="flex-row items-center">
                <BookOpen
                  size={20}
                  color={
                    selectedSubjects.includes(subject.id)
                      ? "#8b5cf6"
                      : "#6b7280"
                  }
                />
                <Text
                  className={`ml-3 font-medium ${selectedSubjects.includes(subject.id) ? "text-purple-700" : "text-gray-700"}`}
                >
                  {subject.name}
                </Text>
              </View>
              <ChevronRight
                size={20}
                color={
                  selectedSubjects.includes(subject.id) ? "#8b5cf6" : "#6b7280"
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Test Settings */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3">Test Settings</Text>

          {/* Time Limit */}
          <View className="flex-row items-center justify-between p-4 mb-2 bg-gray-50 rounded-xl">
            <View className="flex-row items-center">
              <Clock size={20} color="#6b7280" />
              <Text className="ml-3 font-medium text-gray-700">Time Limit</Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setTimeLimit(Math.max(10, timeLimit - 10))}
                className="bg-gray-200 w-8 h-8 rounded-full items-center justify-center"
              >
                <Text className="font-bold">-</Text>
              </TouchableOpacity>
              <Text className="mx-3 font-medium">{timeLimit} min</Text>
              <TouchableOpacity
                onPress={() => setTimeLimit(timeLimit + 10)}
                className="bg-gray-200 w-8 h-8 rounded-full items-center justify-center"
              >
                <Text className="font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Question Count */}
          <View className="flex-row items-center justify-between p-4 mb-2 bg-gray-50 rounded-xl">
            <View className="flex-row items-center">
              <BookOpen size={20} color="#6b7280" />
              <Text className="ml-3 font-medium text-gray-700">
                Number of Questions
              </Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setQuestionCount(Math.max(5, questionCount - 5))}
                className="bg-gray-200 w-8 h-8 rounded-full items-center justify-center"
              >
                <Text className="font-bold">-</Text>
              </TouchableOpacity>
              <Text className="mx-3 font-medium">{questionCount}</Text>
              <TouchableOpacity
                onPress={() => setQuestionCount(questionCount + 5)}
                className="bg-gray-200 w-8 h-8 rounded-full items-center justify-center"
              >
                <Text className="font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Include Hard Questions */}
          <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
            <View className="flex-row items-center">
              <Zap size={20} color="#6b7280" />
              <Text className="ml-3 font-medium text-gray-700">
                Include Hard Questions
              </Text>
            </View>
            <Switch
              value={includeHardQuestions}
              onValueChange={setIncludeHardQuestions}
              trackColor={{ false: "#d1d5db", true: "#c4b5fd" }}
              thumbColor={includeHardQuestions ? "#8b5cf6" : "#f3f4f6"}
            />
          </View>
        </View>
      </ScrollView>

      {/* Start Test Button */}
      <View className="px-5 py-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleStartTest}
          disabled={selectedSubjects.length === 0}
          className={`py-3 rounded-xl items-center ${selectedSubjects.length > 0 ? "bg-black" : "bg-gray-300"}`}
        >
          <Text
            className={`text-base font-bold ${selectedSubjects.length > 0 ? "text-white" : "text-gray-500"}`}
          >
            Start Custom Test
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
