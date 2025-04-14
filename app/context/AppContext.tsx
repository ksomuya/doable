import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { ensureUserStudiedTopicsConstraints } from '../utils/chapterUtils';

type PracticeType = "refine" | "recall" | "conquer";

// Practice flow progress tracking
type PracticeProgress = {
  currentStep: number;
  totalSteps: number;
  subject: string | null;
  type: PracticeType | null;
  goal: number | null;
};

type SurveyData = {
  examType: "JEE" | "NEET" | null;
  currentClass: "Class 11" | "Class 12" | "Dropper" | null;
  preparationLevel: "Beginner" | "Intermediate" | "Advanced" | null;
  studyPreferences: string[];
  dailyStudyTime: "1 hour" | "2-3 hours" | "4+ hours" | null;
};

type UserGoals = {
  dailyQuestions: number;
  weeklyTopics: number;
  streak: number;
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
  goals: UserGoals;
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
  partialSurveyData: SurveyData;
  surveyCurrStep: number;
  practiceSession: PracticeSession;
  practiceProgress: PracticeProgress;
  studiedChapters: string[];
  // Auth actions
  signOut: () => void;
  // Onboarding actions
  completeSurvey: (data: SurveyData) => void;
  updateSurveyProgress: (step: number, data: Partial<SurveyData>) => void;
  resetSurveyProgress: () => void;
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
  // Goal actions
  updateUserGoals: (goals: Partial<UserGoals>) => void;
  // Practice flow actions
  updatePracticeProgress: (
    xpEarned: number,
    isCorrect: boolean,
    timeSpent: number,
  ) => void;
  startPracticeSession: (
    subject: string,
    type: PracticeType,
    goal: number,
  ) => void;
  setPracticeStep: (step: number, totalSteps?: number) => void;
  updatePracticeStepInfo: (data: Partial<PracticeProgress>) => void;
  completePracticeSession: () => void;
  resetPracticeProgress: () => void;
  // Pet actions
  feedPet: () => void;
  playWithPet: () => void;
  updatePetMood: () => void;
  updateTemperature: () => void;
  coolDownPenguin: () => boolean;
  // Chapter actions
  updateStudiedChapters: (chapters: string[]) => void;
  // Supabase data loading
  fetchUserProfile: () => Promise<void>;
};

