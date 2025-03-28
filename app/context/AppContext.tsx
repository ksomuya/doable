import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";

type PracticeType = "refine" | "recall" | "conquer";

type SurveyData = {
  examType: "JEE" | "NEET" | null;
  currentClass: "Class 11" | "Class 12" | "Dropper" | null;
  preparationLevel: "Beginner" | "Intermediate" | "Advanced" | null;
  studyPreferences: string[];
  dailyStudyTime: "1 hour" | "2-3 hours" | "4+ hours" | null;
};

type UserData = {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isProfileSetup: boolean;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  sreks: number;
  xp: number;
  level: number;
  streak: number;
  rank: number;
  dateOfBirth: Date | null;
  parentMobile: string;
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
  // Profile actions
  completeProfileSetup: (
    firstName: string,
    lastName: string,
    dateOfBirth: Date | null,
    parentMobile: string,
  ) => void;
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
  isProfileSetup: false,
  name: "Student",
  firstName: "",
  lastName: "",
  email: "student@example.com",
  photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=doable",
  sreks: 0,
  xp: 0,
  level: 1,
  streak: 0,
  rank: 5000,
  dateOfBirth: null,
  parentMobile: "",
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
  currentClass: null,
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
  const { isSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useAuth();
  const [user, setUser] = useState<UserData>(defaultUser);
  const [pet, setPet] = useState<PetData>(defaultPet);
  const [surveyData, setSurveyData] = useState<SurveyData>(defaultSurveyData);
  const [practiceSession, setPracticeSession] = useState<PracticeSession>(
    defaultPracticeSession,
  );
  const [studiedChapters, setStudiedChapters] = useState<string[]>([]);

  // Update user data when Clerk user changes
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      setUser({
        ...user,
        isAuthenticated: true,
        name:
          clerkUser.fullName ||
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "Student",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        email:
          clerkUser.primaryEmailAddress?.emailAddress || "student@example.com",
        photoUrl:
          clerkUser.imageUrl ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=doable",
        // Keep other user data like sreks, xp, etc.
      });
    } else {
      setUser(defaultUser);
    }
  }, [isSignedIn, clerkUser]);

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

  // Auth actions - now just placeholders as Clerk handles the actual auth
  const signIn = () => {
    // This is now handled by Clerk, but we keep the method for compatibility
    // The actual user state update happens in the useEffect above when Clerk user changes
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
      setUser(defaultUser);
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Onboarding actions
  const completeSurvey = (data: SurveyData) => {
    setSurveyData(data);
    setUser({
      ...user,
      isOnboarded: true,
    });
    // Router navigation is handled in the component
  };

  // Profile setup actions
  const completeProfileSetup = (
    firstName: string,
    lastName: string,
    dateOfBirth: Date | null,
    parentMobile: string,
  ) => {
    setUser({
      ...user,
      isProfileSetup: true,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      dateOfBirth,
      parentMobile,
    });
    // Router navigation is handled in the component
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
    completeProfileSetup,
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
