import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Beaker, Brain, Calculator, ChevronRight, Users, Clock, Trophy } from "lucide-react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface SubjectSelectionProps {
  onSelectSubject?: (subject: string) => void;
  selectedExam?: "JEE" | "NEET";
}

const subjects = [
  {
    id: "physics",
    name: "Physics",
    description: "Master the fundamental laws of the universe through interactive problem-solving",
    icon: <Calculator size={24} color="white" />,
    color: "#3B82F6",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop",
    difficulty: "Intermediate",
    topics: ["Mechanics", "Thermodynamics", "Waves", "Electromagnetism"],
    stats: {
      activeUsers: 1234,
      avgTime: "45 min",
      successRate: 78
    }
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Explore the building blocks of matter through engaging experiments",
    icon: <Beaker size={24} color="white" />,
    color: "#10B981",
    image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop",
    difficulty: "Advanced",
    topics: ["Organic", "Inorganic", "Physical", "Analytical"],
    stats: {
      activeUsers: 987,
      avgTime: "55 min",
      successRate: 72
    }
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Develop problem-solving skills with step-by-step guidance",
    icon: <Brain size={24} color="white" />,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
    difficulty: "Intermediate",
    topics: ["Algebra", "Calculus", "Geometry", "Statistics"],
    stats: {
      activeUsers: 1567,
      avgTime: "40 min",
      successRate: 75
    }
  }
];

const SubjectSelection = ({
  onSelectSubject = () => {},
  selectedExam = "JEE",
}: SubjectSelectionProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    onSelectSubject(subject);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "#22C55E";
      case "Intermediate": return "#F59E0B";
      case "Advanced": return "#EF4444";
      default: return "#6B7280";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Subject</Text>
      <Text style={styles.subtitle}>
        Select a subject to begin your {selectedExam} preparation journey
      </Text>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {subjects.map((subject, index) => (
          <Animated.View
            key={subject.id}
            entering={FadeInRight.delay(index * 100)}
            exiting={FadeOutLeft}
          >
            <TouchableOpacity
              style={[
                styles.subjectCard,
                selectedSubject === subject.id && styles.selectedCard
              ]}
              onPress={() => handleSelectSubject(subject.id)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: subject.image }}
                style={styles.subjectImage}
                contentFit="cover"
              />
              
              <View style={styles.cardOverlay} />
              
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: subject.color }]}>
                  {subject.icon}
                </View>
                
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text style={styles.subjectDescription}>{subject.description}</Text>
                  
                  <View style={styles.subjectMeta}>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(subject.difficulty) + '20' }
                    ]}>
                      <Text style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(subject.difficulty) }
                      ]}>
                        {subject.difficulty}
                      </Text>
                    </View>
                    
                    <Text style={styles.topicsCount}>
                      {subject.topics.length} topics
                    </Text>
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Users size={16} color="#6B7280" />
                      <Text style={styles.statText}>{subject.stats.activeUsers} active</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.statText}>{subject.stats.avgTime}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Trophy size={16} color="#6B7280" />
                      <Text style={styles.statText}>{subject.stats.successRate}% success</Text>
                    </View>
                  </View>

                  <View style={styles.actionContainer}>
                    <ChevronRight size={20} color="#6B7280" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  subjectCard: {
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  subjectImage: {
    width: "100%",
    height: 180,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardContent: {
    padding: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subjectDescription: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 24,
  },
  subjectMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  topicsCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  actionContainer: {
    alignItems: "flex-end",
  },
});

export default SubjectSelection;