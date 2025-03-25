import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Beaker, Brain, Calculator, ChevronRight } from "lucide-react-native";

interface SubjectSelectionProps {
  onSelectSubject?: (subject: string) => void;
  selectedExam?: "JEE" | "NEET";
}

const SubjectSelection = ({
  onSelectSubject = () => {},
  selectedExam = "JEE",
}: SubjectSelectionProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects =
    selectedExam === "JEE"
      ? ["Physics", "Chemistry", "Mathematics"]
      : ["Physics", "Chemistry", "Biology"];

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case "Physics":
        return <Calculator size={24} color="#4F46E5" />;
      case "Chemistry":
        return <Beaker size={24} color="#10B981" />;
      case "Mathematics":
        return <Calculator size={24} color="#F59E0B" />;
      case "Biology":
        return <Brain size={24} color="#EC4899" />;
      default:
        return <Calculator size={24} color="#4F46E5" />;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "Physics":
        return "bg-indigo-100 border-indigo-300";
      case "Chemistry":
        return "bg-emerald-100 border-emerald-300";
      case "Mathematics":
        return "bg-amber-100 border-amber-300";
      case "Biology":
        return "bg-pink-100 border-pink-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    onSelectSubject(subject);
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm w-full">
      <Text className="text-xl font-bold mb-4 text-gray-800">
        Select a Subject
      </Text>
      <Text className="text-sm text-gray-600 mb-4">
        Choose the subject you want to practice for your {selectedExam}{" "}
        preparation
      </Text>

      <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject}
            className={`flex-row items-center justify-between p-4 mb-3 rounded-lg border ${getSubjectColor(subject)} ${selectedSubject === subject ? "border-2" : "border"}`}
            onPress={() => handleSelectSubject(subject)}
          >
            <View className="flex-row items-center">
              {getSubjectIcon(subject)}
              <Text className="ml-3 text-lg font-medium text-gray-800">
                {subject}
              </Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="mt-4">
        <Text className="text-xs text-gray-500 text-center">
          Tap on a subject to view practice options
        </Text>
      </View>
    </View>
  );
};

export default SubjectSelection;
