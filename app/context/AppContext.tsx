import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  snowballs: number;
  xp: number;
  level: number;
  streak: number;
  streakGoal: number;
  notificationsEnabled: boolean;
  rank: number;
  dateOfBirth: Date | null;
  parentMobile: string;
};

type PetData = {
  name: string;
  foodLevel: number;
  temperature: number;
  mood: "happy" | "neutral" | "sad";
  level: number;
  lastTemperatureUpdate: number;
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
  // Streak actions
  updateStreakGoal: (days: number) => void;
  updateNotificationPreference: (enabled: boolean) => void;
  isFirstPracticeSession: () => boolean;
  // Pet actions
  feedPet: () => void;
  playWithPet: () => void;
  updatePetMood: () => void;
  updateTemperature: () => void;
  coolDownPenguin: () => boolean;
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
  snowballs: 0,
  xp: 0,
  level: 1,
  streak: 0,
  streakGoal: 0,
  notificationsEnabled: false,
  rank: 5000,
  dateOfBirth: null,
  parentMobile: "",
};

const defaultPet: PetData = {
  name: "Frosty",
  foodLevel: 70,
  temperature: 20,
  mood: "happy",
  level: 1,
  lastTemperatureUpdate: Date.now(),
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

// Keys for AsyncStorage
const STORAGE_KEYS = {
  USER_DATA: '@doable:user_data',
  PET_DATA: '@doable:pet_data',
  SURVEY_DATA: '@doable:survey_data',
  STUDIED_CHAPTERS: '@doable:studied_chapters',
};

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
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted data on app start
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [userData, petData, surveyData, chaptersData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.PET_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.SURVEY_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.STUDIED_CHAPTERS),
        ]);

        if (userData) setUser({ ...defaultUser, ...JSON.parse(userData) });
        if (petData) setPet({ ...defaultPet, ...JSON.parse(petData) });
        if (surveyData) setSurveyData({ ...defaultSurveyData, ...JSON.parse(surveyData) });
        if (chaptersData) setStudiedChapters(JSON.parse(chaptersData));
      } catch (error) {
        console.error('Error loading persisted data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedData();
  }, []);

  // Save user data when it changes
  useEffect(() => {
    const saveUserData = async () => {
      try {
        const dataToSave = {
          isOnboarded: user.isOnboarded,
          isProfileSetup: user.isProfileSetup,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          parentMobile: user.parentMobile,
          snowballs: user.snowballs,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          streakGoal: user.streakGoal,
          notificationsEnabled: user.notificationsEnabled,
          rank: user.rank,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    };

    if (user.isAuthenticated) {
      saveUserData();
    }
  }, [user]);

  // Save pet data when it changes
  useEffect(() => {
    const savePetData = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.PET_DATA, JSON.stringify(pet));
      } catch (error) {
        console.error('Error saving pet data:', error);
      }
    };

    savePetData();
  }, [pet]);

  // Save survey data when it changes
  useEffect(() => {
    const saveSurveyData = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_DATA, JSON.stringify(surveyData));
      } catch (error) {
        console.error('Error saving survey data:', error);
      }
    };

    if (user.isAuthenticated && user.isOnboarded) {
      saveSurveyData();
    }
  }, [surveyData, user.isAuthenticated, user.isOnboarded]);

  // Save studied chapters when they change
  useEffect(() => {
    const saveStudiedChapters = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.STUDIED_CHAPTERS, JSON.stringify(studiedChapters));
      } catch (error) {
        console.error('Error saving studied chapters:', error);
      }
    };

    if (studiedChapters.length > 0) {
      saveStudiedChapters();
    }
  }, [studiedChapters]);

  // Clear persisted data on sign out
  const clearPersistedData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.PET_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.SURVEY_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.STUDIED_CHAPTERS),
      ]);
    } catch (error) {
      console.error('Error clearing persisted data:', error);
    }
  };

  // Update the signOut function to clear persisted data
  const signOut = async () => {
    try {
      await clerkSignOut();
      await clearPersistedData();
      setUser(defaultUser);
      setPet(defaultPet);
      setSurveyData(defaultSurveyData);
      setStudiedChapters([]);
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
    // Add a short delay to ensure layout mounting is complete
    const timer = setTimeout(() => {
      // Only attempt navigation if the app is not in a loading state
      if (!isLoading) {
        if (!user.isAuthenticated) {
          router.replace("/auth");
        } else if (!user.isOnboarded) {
          router.replace("/onboarding");
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user.isAuthenticated, user.isOnboarded, isLoading]);

  // Update pet mood based on food and temperature levels
  useEffect(() => {
    updatePetMood();
  }, [pet.foodLevel, pet.temperature]);

  // Update temperature over time
  useEffect(() => {
    const temperatureInterval = setInterval(() => {
      updateTemperature();
    }, 60000); // Check every minute

    return () => clearInterval(temperatureInterval);
  }, []);

  // Auth actions - now just placeholders as Clerk handles the actual auth
  const signIn = () => {
    // This is now handled by Clerk, but we keep the method for compatibility
    // The actual user state update happens in the useEffect above when Clerk user changes
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

  // Streak actions
  const updateStreakGoal = (days: number) => {
    setUser({
      ...user,
      streakGoal: days
    });
  };
  
  const updateNotificationPreference = (enabled: boolean) => {
    setUser({
      ...user,
      notificationsEnabled: enabled
    });
  };
  
  const isFirstPracticeSession = () => {
    return user.streakGoal === 0;
  };

  // Pet actions
  const feedPet = () => {
    setPet({
      ...pet,
      foodLevel: Math.min(pet.foodLevel + 15, 100),
    });
  };

  const playWithPet = () => {
    // Playing with the penguin helps cool it down
    setPet({
      ...pet,
      temperature: Math.max(pet.temperature - 5, 10),
      lastTemperatureUpdate: Date.now(),
    });
  };

  const updatePetMood = () => {
    let newMood: "happy" | "neutral" | "sad" = "neutral";

    if (pet.foodLevel > 70 && pet.temperature < 30) {
      newMood = "happy";
    } else if (pet.foodLevel < 30 || pet.temperature > 60) {
      newMood = "sad";
    }

    if (newMood !== pet.mood) {
      setPet({
        ...pet,
        mood: newMood,
      });
    }
  };

  const updateTemperature = () => {
    const now = Date.now();
    const timeSinceLastUpdate = now - pet.lastTemperatureUpdate;

    // Only update if at least a minute has passed
    if (timeSinceLastUpdate >= 60000) {
      // Calculate how many minutes have passed
      const minutesPassed = Math.floor(timeSinceLastUpdate / 60000);

      // Temperature increases by 1 degree every minute
      const temperatureIncrease = minutesPassed;

      setPet({
        ...pet,
        temperature: Math.min(pet.temperature + temperatureIncrease, 100),
        lastTemperatureUpdate: now,
      });
    }
  };

  const coolDownPenguin = () => {
    const coolDownCost = 50; // Snowballs needed to cool down

    if (user.snowballs >= coolDownCost) {
      setUser({
        ...user,
        snowballs: user.snowballs - coolDownCost,
      });

      setPet({
        ...pet,
        temperature: Math.max(pet.temperature - 20, 10),
        lastTemperatureUpdate: Date.now(),
      });

      return true; // Successfully cooled down
    }

    return false; // Not enough snowballs
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
    const snowballsEarned = Math.floor(xpEarned * 0.2); // 20% of XP as snowballs

    // Update user stats
    setUser({
      ...user,
      xp: user.xp + xpEarned,
      snowballs: user.snowballs + snowballsEarned,
      streak: user.streak + 1,
    });

    // Update pet stats
    setPet({
      ...pet,
      foodLevel: Math.min(pet.foodLevel + 10, 100),
      temperature: Math.max(pet.temperature - 15, 10), // Practice cools down the penguin
      lastTemperatureUpdate: Date.now(),
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
    updateStreakGoal,
    updateNotificationPreference,
    isFirstPracticeSession,
    feedPet,
    playWithPet,
    updatePetMood,
    updateTemperature,
    coolDownPenguin,
    startPracticeSession,
    updatePracticeProgress,
    completePracticeSession,
    updateStudiedChapters,
  };

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Add default export
export default AppContext;
