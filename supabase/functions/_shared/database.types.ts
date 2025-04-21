export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chapter_exam_metadata: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          difficulty_profile: Json | null
          exam_type: string | null
          id: string
          importance: string | null
          priority_score: number | null
          question_frequency: number | null
          recommended_practice_time: number | null
          weightage: number | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          difficulty_profile?: Json | null
          exam_type?: string | null
          id?: string
          importance?: string | null
          priority_score?: number | null
          question_frequency?: number | null
          recommended_practice_time?: number | null
          weightage?: number | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          difficulty_profile?: Json | null
          exam_type?: string | null
          id?: string
          importance?: string | null
          priority_score?: number | null
          question_frequency?: number | null
          recommended_practice_time?: number | null
          weightage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_exam_metadata_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          class: string | null
          class_level: string | null
          created_at: string | null
          id: string
          jee_advanced: boolean | null
          jee_mains: boolean | null
          name: string
          neet: boolean | null
          subject_id: string | null
          updated_at: string | null
        }
        Insert: {
          class?: string | null
          class_level?: string | null
          created_at?: string | null
          id?: string
          jee_advanced?: boolean | null
          jee_mains?: boolean | null
          name: string
          neet?: boolean | null
          subject_id?: string | null
          updated_at?: string | null
        }
        Update: {
          class?: string | null
          class_level?: string | null
          created_at?: string | null
          id?: string
          jee_advanced?: boolean | null
          jee_mains?: boolean | null
          name?: string
          neet?: boolean | null
          subject_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_unlock_status"
            referencedColumns: ["subject_id"]
          },
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      dim_spaced_repetition_queue: {
        Row: {
          attempted_at: string | null
          created_at: string
          id: string
          is_correct: boolean | null
          phase: string | null
          priority_boost: number | null
          priority_score: number
          question_id: string | null
          recommendation_reason: string
          recommended_at: string
          scheduled_for: string | null
          shown_at: string | null
          status: string
          subject_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempted_at?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          phase?: string | null
          priority_boost?: number | null
          priority_score?: number
          question_id?: string | null
          recommendation_reason: string
          recommended_at?: string
          scheduled_for?: string | null
          shown_at?: string | null
          status?: string
          subject_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempted_at?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          phase?: string | null
          priority_boost?: number | null
          priority_score?: number
          question_id?: string | null
          recommendation_reason?: string
          recommended_at?: string
          scheduled_for?: string | null
          shown_at?: string | null
          status?: string
          subject_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dim_spaced_repetition_queue_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dim_spaced_repetition_queue_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_unlock_status"
            referencedColumns: ["subject_id"]
          },
          {
            foreignKeyName: "dim_spaced_repetition_queue_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dim_spaced_repetition_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dim_topic_mastery: {
        Row: {
          created_at: string | null
          ease_factor: number | null
          last_practiced: string | null
          mastery_level: number
          next_review_date: string | null
          repetition_count: number | null
          topic_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ease_factor?: number | null
          last_practiced?: string | null
          mastery_level: number
          next_review_date?: string | null
          repetition_count?: number | null
          topic_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          ease_factor?: number | null
          last_practiced?: string | null
          mastery_level?: number
          next_review_date?: string | null
          repetition_count?: number | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dim_topic_mastery_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dim_topic_mastery_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dim_topics: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          importance: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          importance?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          importance?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dim_topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      evt_daily_logins: {
        Row: {
          created_at: string | null
          login_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          login_date?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          login_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evt_daily_logins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evt_question_attempts: {
        Row: {
          attempt_no: number | null
          attempt_source: string | null
          avg_difficulty: number | null
          avg_time_sec: number | null
          bonus: boolean | null
          cat_theta_after: number | null
          cat_theta_before: number | null
          chapter_id: string | null
          completed_at: string | null
          confidence_level: string | null
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string | null
          started_at: string | null
          subject_id: string | null
          subtopic_id: string | null
          time_taken_seconds: number | null
          topic_id: string | null
          user_id: string | null
          xp_awarded: number | null
        }
        Insert: {
          attempt_no?: number | null
          attempt_source?: string | null
          avg_difficulty?: number | null
          avg_time_sec?: number | null
          bonus?: boolean | null
          cat_theta_after?: number | null
          cat_theta_before?: number | null
          chapter_id?: string | null
          completed_at?: string | null
          confidence_level?: string | null
          created_at?: string | null
          id?: string
          is_correct: boolean
          question_id?: string | null
          started_at?: string | null
          subject_id?: string | null
          subtopic_id?: string | null
          time_taken_seconds?: number | null
          topic_id?: string | null
          user_id?: string | null
          xp_awarded?: number | null
        }
        Update: {
          attempt_no?: number | null
          attempt_source?: string | null
          avg_difficulty?: number | null
          avg_time_sec?: number | null
          bonus?: boolean | null
          cat_theta_after?: number | null
          cat_theta_before?: number | null
          chapter_id?: string | null
          completed_at?: string | null
          confidence_level?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string | null
          started_at?: string | null
          subject_id?: string | null
          subtopic_id?: string | null
          time_taken_seconds?: number | null
          topic_id?: string | null
          user_id?: string | null
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evt_question_attempts_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evt_question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evt_question_attempts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_unlock_status"
            referencedColumns: ["subject_id"]
          },
          {
            foreignKeyName: "evt_question_attempts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evt_question_attempts_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evt_question_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evt_question_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evt_study_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          start_time: string
          topics_covered: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          topics_covered?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          topics_covered?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evt_study_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_surveys: {
        Row: {
          created_at: string | null
          current_class: string | null
          daily_study_time: string | null
          exam_type: string | null
          id: string
          preparation_level: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_class?: string | null
          daily_study_time?: string | null
          exam_type?: string | null
          id?: string
          preparation_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_class?: string | null
          daily_study_time?: string | null
          exam_type?: string | null
          id?: string
          preparation_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_surveys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_deliveries: {
        Row: {
          delivered_at: string | null
          delivery_uuid: string
          question_id: string | null
          session_id: string | null
        }
        Insert: {
          delivered_at?: string | null
          delivery_uuid: string
          question_id?: string | null
          session_id?: string | null
        }
        Update: {
          delivered_at?: string | null
          delivery_uuid?: string
          question_id?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_deliveries_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_deliveries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_session_questions: {
        Row: {
          answered_at: string | null
          created_at: string | null
          id: string
          is_answered: boolean | null
          is_correct: boolean | null
          presented_at: string | null
          question_id: string
          session_id: string
          time_taken: number | null
          updated_at: string | null
          user_answer: Json | null
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          is_correct?: boolean | null
          presented_at?: string | null
          question_id: string
          session_id: string
          time_taken?: number | null
          updated_at?: string | null
          user_answer?: Json | null
          user_id: string
        }
        Update: {
          answered_at?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          is_correct?: boolean | null
          presented_at?: string | null
          question_id?: string
          session_id?: string
          time_taken?: number | null
          updated_at?: string | null
          user_answer?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_session_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_session_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          bonus_started_at: string | null
          correct_count: number | null
          created_at: string | null
          difficulty: string | null
          end_time: string | null
          exam_id: string | null
          id: string
          mode: string | null
          practice_type: string
          questions_count: number | null
          start_time: string | null
          status: string
          subject_id: string | null
          topic_id: string | null
          updated_at: string | null
          user_id: string
          xp_goal: number | null
        }
        Insert: {
          bonus_started_at?: string | null
          correct_count?: number | null
          created_at?: string | null
          difficulty?: string | null
          end_time?: string | null
          exam_id?: string | null
          id?: string
          mode?: string | null
          practice_type: string
          questions_count?: number | null
          start_time?: string | null
          status?: string
          subject_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          user_id: string
          xp_goal?: number | null
        }
        Update: {
          bonus_started_at?: string | null
          correct_count?: number | null
          created_at?: string | null
          difficulty?: string | null
          end_time?: string | null
          exam_id?: string | null
          id?: string
          mode?: string | null
          practice_type?: string
          questions_count?: number | null
          start_time?: string | null
          status?: string
          subject_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string
          xp_goal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_practice_sessions_subject"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_practice_sessions_subject"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_unlock_status"
            referencedColumns: ["subject_id"]
          },
          {
            foreignKeyName: "practice_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "dim_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_unlocks: {
        Row: {
          created_at: string | null
          id: string
          practice_type: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          practice_type: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          practice_type?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prelaunch_signups: {
        Row: {
          created_at: string | null
          email: string
          exam_type: string | null
          id: string
          name: string | null
          signup_date: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          exam_type?: string | null
          id?: string
          name?: string | null
          signup_date?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          exam_type?: string | null
          id?: string
          name?: string | null
          signup_date?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          chapter_id: string
          content_hash: string | null
          converted_from: string | null
          correct_answer: string
          created_at: string | null
          desmos_formula: string | null
          difficulty: string | null
          exam: string | null
          generated_at: string | null
          id: string
          image_url: string | null
          options: Json | null
          question_text: string
          question_type: string
          smiles_string: string | null
          solution: string | null
          step_by_step_solution: string | null
          subject_id: string
          subtopic_id: string
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          chapter_id?: string
          content_hash?: string | null
          converted_from?: string | null
          correct_answer: string
          created_at?: string | null
          desmos_formula?: string | null
          difficulty?: string | null
          exam?: string | null
          generated_at?: string | null
          id?: string
          image_url?: string | null
          options?: Json | null
          question_text: string
          question_type: string
          smiles_string?: string | null
          solution?: string | null
          step_by_step_solution?: string | null
          subject_id?: string
          subtopic_id?: string
          topic_id?: string
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string
          content_hash?: string | null
          converted_from?: string | null
          correct_answer?: string
          created_at?: string | null
          desmos_formula?: string | null
          difficulty?: string | null
          exam?: string | null
          generated_at?: string | null
          id?: string
          image_url?: string | null
          options?: Json | null
          question_text?: string
          question_type?: string
          smiles_string?: string | null
          solution?: string | null
          step_by_step_solution?: string | null
          subject_id?: string
          subtopic_id?: string
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_unlock_status"
            referencedColumns: ["subject_id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_daily_overview: {
        Row: {
          accuracy_pct: number | null
          attention_threshold_q: number | null
          avg_difficulty: number | null
          avg_time_sec: number | null
          best_hour_utc: number | null
          chapters_completed: number | null
          created_at: string | null
          day: string
          streak_after_today: number | null
          study_minutes_total: number | null
          topics_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_pct?: number | null
          attention_threshold_q?: number | null
          avg_difficulty?: number | null
          avg_time_sec?: number | null
          best_hour_utc?: number | null
          chapters_completed?: number | null
          created_at?: string | null
          day: string
          streak_after_today?: number | null
          study_minutes_total?: number | null
          topics_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_pct?: number | null
          attention_threshold_q?: number | null
          avg_difficulty?: number | null
          avg_time_sec?: number | null
          best_hour_utc?: number | null
          chapters_completed?: number | null
          created_at?: string | null
          day?: string
          streak_after_today?: number | null
          study_minutes_total?: number | null
          topics_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rep_daily_overview_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_exam_readiness: {
        Row: {
          created_at: string | null
          exam_type: string | null
          predicted_range_high: number | null
          predicted_range_low: number | null
          readiness_score: number | null
          updated_at: string | null
          user_id: string
          weakest_subjects: Json | null
          weakest_topics: Json | null
        }
        Insert: {
          created_at?: string | null
          exam_type?: string | null
          predicted_range_high?: number | null
          predicted_range_low?: number | null
          readiness_score?: number | null
          updated_at?: string | null
          user_id: string
          weakest_subjects?: Json | null
          weakest_topics?: Json | null
        }
        Update: {
          created_at?: string | null
          exam_type?: string | null
          predicted_range_high?: number | null
          predicted_range_low?: number | null
          readiness_score?: number | null
          updated_at?: string | null
          user_id?: string
          weakest_subjects?: Json | null
          weakest_topics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "rep_exam_readiness_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_monthly_overview: {
        Row: {
          accuracy_by_subject: Json | null
          created_at: string | null
          month: number
          month_start: string | null
          study_minutes_total: number | null
          subjects_progress: Json | null
          top_weak_topics: string[] | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          accuracy_by_subject?: Json | null
          created_at?: string | null
          month: number
          month_start?: string | null
          study_minutes_total?: number | null
          subjects_progress?: Json | null
          top_weak_topics?: string[] | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          accuracy_by_subject?: Json | null
          created_at?: string | null
          month?: number
          month_start?: string | null
          study_minutes_total?: number | null
          subjects_progress?: Json | null
          top_weak_topics?: string[] | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "rep_monthly_overview_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_weekly_overview: {
        Row: {
          accuracy_by_subject: Json | null
          attention_threshold_q: number | null
          avg_difficulty: number | null
          avg_time_sec: number | null
          best_day_of_week: number | null
          created_at: string | null
          iso_week: number
          iso_year: number
          study_minutes_total: number | null
          subjects_progress: Json | null
          top_weak_topics: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_by_subject?: Json | null
          attention_threshold_q?: number | null
          avg_difficulty?: number | null
          avg_time_sec?: number | null
          best_day_of_week?: number | null
          created_at?: string | null
          iso_week: number
          iso_year: number
          study_minutes_total?: number | null
          subjects_progress?: Json | null
          top_weak_topics?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_by_subject?: Json | null
          attention_threshold_q?: number | null
          avg_difficulty?: number | null
          avg_time_sec?: number | null
          best_day_of_week?: number | null
          created_at?: string | null
          iso_week?: number
          iso_year?: number
          study_minutes_total?: number | null
          subjects_progress?: Json | null
          top_weak_topics?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rep_weekly_overview_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      study_preferences: {
        Row: {
          created_at: string | null
          id: string
          preference: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preference?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          id: string
          jee_advanced: boolean | null
          jee_mains: boolean | null
          name: string
          neet: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jee_advanced?: boolean | null
          jee_mains?: boolean | null
          name: string
          neet?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jee_advanced?: boolean | null
          jee_mains?: boolean | null
          name?: string
          neet?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subtopic_exam_metadata: {
        Row: {
          created_at: string | null
          difficulty: string | null
          exam_type: string | null
          expected_question_count: number | null
          id: string
          importance: string | null
          priority_score: number | null
          recommended_practice_time: number | null
          subtopic_id: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          exam_type?: string | null
          expected_question_count?: number | null
          id?: string
          importance?: string | null
          priority_score?: number | null
          recommended_practice_time?: number | null
          subtopic_id?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          exam_type?: string | null
          expected_question_count?: number | null
          id?: string
          importance?: string | null
          priority_score?: number | null
          recommended_practice_time?: number | null
          subtopic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtopic_exam_metadata_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
        ]
      }
      subtopics: {
        Row: {
          created_at: string | null
          id: string
          subtopic_name: string
          topic_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          subtopic_name: string
          topic_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          subtopic_name?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtopics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_exam_metadata: {
        Row: {
          created_at: string | null
          difficulty_distribution: Json | null
          exam_type: string | null
          id: string
          importance: string | null
          priority_score: number | null
          question_frequency: number | null
          recommended_practice_time: number | null
          topic_id: string | null
          weightage: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty_distribution?: Json | null
          exam_type?: string | null
          id?: string
          importance?: string | null
          priority_score?: number | null
          question_frequency?: number | null
          recommended_practice_time?: number | null
          topic_id?: string | null
          weightage?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty_distribution?: Json | null
          exam_type?: string | null
          id?: string
          importance?: string | null
          priority_score?: number | null
          question_frequency?: number | null
          recommended_practice_time?: number | null
          topic_id?: string | null
          weightage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_exam_metadata_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          importance: string | null
          jee_advanced: boolean | null
          jee_mains: boolean | null
          jee_weightage: number | null
          learning_outcomes: string[] | null
          name: string
          neet: boolean | null
          neet_weightage: number | null
          practice_time_minutes: number | null
          prerequisites: string[] | null
          questions_frequency: number | null
          updated_at: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          importance?: string | null
          jee_advanced?: boolean | null
          jee_mains?: boolean | null
          jee_weightage?: number | null
          learning_outcomes?: string[] | null
          name: string
          neet?: boolean | null
          neet_weightage?: number | null
          practice_time_minutes?: number | null
          prerequisites?: string[] | null
          questions_frequency?: number | null
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          importance?: string | null
          jee_advanced?: boolean | null
          jee_mains?: boolean | null
          jee_weightage?: number | null
          learning_outcomes?: string[] | null
          name?: string
          neet?: boolean | null
          neet_weightage?: number | null
          practice_time_minutes?: number | null
          prerequisites?: string[] | null
          questions_frequency?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_practice_stats: {
        Row: {
          conquer_attempts: number | null
          created_at: string | null
          recall_attempts: number | null
          refine_attempts: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conquer_attempts?: number | null
          created_at?: string | null
          recall_attempts?: number | null
          refine_attempts?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conquer_attempts?: number | null
          created_at?: string | null
          recall_attempts?: number | null
          refine_attempts?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          completed_initial_eval: boolean | null
          created_at: string | null
          evaluation_completed: boolean | null
          id: string
          level: number | null
          notifications_enabled: boolean | null
          rank: number | null
          snowballs: number | null
          streak: number | null
          streak_goal: number | null
          updated_at: string | null
          user_id: string | null
          xp: number | null
        }
        Insert: {
          completed_initial_eval?: boolean | null
          created_at?: string | null
          evaluation_completed?: boolean | null
          id?: string
          level?: number | null
          notifications_enabled?: boolean | null
          rank?: number | null
          snowballs?: number | null
          streak?: number | null
          streak_goal?: number | null
          updated_at?: string | null
          user_id?: string | null
          xp?: number | null
        }
        Update: {
          completed_initial_eval?: boolean | null
          created_at?: string | null
          evaluation_completed?: boolean | null
          id?: string
          level?: number | null
          notifications_enabled?: boolean | null
          rank?: number | null
          snowballs?: number | null
          streak?: number | null
          streak_goal?: number | null
          updated_at?: string | null
          user_id?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          current_streak: number | null
          last_active_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          last_active_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          last_active_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_studied_chapters: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          id: string
          study_date: string | null
          user_id: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          study_date?: string | null
          user_id?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          study_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_studied_chapters_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_studied_chapters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_studied_topics: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          id: string
          study_date: string | null
          topic_id: string | null
          topic_id_normalized: string | null
          topic_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          study_date?: string | null
          topic_id?: string | null
          topic_id_normalized?: string | null
          topic_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          study_date?: string | null
          topic_id?: string | null
          topic_id_normalized?: string | null
          topic_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_studied_topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_studied_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_studied_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          is_onboarded: boolean | null
          is_profile_setup: boolean | null
          last_name: string | null
          parent_mobile: string | null
          photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_onboarded?: boolean | null
          is_profile_setup?: boolean | null
          last_name?: string | null
          parent_mobile?: string | null
          photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_onboarded?: boolean | null
          is_profile_setup?: boolean | null
          last_name?: string | null
          parent_mobile?: string | null
          photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      subject_unlock_status: {
        Row: {
          is_unlocked: boolean | null
          subject_id: string | null
          subject_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_studied_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_create_user: {
        Args: { admin_email: string; admin_password: string }
        Returns: Json
      }
      check_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      complete_practice_session: {
        Args: { session_id: string }
        Returns: undefined
      }
      create_first_admin: {
        Args: {
          admin_email: string
          admin_password: string
          first_name?: string
          last_name?: string
        }
        Returns: Json
      }
      create_standard_rls_policies: {
        Args: { table_name: string }
        Returns: undefined
      }
      ensure_all_employees: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_userid_consistency: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      fn_calculate_next_review: {
        Args: {
          p_repetition_count: number
          p_ease_factor: number
          p_performance_rating: number
        }
        Returns: string
      }
      fn_calculate_readiness: {
        Args: { p_user: string; p_exam_type: string }
        Returns: undefined
      }
      fn_queue_recommended_questions: {
        Args: { p_user: string; p_limit?: number }
        Returns: number
      }
      fn_rollup_daily: {
        Args: { p_user: string; p_day: string }
        Returns: undefined
      }
      fn_rollup_weekly: {
        Args: { p_user: string; p_year: number; p_week: number }
        Returns: undefined
      }
      fn_update_mastery: {
        Args: { p_user: string; p_topic: string }
        Returns: undefined
      }
      generate_daily_report: {
        Args: { p_user_id: string; p_date?: string }
        Returns: undefined
      }
      get_available_practice_modes: {
        Args: { user_id_param: string; topic_id_param: string }
        Returns: Json
      }
      get_available_subjects: {
        Args: { p_user_id: string; p_exam_id: string }
        Returns: {
          id: string
          name: string
          is_unlocked: boolean
        }[]
      }
      get_detailed_metrics: {
        Args: {
          p_user_id: string
          p_period_start?: string
          p_period_end?: string
          p_granularity?: string
        }
        Returns: {
          entity_id: string
          entity_name: string
          entity_type: string
          attempts_count: number
          correct_count: number
          accuracy_pct: number
          avg_time_sec: number
          avg_difficulty: number
        }[]
      }
      get_detailed_practice_snapshot: {
        Args: {
          user_id_param: string
          subject_id_param?: string
          exam_id_param?: string
        }
        Returns: Json
      }
      get_evaluation_questions: {
        Args: {
          p_user_id: string
          p_chapter_ids: string[]
          p_max_questions?: number
          p_max_per_topic?: number
        }
        Returns: {
          chapter_id: string
          content_hash: string | null
          converted_from: string | null
          correct_answer: string
          created_at: string | null
          desmos_formula: string | null
          difficulty: string | null
          exam: string | null
          generated_at: string | null
          id: string
          image_url: string | null
          options: Json | null
          question_text: string
          question_type: string
          smiles_string: string | null
          solution: string | null
          step_by_step_solution: string | null
          subject_id: string
          subtopic_id: string
          topic_id: string
          updated_at: string | null
        }[]
      }
      get_exam_readiness: {
        Args: Record<PropertyKey, never>
        Returns: {
          readiness_score: number
          predicted_range_low: number
          predicted_range_high: number
          weakest_subjects: Json
          weakest_topics: Json
        }[]
      }
      get_question_counts_by_subtopic_exam: {
        Args: Record<PropertyKey, never>
        Returns: {
          subtopic_id: string
          exam: string
          question_count: number
        }[]
      }
      get_recommended_questions: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          question_id: string
          question_text: string
          topic_id: string
          topic_name: string
          difficulty: number
          recommendation_score: number
        }[]
      }
      get_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_topic_progress: {
        Args: { p_user_id: string }
        Returns: {
          topic_id: string
          topic_name: string
          strength_score: number
          correct_count: number
          total_count: number
          last_studied: string
        }[]
      }
      increment_practice_attempt: {
        Args: {
          p_user_id: string
          p_practice_type: string
          p_increment?: number
        }
        Returns: {
          recall_attempts: number
          refine_attempts: number
          conquer_attempts: number
          newly_unlocked: string[]
        }[]
      }
      is_same_user: {
        Args: { check_id: string }
        Returns: boolean
      }
      record_daily_login: {
        Args: { p_user_id: string; p_login_date: string }
        Returns: boolean
      }
      record_studied_chapter: {
        Args: { p_user_id: string; p_chapter_id: string }
        Returns: undefined
      }
      refresh_all_users_exam_readiness: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_query: {
        Args: { query: string }
        Returns: Json[]
      }
      setup_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_admin_role: {
        Args: { user_email: string }
        Returns: undefined
      }
      update_all_reports: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_chapter_study_status: {
        Args: { p_user_id: string; p_chapter_id: string; p_studied: boolean }
        Returns: Json
      }
      update_daily_reports: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_topic_study_status: {
        Args: {
          p_user_id: string
          p_chapter_id: string
          p_topic_id: string
          p_topic_name: string
          p_studied: boolean
        }
        Returns: Json
      }
      update_weekly_reports: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      document_status: "pending" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      document_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const 