import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { BarChart, TrendingUp, Award, AlertCircle } from "lucide-react-native";

interface PerformanceReportProps {
  overallAccuracy?: number;
  totalStudyTime?: number;
  completedSessions?: number;
  syllabusCoverage?: number;
  subjectAnalysis?: {
    name: string;
    accuracy: number;
    speed: number;
    conceptRating: number;
  }[];
  topPerformingTopics?: string[];
  weakTopics?: string[];
}

const PerformanceReport = ({
  overallAccuracy = 72,
  totalStudyTime = 48,
  completedSessions = 24,
  syllabusCoverage = 35,
  subjectAnalysis = [
    { name: "Physics", accuracy: 68, speed: 75, conceptRating: 70 },
    { name: "Chemistry", accuracy: 82, speed: 65, conceptRating: 78 },
    { name: "Mathematics", accuracy: 65, speed: 60, conceptRating: 62 },
  ],
  topPerformingTopics = ["Organic Chemistry", "Mechanics", "Thermodynamics"],
  weakTopics = ["Calculus", "Electrostatics", "Coordination Compounds"],
}: PerformanceReportProps) => {
  return (
    <View className="w-full bg-white rounded-xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-800">
          Performance Report
        </Text>
        <Pressable>
          <Text className="text-sm text-blue-600">View Details</Text>
        </Pressable>
      </View>

      {/* Overall Stats */}
      <View className="flex-row justify-between mb-4">
        <View className="items-center bg-blue-50 rounded-lg p-2 flex-1 mr-2">
          <Text className="text-xs text-gray-600">Accuracy</Text>
          <Text className="text-lg font-bold text-blue-700">
            {overallAccuracy}%
          </Text>
        </View>
        <View className="items-center bg-green-50 rounded-lg p-2 flex-1 mr-2">
          <Text className="text-xs text-gray-600">Study Time</Text>
          <Text className="text-lg font-bold text-green-700">
            {totalStudyTime}h
          </Text>
        </View>
        <View className="items-center bg-purple-50 rounded-lg p-2 flex-1">
          <Text className="text-xs text-gray-600">Sessions</Text>
          <Text className="text-lg font-bold text-purple-700">
            {completedSessions}
          </Text>
        </View>
      </View>

      {/* Syllabus Coverage */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-sm font-medium text-gray-700">
            Syllabus Coverage
          </Text>
          <Text className="text-sm font-bold text-gray-800">
            {syllabusCoverage}%
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full w-full">
          <View
            className="h-2 bg-blue-600 rounded-full"
            style={{ width: `${syllabusCoverage}%` }}
          />
        </View>
      </View>

      {/* Subject Analysis */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Subject Analysis
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {subjectAnalysis.map((subject, index) => (
            <View key={index} className="bg-gray-50 rounded-lg p-3 mr-3 w-36">
              <Text className="text-sm font-bold text-gray-800 mb-1">
                {subject.name}
              </Text>
              <View className="flex-row items-center mb-1">
                <Text className="text-xs text-gray-600 w-24">Accuracy:</Text>
                <Text className="text-xs font-medium text-blue-700">
                  {subject.accuracy}%
                </Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Text className="text-xs text-gray-600 w-24">Speed:</Text>
                <Text className="text-xs font-medium text-green-700">
                  {subject.speed}%
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-600 w-24">Concept:</Text>
                <Text className="text-xs font-medium text-purple-700">
                  {subject.conceptRating}%
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Topic Analysis */}
      <View className="flex-row">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Award size={16} color="#16a34a" />
            <Text className="text-sm font-medium text-gray-700 ml-1">
              Top Topics
            </Text>
          </View>
          <View className="bg-green-50 rounded-lg p-2">
            {topPerformingTopics.map((topic, index) => (
              <Text key={index} className="text-xs text-gray-700 mb-1">
                • {topic}
              </Text>
            ))}
          </View>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <AlertCircle size={16} color="#dc2626" />
            <Text className="text-sm font-medium text-gray-700 ml-1">
              Weak Areas
            </Text>
          </View>
          <View className="bg-red-50 rounded-lg p-2">
            {weakTopics.map((topic, index) => (
              <Text key={index} className="text-xs text-gray-700 mb-1">
                • {topic}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Insights Button */}
      <Pressable className="flex-row items-center justify-center bg-gray-100 rounded-lg p-3 mt-4">
        <TrendingUp size={16} color="#4b5563" />
        <Text className="text-sm font-medium text-gray-700 ml-2">
          View Personalized Insights
        </Text>
      </Pressable>
    </View>
  );
};

export default PerformanceReport;
