import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, Beaker, Brain, Calculator, Clock, Users, Trophy } from "lucide-react-native";
import { Image } from "expo-image";
import Animated, { FadeInRight, FadeOutLeft, FadeIn } from "react-native-reanimated";

const { width } = Dimensions.get("window");

type Subject = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  topics: string[];
  stats: {
    activeUsers: number;
    avgCompletionTime: string;
    successRate: number;
  };
};

const subjects: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    description: "Master the fundamental laws of the universe through interactive problem-solving",
    icon: <Calculator size={24} color="white" />,
    color: "#3B82F6",
    difficulty: "Intermediate",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop",
    topics: ["Mechanics", "Thermodynamics", "Waves", "Electromagnetism"],
    stats: {
      activeUsers: 1234,
      avgCompletionTime: "45 min",
      successRate: 78,
    },
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Explore the building blocks of matter through engaging experiments",
    icon: <Beaker size={24} color="white" />,
    color: "#10B981",
    difficulty: "Advanced",
    image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop",
    topics: ["Organic", "Inorganic", "Physical", "Analytical"],
    stats: {
      activeUsers: 987,
      avgCompletionTime: "55 min",
      successRate: 72,
    },
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Develop problem-solving skills with step-by-step guidance",
    icon: <Brain size={24} color="white" />,
    color: "#8B5CF6",
    difficulty: "Intermediate",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
    topics: ["Algebra", "Calculus", "Geometry", "Statistics"],
    stats: {
      activeUsers: 1567,
      avgCompletionTime: "40 min",
      successRate: 75,
    },
  },
];

export default function PracticePage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubjectSelect = (subject: Subject) => {
    setIsLoading(true);
    setSelectedSubject(subject);
    
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: "/practice/question",
        params: { subject: subject.id }
      });
    }, 1000);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getDifficultyColor = (difficulty: Subject["difficulty"]) => {
    switch (difficulty) {
      case "Beginner": return "#22C55E";
      case "Intermediate": return "#F59E0B";
      case "Advanced": return "#EF4444";
      default: return "#6B7280";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Subject</Text>
        </View>

        {/* Search Bar */}
        <Animated.View 
          entering={FadeIn.delay(300)}
          style={styles.searchContainer}
        >
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects or topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </Animated.View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Welcome Message */}
          <Animated.Text 
            entering={FadeIn.delay(200)}
            style={styles.welcomeText}
          >
            Ready to practice? Choose your subject and let's begin!
          </Animated.Text>

          {/* Subject Cards */}
          {filteredSubjects.map((subject, index) => (
            <Animated.View
              key={subject.id}
              entering={FadeInRight.delay(index * 100)}
              exiting={FadeOutLeft}
            >
              <TouchableOpacity
                style={styles.subjectCard}
                onPress={() => handleSubjectSelect(subject)}
                disabled={isLoading}
                activeOpacity={0.7}
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
                      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(subject.difficulty) + '20' }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(subject.difficulty) }]}>
                          {subject.difficulty}
                        </Text>
                      </View>
                      
                      <Text style={styles.topicsCount}>
                        {subject.topics.length} topics
                      </Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Users size={16} color="#6B7280" />
                        <Text style={styles.statText}>{subject.stats.activeUsers} active</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.statText}>{subject.stats.avgCompletionTime}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Trophy size={16} color="#6B7280" />
                        <Text style={styles.statText}>{subject.stats.successRate}% success</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}

          {filteredSubjects.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No subjects found matching "{searchQuery}"</Text>
              <Text style={styles.noResultsSubtext}>Try searching for a different subject or topic</Text>
            </View>
          )}
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Preparing your practice session...</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    margin: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  welcomeText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  subjectCard: {
    backgroundColor: "white",
    borderRadius: 20,
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
  subjectImage: {
    width: "100%",
    height: 160,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardContent: {
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  noResults: {
    alignItems: "center",
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 16,
    color: "#6B7280",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
});