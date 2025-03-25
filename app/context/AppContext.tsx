import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";

type PracticeType = "refine" | "recall" | "conquer";

type SurveyData = {
  examType: "JEE" | "NEET" | null;
  preparationLevel: "Beginner" | "Intermediate" | "Advanced" | null;
  studyPreferences: string[];
  dailyStudyTime: "1 hour" | "2-3 hours" | "4+ hours" | null;
};

type UserData = {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  name: string;
  email: string;
  photoUrl: string;
  sreks: number;
  xp: number;
  level: number;
  streak: number;
  rank: number;
};

type PetData = {
  name: string;
  foodLevel: number;
  healthLevel: number;
  mood: "happy" | "neutral" | "sad";
  level: number;
};

type PracticeSession = {
  subject: string | null;
  practiceType: PracticeType | null;
  xpGoal: number;
  currentXP: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
};

type AppContextType = {
  user: UserData;
  pet: PetData;
  surveyData: SurveyData;
  practiceSession: PracticeSession;
  studiedChapters: string[];
  // Auth actions
  signIn: () => void;
  signOut: () => void;
  // Onboarding actions
  completeSurvey: (data: SurveyData) => void;
  // Pet actions
  feedPet: () => void;
  playWithPet: () => void;
  updatePetMood: () => void;
  // Practice actions
  startPracticeSession: (
    subject: string,
    type: PracticeType,
    goal: number,
  ) => void;
  updatePracticeProgress: (
    xpEarned: number,
    isCorrect: boolean,
    timeSpent: number,
  ) => void;
  completePracticeSession: () => void;
  // Chapter actions
  updateStudiedChapters: (chapters: string[]) => void;
};

const defaultUser: UserData = {
  isAuthenticated: false,
  isOnboarded: false,
  name: "Student",
  email: "student@example.com",
  photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=doable",
  sreks: 0,
  xp: 0,
  level: 1,
  streak: 0,
  rank: 5000,
};

const defaultPet: PetData = {
  name: "Buddy",
  foodLevel: 70,
  healthLevel: 85,
  mood: "happy",
  level: 1,
};

const defaultSurveyData: SurveyData = {
  examType: null,
  preparationLevel: null,
  studyPreferences: [],
  dailyStudyTime: null,
};

const defaultPracticeSession: PracticeSession = {
  subject: null,
  practiceType: null,
  xpGoal: 100,
  currentXP: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  timeSpent: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData>(defaultUser);
  const [pet, setPet] = useState<PetData>(defaultPet);
  const [surveyData, setSurveyData] = useState<SurveyData>(defaultSurveyData);
  const [practiceSession, setPracticeSession] = useState<PracticeSession>(
    defaultPracticeSession,
  );
  const [studiedChapters, setStudiedChapters] = useState<string[]>([]);

  // Check if user is authenticated on app load
  useEffect(() => {
    // In a real app, you would check for stored credentials
    // For demo purposes, we'll just redirect to auth if not authenticated
    if (!user.isAuthenticated) {
      router.replace("/auth");
    } else if (!user.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [user.isAuthenticated, user.isOnboarded]);

  // Update pet mood based on food and health levels
  useEffect(() => {
    updatePetMood();
  }, [pet.foodLevel, pet.healthLevel]);

  // Auth actions
  const signIn = () => {
    // Simulate successful sign in
    setUser({
      ...user,
      isAuthenticated: true,
      name: "Rahul S.",
      email: "rahul@example.com",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
      sreks: 1250,
      xp: 3750,
      level: 5,
      streak: 3,
      rank: 1234,
    });
  };

  const signOut = () => {
    setUser(defaultUser);
    router.replace("/auth");
  };

  // Onboarding actions
  const completeSurvey = (data: SurveyData) => {
    setSurveyData(data);
    setUser({
      ...user,
      isOnboarded: true,
    });
    router.replace("/");
  };

  // Pet actions
  const feedPet = () => {
    setPet({
      ...pet,
      foodLevel: Math.min(pet.foodLevel + 15, 100),
    });
  };

  const playWithPet = () => {
    setPet({
      ...pet,
      healthLevel: Math.min(pet.healthLevel + 10, 100),
    });
  };

  const updatePetMood = () => {
    let newMood: "happy" | "neutral" | "sad" = "neutral";

    if (pet.foodLevel > 70 && pet.healthLevel > 70) {
      newMood = "happy";
    } else if (pet.foodLevel < 30 || pet.healthLevel < 30) {
      newMood = "sad";
    }

    if (newMood !== pet.mood) {
      setPet({
        ...pet,
        mood: newMood,
      });
    }
  };

  // Practice actions
  const startPracticeSession = (
    subject: string,
    type: PracticeType,
    goal: number,
  ) => {
    setPracticeSession({
      subject,
      practiceType: type,
      xpGoal: goal,
      currentXP: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    });
  };

  const updatePracticeProgress = (
    xpEarned: number,
    isCorrect: boolean,
    timeSpent: number,
  ) => {
    setPracticeSession({
      ...practiceSession,
      currentXP: practiceSession.currentXP + xpEarned,
      questionsAnswered: practiceSession.questionsAnswered + 1,
      correctAnswers: isCorrect
        ? practiceSession.correctAnswers + 1
        : practiceSession.correctAnswers,
      timeSpent: practiceSession.timeSpent + timeSpent,
    });
  };

  const completePracticeSession = () => {
    // Calculate rewards
    const xpEarned = practiceSession.currentXP;
    const sreksEarned = Math.floor(xpEarned * 0.2); // 20% of XP as Sreks

    // Update user stats
    setUser({
      ...user,
      xp: user.xp + xpEarned,
      sreks: user.sreks + sreksEarned,
      streak: user.streak + 1,
    });

    // Update pet stats
    setPet({
      ...pet,
      foodLevel: Math.min(pet.foodLevel + 10, 100),
      healthLevel: Math.min(pet.healthLevel + 15, 100),
    });

    // Reset practice session
    setPracticeSession(defaultPracticeSession);
  };

  // Chapter actions
  const updateStudiedChapters = (chapters: string[]) => {
    setStudiedChapters(chapters);
  };

  const value = {
    user,
    pet,
    surveyData,
    practiceSession,
    studiedChapters,
    signIn,
    signOut,
    completeSurvey,
    feedPet,
    playWithPet,
    updatePetMood,
    startPracticeSession,
    updatePracticeProgress,
    completePracticeSession,
    updateStudiedChapters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