const defaultGoals: UserGoals = {
  dailyQuestions: 20,
  weeklyTopics: 3,
  streak: 7
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
  goals: defaultGoals
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

const defaultPracticeProgress: PracticeProgress = {
  currentStep: 1,
  totalSteps: 4, // Subject → Type → Goal → Questions
  subject: null,
  type: null,
  goal: null
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Keys for AsyncStorage
const STORAGE_KEYS = {
  USER_DATA: '@doable:user_data',
  PET_DATA: '@doable:pet_data',
  SURVEY_DATA: '@doable:survey_data',
  STUDIED_CHAPTERS: '@doable:studied_chapters',
  USER_GOALS: '@doable:user_goals',
  PRACTICE_PROGRESS: '@doable:practice_progress',
  SURVEY_PROGRESS: '@doable:survey_progress'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useAuth();
  const [user, setUser] = useState<UserData>(defaultUser);
  const [pet, setPet] = useState<PetData>(defaultPet);
  const [surveyData, setSurveyData] = useState<SurveyData>(defaultSurveyData);
  const [partialSurveyData, setPartialSurveyData] = useState<SurveyData>(defaultSurveyData);
  const [surveyCurrStep, setSurveyCurrStep] = useState<number>(0);
  const [practiceSession, setPracticeSession] = useState<PracticeSession>(
    defaultPracticeSession,
  );
  const [practiceProgress, setPracticeProgress] = useState<PracticeProgress>(
    defaultPracticeProgress
  );
  const [studiedChapters, setStudiedChapters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted data on app start
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [userData, petData, surveyData, chaptersData, goalsData, practiceProgressData, surveyProgressData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.PET_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.SURVEY_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.STUDIED_CHAPTERS),
          AsyncStorage.getItem(STORAGE_KEYS.USER_GOALS),
          AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_PROGRESS),
          AsyncStorage.getItem(STORAGE_KEYS.SURVEY_PROGRESS),
        ]);

        if (userData) setUser({ ...defaultUser, ...JSON.parse(userData) });
        if (petData) setPet({ ...defaultPet, ...JSON.parse(petData) });
        if (surveyData) setSurveyData({ ...defaultSurveyData, ...JSON.parse(surveyData) });
        if (chaptersData) setStudiedChapters(JSON.parse(chaptersData));
        if (goalsData) setUser(prevUser => ({
          ...prevUser,
          goals: JSON.parse(goalsData)
        }));
        if (practiceProgressData) setPracticeProgress({ ...defaultPracticeProgress, ...JSON.parse(practiceProgressData) });
        
        if (surveyProgressData) {
          const parsedData = JSON.parse(surveyProgressData);
          setPartialSurveyData(parsedData.data || defaultSurveyData);
          setSurveyCurrStep(parsedData.step || 0);
        }
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
          goals: user.goals
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

    // Only save if we have chapters to save and the component is mounted
    if (studiedChapters.length > 0) {
      saveStudiedChapters();
    }
  }, [studiedChapters]);

  // Save goals when they change
  useEffect(() => {
    const saveGoals = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_GOALS, JSON.stringify(user.goals));
      } catch (error) {
        console.error('Error saving user goals:', error);
      }
    };

    saveGoals();
  }, [user.goals]);

  // Save practice progress data when it changes
  useEffect(() => {
    const savePracticeProgress = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_PROGRESS, JSON.stringify(practiceProgress));
      } catch (error) {
        console.error('Error saving practice progress:', error);
      }
    };

    savePracticeProgress();
  }, [practiceProgress]);

  // Save survey progress when it changes
  useEffect(() => {
    const saveSurveyProgress = async () => {
      try {
        const progressData = {
          step: surveyCurrStep,
          data: partialSurveyData
        };
        await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_PROGRESS, JSON.stringify(progressData));
      } catch (error) {
        console.error('Error saving survey progress:', error);
      }
    };

    saveSurveyProgress();
  }, [surveyCurrStep, partialSurveyData]);

  // Clear persisted data on sign out
  const clearPersistedData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.PET_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.SURVEY_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.STUDIED_CHAPTERS),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_GOALS),
        AsyncStorage.removeItem(STORAGE_KEYS.PRACTICE_PROGRESS),
        AsyncStorage.removeItem(STORAGE_KEYS.SURVEY_PROGRESS),
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

  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    if (!user.isAuthenticated || !clerkUser) return;
    
    try {
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUser.id)
        .single();
        
      if (userError) throw userError;
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', clerkUser.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Fetch study preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('study_preferences')
        .select('*')
        .eq('user_id', clerkUser.id)
        .maybeSingle();
      
      // Update user state with Supabase data
      setUser(prev => ({
        ...prev,
        isOnboarded: userData.is_onboarded,
        isProfileSetup: userData.is_profile_setup,
        firstName: userData.first_name || prev.firstName,
        lastName: userData.last_name || prev.lastName,
        dateOfBirth: userData.date_of_birth ? new Date(userData.date_of_birth) : prev.dateOfBirth,
        parentMobile: userData.parent_mobile || prev.parentMobile,
        xp: profileData.xp,
        level: profileData.level,
        streak: profileData.streak,
        streakGoal: profileData.streak_goal,
        notificationsEnabled: profileData.notifications_enabled,
        rank: profileData.rank,
        goals: prefsData ? {
          dailyQuestions: prefsData.daily_questions_goal,
          weeklyTopics: prefsData.weekly_topics_goal,
          streak: prefsData.streak_goal
        } : prev.goals
      }));
      
      return;
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
      });
      
      // Fetch user profile data from Supabase
      fetchUserProfile();
      
      // Ensure database constraints
      ensureUserStudiedTopicsConstraints()
        .catch(err => console.error('Error ensuring database constraints:', err));
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

  // Onboarding actions
  const completeSurvey = (data: SurveyData) => {
    setSurveyData(data);
    setUser({
      ...user,
      isOnboarded: true,
    });

    // Clear survey progress when completed
    resetSurveyProgress();
  };

  // Profile setup actions
  const completeProfileSetup = async (
    firstName: string,
    lastName: string,
    dateOfBirth: Date | null,
    parentMobile: string,
  ) => {
    if (!isSignedIn || !clerkUser) return;
    
    try {
      // Update user record in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth ? dateOfBirth.toISOString() : null,
          parent_mobile: parentMobile,
          is_profile_setup: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', clerkUser.id);
        
      if (error) throw error;
        
      // Update local state
      setUser((prevUser) => ({
        ...prevUser,
        firstName,
        lastName,
        dateOfBirth,
        parentMobile,
        isProfileSetup: true,
      }));
    } catch (error) {
      console.error('Error updating profile in Supabase:', error);
    }
  };

  // Streak actions
  const updateStreakGoal = async (days: number) => {
    if (!isSignedIn || !clerkUser) return;
    
    try {
      // Update streak goal in user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          streak_goal: days,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', clerkUser.id);
        
      if (profileError) throw profileError;
      
      // Also update in study_preferences if it exists
      const { error: prefError } = await supabase
        .from('study_preferences')
        .update({
          streak_goal: days,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', clerkUser.id);
        
      // Update local state
      setUser((prevUser) => ({
        ...prevUser,
        streakGoal: days,
        goals: {
          ...prevUser.goals,
          streak: days
        }
      }));
    } catch (error) {
      console.error('Error updating streak goal in Supabase:', error);
    }
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

  // Goal actions
  const updateUserGoals = (goals: Partial<UserGoals>) => {
    setUser(prevUser => ({
      ...prevUser,
      goals: {
        ...prevUser.goals,
        ...goals
      }
    }));
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

  // Practice flow management functions
  const setPracticeStep = (step: number, totalSteps?: number) => {
    setPracticeProgress(prev => ({
      ...prev,
      currentStep: step,
      totalSteps: totalSteps || prev.totalSteps
    }));
  };

  const updatePracticeStepInfo = (data: Partial<PracticeProgress>) => {
    setPracticeProgress(prev => ({
      ...prev,
      ...data
    }));
  };

  const resetPracticeProgress = () => {
    setPracticeProgress(defaultPracticeProgress);
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
    
    // Update practice progress with final values
    setPracticeProgress(prev => ({
      ...prev,
      subject,
      type,
      goal,
      currentStep: 4 // Final step (Questions)
    }));
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

    // Reset practice session and progress
    setPracticeSession(defaultPracticeSession);
    resetPracticeProgress();
  };

  // Chapter actions
  const updateStudiedChapters = (chapters: string[]) => {
    // Only update if the chapters array has actually changed
    // This prevents unnecessary re-renders and state updates
    if (JSON.stringify(chapters) !== JSON.stringify(studiedChapters)) {
      setStudiedChapters(chapters);
    }
  };

  // Add function to update survey progress
  const updateSurveyProgress = (step: number, data: Partial<SurveyData>) => {
    setSurveyCurrStep(step);
    setPartialSurveyData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  // Add function to reset survey progress
  const resetSurveyProgress = () => {
    setSurveyCurrStep(0);
    setPartialSurveyData(defaultSurveyData);
    // Also remove from AsyncStorage
    AsyncStorage.removeItem(STORAGE_KEYS.SURVEY_PROGRESS).catch(err => 
      console.error('Error removing survey progress:', err)
    );
  };

  const value = {
    user,
    pet,
    surveyData,
    partialSurveyData,
    surveyCurrStep,
    practiceSession,
    practiceProgress,
    studiedChapters,
    signOut,
    completeSurvey,
    updateSurveyProgress,
    resetSurveyProgress,
    completeProfileSetup,
    updateStreakGoal,
    updateNotificationPreference,
    isFirstPracticeSession,
    updateUserGoals,
    updatePracticeProgress,
    startPracticeSession,
    setPracticeStep,
    updatePracticeStepInfo,
    completePracticeSession,
    resetPracticeProgress,
    feedPet,
    playWithPet,
    updatePetMood,
    updateTemperature,
    coolDownPenguin,
    updateStudiedChapters,
    fetchUserProfile
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
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
