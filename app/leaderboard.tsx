import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Award, 
  ChevronUp,
  Flame,
  Star,
  Zap,
  Crown,
  Sparkles
} from "lucide-react-native";
import { useAppContext } from "./context/AppContext";
import { LinearGradient } from "expo-linear-gradient";

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAppContext();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleTopUser = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleTopUser, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const leaderboardData = [
    {
      id: 1,
      name: "Aarav Singh",
      xp: 12500,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
      streak: 23,
      accuracy: 92,
      badges: 7,
    },
    {
      id: 2,
      name: "Priya Sharma",
      xp: 11200,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      streak: 19,
      accuracy: 88,
      badges: 5,
    },
    {
      id: 3,
      name: "Rahul Patel",
      xp: 10800,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      streak: 15,
      accuracy: 85,
      badges: 4,
    },
    { 
      id: 4, 
      name: user.name, 
      xp: user.xp, 
      avatar: user.photoUrl,
      streak: user.streak || 7,
      accuracy: 83,
      badges: 3,
    },
    {
      id: 5,
      name: "Ananya Gupta",
      xp: 9500,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      streak: 12,
      accuracy: 79,
      badges: 4,
    },
    {
      id: 6,
      name: "Vikram Reddy",
      xp: 8900,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      streak: 9,
      accuracy: 76,
      badges: 3,
    },
    {
      id: 7,
      name: "Neha Kapoor",
      xp: 8200,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
      streak: 11,
      accuracy: 74,
      badges: 2,
    },
    {
      id: 8,
      name: "Arjun Mehta",
      xp: 7800,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
      streak: 8,
      accuracy: 72,
      badges: 2,
    },
    {
      id: 9,
      name: "Kavya Iyer",
      xp: 7200,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya",
      streak: 7,
      accuracy: 71,
      badges: 2,
    },
    {
      id: 10,
      name: "Rohan Joshi",
      xp: 6900,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
      streak: 5,
      accuracy: 70,
      badges: 1,
    },
  ];

  // Sort leaderboard by XP
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => b.xp - a.xp);
  
  // Find user's position in the leaderboard
  const userPosition = sortedLeaderboard.findIndex(item => item.id === 4);
  const userRank = userPosition + 1;

  const handleBackPress = () => {
    router.back();
  };

  const getLeaderboardIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy size={24} color="#FFD700" />;
      case 1:
        return <Medal size={24} color="#C0C0C0" />;
      case 2:
        return <Award size={24} color="#CD7F32" />;
      default:
        return null;
    }
  };

  // Get podium items (top 3)
  const topThree = sortedLeaderboard.slice(0, 3);
  
  const renderPodium = () => {
    return (
      <Animated.View 
        style={[
          styles.podiumContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleTopUser }]
          }
        ]}
      >
        {/* Second Place */}
        <View style={styles.podiumItem}>
          <View style={styles.podiumAvatar}>
            <Image
              source={{ uri: topThree[1].avatar }}
              style={styles.podiumAvatarImage}
            />
            <View style={[styles.podiumBadge, styles.podiumBadgeSilver]}>
              <Text style={styles.podiumBadgeText}>2</Text>
            </View>
          </View>
          <View style={[styles.podiumPillar, styles.podiumPillarSecond]}>
            <LinearGradient
              colors={['#C0C0C0', '#E0E0E0']}
              style={styles.podiumPillarGradient}
            />
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>{topThree[1].name}</Text>
          <Text style={styles.podiumXP}>{topThree[1].xp.toLocaleString()} XP</Text>
        </View>
        
        {/* First Place */}
        <View style={styles.podiumItem}>
          <View style={styles.crownContainer}>
            <Crown size={28} color="#FFD700" />
          </View>
          <View style={styles.podiumAvatar}>
            <Image
              source={{ uri: topThree[0].avatar }}
              style={styles.podiumAvatarImage}
            />
            <View style={[styles.podiumBadge, styles.podiumBadgeGold]}>
              <Text style={styles.podiumBadgeText}>1</Text>
            </View>
          </View>
          <View style={[styles.podiumPillar, styles.podiumPillarFirst]}>
            <LinearGradient
              colors={['#FFD700', '#FFF6DD']}
              style={styles.podiumPillarGradient}
            />
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>{topThree[0].name}</Text>
          <Text style={styles.podiumXP}>{topThree[0].xp.toLocaleString()} XP</Text>
        </View>
        
        {/* Third Place */}
        <View style={styles.podiumItem}>
          <View style={styles.podiumAvatar}>
            <Image
              source={{ uri: topThree[2].avatar }}
              style={styles.podiumAvatarImage}
            />
            <View style={[styles.podiumBadge, styles.podiumBadgeBronze]}>
              <Text style={styles.podiumBadgeText}>3</Text>
            </View>
          </View>
          <View style={[styles.podiumPillar, styles.podiumPillarThird]}>
            <LinearGradient
              colors={['#CD7F32', '#E8B888']}
              style={styles.podiumPillarGradient}
            />
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>{topThree[2].name}</Text>
          <Text style={styles.podiumXP}>{topThree[2].xp.toLocaleString()} XP</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* User's Current Rank */}
      <Animated.View 
        style={[
          styles.userRankContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={['#EEF2FF', '#E0E7FF']}
          style={styles.userRankGradient}
        >
          <View style={styles.userRankHeader}>
            <Text style={styles.userRankTitle}>Your Current Rank</Text>
            <View style={styles.userRankBadge}>
              <Text style={styles.userRankBadgeText}>
                {userRank <= 100 ? "Top 100" : userRank <= 500 ? "Top 500" : "Top 1000"}
              </Text>
            </View>
          </View>
          
          <View style={styles.userRankContent}>
            <View style={styles.userRankPosition}>
              <Text style={styles.userRankNumber}>{userRank}</Text>
              <View style={styles.userRankChange}>
                <ChevronUp size={16} color="#10B981" />
                <Text style={styles.userRankChangeText}>+3</Text>
              </View>
            </View>
            
            <View style={styles.userStatsContainer}>
              <View style={styles.userStatItem}>
                <Flame size={18} color="#EF4444" />
                <Text style={styles.userStatValue}>{sortedLeaderboard[userPosition].streak}</Text>
                <Text style={styles.userStatLabel}>Streak</Text>
              </View>
              
              <View style={styles.userStatItem}>
                <Star size={18} color="#F59E0B" />
                <Text style={styles.userStatValue}>{sortedLeaderboard[userPosition].accuracy}%</Text>
                <Text style={styles.userStatLabel}>Accuracy</Text>
              </View>
              
              <View style={styles.userStatItem}>
                <Sparkles size={18} color="#8B5CF6" />
                <Text style={styles.userStatValue}>{sortedLeaderboard[userPosition].badges}</Text>
                <Text style={styles.userStatLabel}>Badges</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Champions Podium */}
      {renderPodium()}

      {/* Leaderboard List */}
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>
          Top Performers
        </Text>
        
        <ScrollView style={styles.leaderboardList}>
          {sortedLeaderboard.slice(3).map((item, index) => {
            const position = index + 3;
            const isCurrentUser = item.id === 4;
            
            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.leaderboardItem,
                  isCurrentUser && styles.currentUserItem,
                  { 
                    opacity: fadeAnim, 
                    transform: [{ translateY: slideAnim }],
                    // Stagger the animation slightly for each item
                    animationDelay: `${index * 50}ms`
                  }
                ]}
              >
                <View style={styles.rankContainer}>
                  <Text style={[
                    styles.rankNumber,
                    isCurrentUser && styles.currentUserRank
                  ]}>
                    {position + 1}
                  </Text>
                </View>
                
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.avatar}
                />
                
                <View style={styles.userInfo}>
                  <Text style={[
                    styles.userName,
                    isCurrentUser && styles.currentUserName
                  ]}>
                    {item.name}
                    {isCurrentUser && " (You)"}
                  </Text>
                  
                  <View style={styles.userDetailRow}>
                    <View style={styles.userDetailItem}>
                      <Zap size={12} color="#F59E0B" />
                      <Text style={styles.userDetailText}>
                        {item.xp.toLocaleString()} XP
                      </Text>
                    </View>
                    
                    <View style={styles.userDetailItem}>
                      <Flame size={12} color="#EF4444" />
                      <Text style={styles.userDetailText}>
                        {item.streak} day streak
                      </Text>
                    </View>
                  </View>
                </View>
                
                {isCurrentUser && (
                  <View style={styles.currentUserBadge}>
                    <Text style={styles.currentUserBadgeText}>You</Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  userRankContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  userRankGradient: {
    padding: 16,
    borderRadius: 16,
  },
  userRankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userRankTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  userRankBadge: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  userRankBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  userRankContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  userRankPosition: {
    alignItems: "center",
    marginRight: 16,
  },
  userRankNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#4F46E5",
  },
  userRankChange: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  userRankChangeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  userStatsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userStatItem: {
    alignItems: "center",
  },
  userStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  userStatLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 16,
  },
  podiumItem: {
    alignItems: "center",
    marginHorizontal: 4,
  },
  crownContainer: {
    position: "absolute",
    top: -30,
    zIndex: 10,
  },
  podiumAvatar: {
    position: "relative",
    marginBottom: 8,
  },
  podiumAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  podiumBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  podiumBadgeGold: {
    backgroundColor: "#FFD700",
  },
  podiumBadgeSilver: {
    backgroundColor: "#C0C0C0",
  },
  podiumBadgeBronze: {
    backgroundColor: "#CD7F32",
  },
  podiumBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  podiumPillar: {
    width: 70,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: "hidden",
  },
  podiumPillarGradient: {
    width: "100%",
    height: "100%",
  },
  podiumPillarFirst: {
    height: 100,
  },
  podiumPillarSecond: {
    height: 80,
  },
  podiumPillarThird: {
    height: 60,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 8,
    maxWidth: 70,
    textAlign: "center",
  },
  podiumXP: {
    fontSize: 10,
    color: "#4F46E5",
    fontWeight: "500",
  },
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  currentUserItem: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  currentUserRank: {
    color: "#4F46E5",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  currentUserName: {
    color: "#4F46E5",
  },
  userDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  userDetailText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  currentUserBadge: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentUserBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
