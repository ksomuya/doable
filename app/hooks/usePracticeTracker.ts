import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useAppContext } from '../context/AppContext';
import { incrementPracticeAttempt } from '../utils/practiceUtils';
import { PracticeAttempt, PracticeType } from '../utils/types';

/**
 * Hook to track practice attempts and increment counters
 * @param practiceType The type of practice session
 * @returns Functions and state to track practice activity
 */
const usePracticeTracker = (practiceType: PracticeType) => {
  const { user: clerkUser } = useUser();
  const { practiceProgress } = useAppContext();
  
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [incrementError, setIncrementError] = useState<string | null>(null);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  
  // Track practice attempts and increment counters
  const trackAttempt = async (attempt: PracticeAttempt) => {
    if (!clerkUser?.id) return;
    
    // Add attempt to local state
    setAttempts(prev => [...prev, attempt]);
    
    // Increment practice attempt counter
    try {
      setIsIncrementing(true);
      setIncrementError(null);
      
      const { stats, newlyUnlocked, error } = await incrementPracticeAttempt(
        clerkUser.id,
        practiceType,
        1  // Increment by 1
      );
      
      if (error) {
        setIncrementError(error);
      } else if (newlyUnlocked && newlyUnlocked.length > 0) {
        setNewUnlocks(newlyUnlocked);
      }
    } catch (err: any) {
      setIncrementError(err.message || 'Failed to track attempt');
    } finally {
      setIsIncrementing(false);
    }
  };
  
  // Get stats about the current session
  const getSessionStats = () => {
    const correctCount = attempts.filter(a => a.is_correct).length;
    const totalCount = attempts.length;
    const averageTime = totalCount > 0 
      ? attempts.reduce((sum, a) => sum + a.time_taken_seconds, 0) / totalCount 
      : 0;
    
    return {
      correctCount,
      totalCount,
      accuracy: totalCount > 0 ? (correctCount / totalCount) * 100 : 0,
      averageTime
    };
  };
  
  // Reset the tracker state
  const resetTracker = () => {
    setAttempts([]);
    setIncrementError(null);
    setNewUnlocks([]);
  };
  
  return {
    trackAttempt,
    getSessionStats,
    resetTracker,
    attempts,
    newUnlocks,
    isIncrementing,
    error: incrementError,
  };
};

export default usePracticeTracker; 