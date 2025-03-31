import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  BookOpen,
  Zap,
  Award,
  Calendar,
} from "lucide-react-native";
import { useAppContext } from "./context/AppContext";

export default function ReportsScreen() {
  const router = useRouter();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState("performance");

  const screenWidth = Dimensions.get("window").width;

  const handleBackPress = () => {
    router.back();
  };

  // Mock data for performance metrics
  const performanceData = {
    totalQuestions: 1250,
    correctAnswers: 875,
    averageTime: 42, // seconds per question
    weakTopics: [
      { name: "Organic Chemistry", accuracy: 62 },
      { name: "Electromagnetism", accuracy: 68 },
      { name: "Calculus", accuracy: 71 },
    ],
    strongTopics: [
      { name: "Mechanics", accuracy: 94 },
      { name: "Algebra", accuracy: 91 },
      { name: "Inorganic Chemistry", accuracy: 89 },
    ],
    recentTests: [
      { date: "2023-10-15", score: 85, totalQuestions: 30, subject: "Physics" },
      {
        date: "2023-10-12",
        score: 78,
        totalQuestions: 30,
        subject: "Chemistry",
      },
      {
        date: "2023-10-09",
        score: 92,
        totalQuestions: 30,
        subject: "Mathematics",
      },
    ],
  };

  // Mock data for study habits
  const studyHabitsData = {
    weeklyStudyHours: 28,
    longestStreak: 42, // days
    averageSessionLength: 65, // minutes
    mostProductiveDay: "Tuesday",
    mostProductiveTime: "7:00 PM",
    chaptersCompleted: 32,
  };

  const renderPerformanceTab = () => (
    <View className="px-5 py-4">
      {/* Overall Stats */}
      <View className="mb-6">
        <Text className="text-lg font-bold mb-3">Overall Performance</Text>
        <View className="flex-row flex-wrap">
          <View className="w-1/2 pr-2 mb-3">
            <View className="bg-blue-50 p-4 rounded-xl">
              <View className="flex-row items-center mb-2">
                <BookOpen size={18} color="#3b82f6" />
                <Text className="ml-2 text-blue-500 font-medium">
                  Questions
                </Text>
              </View>
              <Text className="text-2xl font-bold">
                {performanceData.totalQuestions}
              </Text>
              <Text className="text-gray-500">Total Attempted</Text>
            </View>
          </View>
          <View className="w-1/2 pl-2 mb-3">
            <View className="bg-green-50 p-4 rounded-xl">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={18} color="#10b981" />
                <Text className="ml-2 text-green-500 font-medium">
                  Accuracy
                </Text>
              </View>
              <Text className="text-2xl font-bold">
                {Math.round(
                  (performanceData.correctAnswers /
                    performanceData.totalQuestions) *
                    100,
                )}
                %
              </Text>
              <Text className="text-gray-500">Correct Answers</Text>
            </View>
          </View>
          <View className="w-1/2 pr-2">
            <View className="bg-purple-50 p-4 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Clock size={18} color="#8b5cf6" />
                <Text className="ml-2 text-purple-500 font-medium">
                  Avg. Time
                </Text>
              </View>
              <Text className="text-2xl font-bold">
                {performanceData.averageTime}s
              </Text>
              <Text className="text-gray-500">Per Question</Text>
            </View>
          </View>
          <View className="w-1/2 pl-2">
            <View className="bg-orange-50 p-4 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Award size={18} color="#f97316" />
                <Text className="ml-2 text-orange-500 font-medium">
                  XP Earned
                </Text>
              </View>
              <Text className="text-2xl font-bold">
                {user.xp.toLocaleString()}
              </Text>
              <Text className="text-gray-500">Total Points</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Weak Topics */}
      <View className="mb-6">
        <Text className="text-lg font-bold mb-3">Areas for Improvement</Text>
        {performanceData.weakTopics.map((topic, index) => (
          <View key={index} className="bg-red-50 p-4 rounded-xl mb-2">
            <View className="flex-row justify-between items-center">
              <Text className="font-medium">{topic.name}</Text>
              <Text className="font-bold text-red-500">{topic.accuracy}%</Text>
            </View>
            <View className="h-2 bg-red-100 rounded-full mt-2 overflow-hidden">
              <View
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${topic.accuracy}%` }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Strong Topics */}
      <View className="mb-6">
        <Text className="text-lg font-bold mb-3">Strong Areas</Text>
        {performanceData.strongTopics.map((topic, index) => (
          <View key={index} className="bg-green-50 p-4 rounded-xl mb-2">
            <View className="flex-row justify-between items-center">
              <Text className="font-medium">{topic.name}</Text>
              <Text className="font-bold text-green-500">
                {topic.accuracy}%
              </Text>
            </View>
            <View className="h-2 bg-green-100 rounded-full mt-2 overflow-hidden">
              <View
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${topic.accuracy}%` }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Recent Tests */}
      <View>
        <Text className="text-lg font-bold mb-3">Recent Tests</Text>
        {performanceData.recentTests.map((test, index) => {
          const date = new Date(test.date);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
          return (
            <View key={index} className="bg-gray-50 p-4 rounded-xl mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-medium">{test.subject}</Text>
                <Text className="text-gray-500">{formattedDate}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">
                  {test.score}/{test.totalQuestions} correct
                </Text>
                <Text className="font-bold">
                  {Math.round((test.score / test.totalQuestions) * 100)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderStudyHabitsTab = () => (
    <View className="px-5 py-4">
      {/* Study Habits Stats */}
      <View className="mb-6">
        <Text className="text-lg font-bold mb-3">Study Habits</Text>
        <View className="flex-row flex-wrap">
          <View className="w-1/2 pr-2 mb-3">
            <View className="bg-blue-50 p-4 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Clock size={18} color="#3b82f6" />
                <Text className="ml-2 text-blue-500 font-medium">
                  Weekly Hours
                </Text>
              </View>
              <Text className="text-2xl font-bold">
                {studyHabitsData.weeklyStudyHours}
              </Text>
              <Text className="text-gray-500">Hours Studied</Text>
            </View>
          </View>
          <View className="w-1/2 pl-2 mb-3">
            <View className="bg-green-50 p-4 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Zap size={18} color="#10b981" />
                <Text className="ml-2 text-green-500 font-medium">Streak</Text>
              </View>
              <Text className="text-2xl font-bold">
                {studyHabitsData.longestStreak}
              </Text>
              <Text className="text-gray-500">Longest Streak</Text>
            </View>
          </View>
          <View className="w-1/2 pr-2">
            <View className="bg-purple-50 p-4 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Clock size={18} color="#8b5cf6" />
                <Text className="ml-2 text-purple-500 font-medium">
                  Avg. Session
                </Text>
              </View>
              <Text className="text-2xl font-bold">
                {studyHabitsData.averageSessionLength}
              </Text>
              <Text className="text-gray-500">Minutes</Text>
            </View>
          </View>
          <View className="w-1/2 pl-2">
            <View className="bg-orange-50 p-4 rounded-xl">
              <View className="flex-row items-center mb-2">
                <BookOpen size={18} color="#f97316" />
                <Text className="ml-2 text-orange-500 font-medium">
                  Chapters
                </Text>
              </View>
              <Text className="text-2xl font-bold">
                {studyHabitsData.chaptersCompleted}
              </Text>
              <Text className="text-gray-500">Completed</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Productivity Insights */}
      <View className="mb-6">
        <Text className="text-lg font-bold mb-3">Productivity Insights</Text>
        <View className="bg-indigo-50 p-4 rounded-xl mb-3">
          <View className="flex-row items-center mb-2">
            <Calendar size={18} color="#6366f1" />
            <Text className="ml-2 text-indigo-500 font-medium">
              Most Productive Day
            </Text>
          </View>
          <Text className="text-2xl font-bold">
            {studyHabitsData.mostProductiveDay}
          </Text>
          <Text className="text-gray-500">You perform best on this day</Text>
        </View>
        <View className="bg-indigo-50 p-4 rounded-xl">
          <View className="flex-row items-center mb-2">
            <Clock size={18} color="#6366f1" />
            <Text className="ml-2 text-indigo-500 font-medium">
              Peak Study Time
            </Text>
          </View>
          <Text className="text-2xl font-bold">
            {studyHabitsData.mostProductiveTime}
          </Text>
          <Text className="text-gray-500">Your optimal study time</Text>
        </View>
      </View>

      {/* Recommendations */}
      <View>
        <Text className="text-lg font-bold mb-3">Recommendations</Text>
        <View className="bg-gray-50 p-4 rounded-xl mb-2">
          <Text className="font-medium mb-1">
            Increase study sessions on weekends
          </Text>
          <Text className="text-gray-500">
            Your weekend productivity is 30% lower than weekdays
          </Text>
        </View>
        <View className="bg-gray-50 p-4 rounded-xl mb-2">
          <Text className="font-medium mb-1">
            Take more breaks during long sessions
          </Text>
          <Text className="text-gray-500">
            Your performance drops after 90 minutes of continuous study
          </Text>
        </View>
        <View className="bg-gray-50 p-4 rounded-xl">
          <Text className="font-medium mb-1">
            Review weak topics more frequently
          </Text>
          <Text className="text-gray-500">
            Spaced repetition will help improve retention
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Tab Navigation */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab("performance")}
          className={`flex-1 py-3 ${activeTab === "performance" ? "border-b-2 border-black" : ""}`}
        >
          <Text
            className={`text-center font-medium ${activeTab === "performance" ? "text-black" : "text-gray-500"}`}
          >
            Performance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("studyHabits")}
          className={`flex-1 py-3 ${activeTab === "studyHabits" ? "border-b-2 border-black" : ""}`}
        >
          <Text
            className={`text-center font-medium ${activeTab === "studyHabits" ? "text-black" : "text-gray-500"}`}
          >
            Study Habits
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1">
        {activeTab === "performance"
          ? renderPerformanceTab()
          : renderStudyHabitsTab()}
      </ScrollView>
    </SafeAreaView>
  );
}
