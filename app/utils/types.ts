// Practice types
export type PracticeType = "refine" | "recall" | "conquer";

// Practice attempt interface
export interface PracticeAttempt {
  question_id: string;
  is_correct: boolean;
  time_taken_seconds: number;
}

// Subject interface
export interface Subject {
  id: string;
  name: string;
  is_unlocked: boolean;
}

// Practice stats interface
export interface PracticeStats {
  recall_attempts: number;
  refine_attempts: number;
  conquer_attempts: number;
}

// Practice unlock interface
export interface PracticeUnlock {
  practice_type: string;
  unlocked_at: string;
}

// Available practice types interface
export interface AvailablePracticeTypes {
  recall: boolean;
  refine: boolean;
  conquer: boolean;
} 