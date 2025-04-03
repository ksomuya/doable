Below is an **updated** Database Requirements Document with **all virtual-pet references removed**. Anywhere we had mention of “virtual pets,” “pet stats,” or a `virtual_pets` table has been taken out. All other features remain the same.

---

# Doable – Comprehensive Database Requirements Document (No Virtual Pets)

## Table of Contents
1. [Overview](#overview)  
2. [Database Tables](#database-tables)  
   1. [Users](#1-users)  
   2. [User Profiles](#2-user-profiles)  
   3. [User Goals](#3-user-goals)  
   4. [Onboarding Surveys](#4-onboarding-surveys)  
   5. [Study Preferences](#5-study-preferences)  
   6. [Subjects](#6-subjects)  
   7. [Chapters](#7-chapters)  
   8. [User Studied Chapters](#8-user-studied-chapters)  
   9. [Questions](#9-questions)  
   10. [Answer Options](#10-answer-options)  
   11. [Practice Sessions](#11-practice-sessions)  
   12. [Question Attempts](#12-question-attempts)  
   13. [User Bookmarks](#13-user-bookmarks)  
   14. [User Activities](#14-user-activities)  
   15. [Notifications](#15-notifications)  
   16. [Leaderboard Entries](#16-leaderboard-entries)  
   17. [User Reports (Daily, Weekly, Monthly)](#17-user-reports)  
   18. [User Streaks](#18-user-streaks)  
   19. [User Recommendations](#19-user-recommendations)  
   20. [Spaced Review Schedule](#20-spaced-review-schedule)  
   21. [Topic Tagging](#21-topic-tagging)  
   22. [System Jobs Log](#22-system-jobs-log)  
3. [Relationships](#relationships)  
4. [Indexes](#indexes)  
5. [Views](#views)  
6. [Functions & Triggers](#functions--triggers)  
   1. [Streak / XP Updates](#streak--xp-updates)  
   2. [Completing Practice Session](#completing-practice-session)  
   3. [Studied Chapters](#studied-chapters)  
   4. [Reports (Daily/Weekly/Monthly)](#reports-dailyweeklymonthly)  
   5. [Recommendations & Similarity](#recommendations--similarity)  
   6. [Spaced Repetition Updates](#spaced-repetition-updates)  
7. [Supabase Edge Functions](#supabase-edge-functions)  
8. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)  
9. [External Integrations](#external-integrations)  

---

## 1. Overview

**Doable** is a gamified learning application that helps students prepare for competitive exams (e.g., JEE/NEET) through **practice sessions, leaderboards, progress analytics,** and more. This document covers the baseline requirements and advanced features like **weekly/monthly reports, spaced repetition scheduling, user recommendations, tagging,** and scheduled tasks. 

**Key changes**: 
- **No virtual pet** (removed `virtual_pets` table and related references).  
- **Users** are stored with `id text` as the primary key (matching Clerk user ID).

---

## 2. Database Tables

### 2.1 **Users**

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,                 -- Matches Clerk user ID
  email text,
  first_name text,
  last_name text,
  photo_url text,
  date_of_birth date,
  parent_mobile text,
  is_onboarded boolean DEFAULT false,
  is_profile_setup boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

| Field            | Type      | Description                     |
|------------------|-----------|---------------------------------|
| id               | text PK   | Matches Clerk user ID           |
| email            | text      | User's email                    |
| first_name       | text      | User's first name               |
| last_name        | text      | User's last name                |
| photo_url        | text      | Profile picture URL             |
| date_of_birth    | date      | Date of birth                   |
| parent_mobile    | text      | Parent's mobile number          |
| is_onboarded     | boolean   | Completed onboarding?           |
| is_profile_setup | boolean   | Completed profile setup?        |
| created_at       | timestamp | Creation timestamp              |
| updated_at       | timestamp | Last update timestamp           |

---

### 2.2 **User Profiles**

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  snowballs integer DEFAULT 0,
  streak integer DEFAULT 0,
  streak_goal integer DEFAULT 0,
  notifications_enabled boolean DEFAULT true,
  rank integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

| Field                  | Type    | Description                        |
|------------------------|---------|------------------------------------|
| id                     | uuid PK | Primary key                        |
| user_id                | text FK | References `users(id)`             |
| xp                     | integer | Total experience points            |
| level                  | integer | User level                         |
| snowballs              | integer | Virtual currency (pet is removed, but currency remains if needed) |
| streak                 | integer | Current streak days                |
| streak_goal            | integer | Target streak goal                 |
| notifications_enabled  | boolean | Toggle for notifications           |
| rank                   | integer | Leaderboard rank                   |
| created_at             | timestamp | Creation timestamp               |
| updated_at             | timestamp | Last update timestamp            |

---

### 2.3 **User Goals**

```sql
CREATE TABLE IF NOT EXISTS public.user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  daily_questions integer,
  weekly_topics integer,
  streak integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

### 2.4 **Onboarding Surveys**

```sql
CREATE TABLE IF NOT EXISTS public.onboarding_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  exam_type text,
  current_class text,
  preparation_level text,
  daily_study_time text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

### 2.5 **Study Preferences**

```sql
CREATE TABLE IF NOT EXISTS public.study_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  preference text,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 2.6 **Subjects**

```sql
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

### 2.7 **Chapters**

```sql
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

### 2.8 **User Studied Chapters**

```sql
CREATE TABLE IF NOT EXISTS public.user_studied_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  study_date date,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 2.9 **Questions**

```sql
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  difficulty text CHECK (difficulty IN ('Easy','Medium','Hard')),
  explanation text,
  hint text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

### 2.10 **Answer Options**

```sql
CREATE TABLE IF NOT EXISTS public.answer_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  option_order integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

### 2.11 **Practice Sessions**

```sql
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id),
  practice_type text,  -- 'refine', 'recall', 'conquer', 'custom'
  xp_goal integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  questions_answered integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  completed boolean DEFAULT false,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 2.12 **Question Attempts**

```sql
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES public.answer_options(id),
  is_correct boolean,
  time_spent integer,
  xp_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 2.13 **User Bookmarks**

```sql
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 2.14 **User Activities**

```sql
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type text,
  description text,
  xp_gained integer DEFAULT 0,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 2.15 **Notifications**

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 2.16 **Leaderboard Entries**

```sql
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  rank integer,
  xp integer,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 2.17 **User Reports (Daily, Weekly, Monthly)** <a name="17-user-reports"></a>

Stores aggregated user performance metrics. All references to `user_id` are `text`.

#### 2.17.1 **user_reports_daily**

```sql
CREATE TABLE IF NOT EXISTS public.user_reports_daily (
  user_id text REFERENCES public.users(id),
  report_date date,
  total_questions integer DEFAULT 0,
  correct_questions integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  total_time_spent integer DEFAULT 0,
  best_hour integer,
  worst_hour integer,
  best_topic_id uuid,
  worst_topic_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, report_date)
);
```

#### 2.17.2 **user_reports_weekly**

```sql
CREATE TABLE IF NOT EXISTS public.user_reports_weekly (
  user_id text REFERENCES public.users(id),
  week_start_date date,
  total_questions integer DEFAULT 0,
  correct_questions integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  best_day text,
  worst_day text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, week_start_date)
);
```

#### 2.17.3 **user_reports_monthly**

```sql
CREATE TABLE IF NOT EXISTS public.user_reports_monthly (
  user_id text REFERENCES public.users(id),
  month_year text, -- e.g. '2025-04'
  total_questions integer DEFAULT 0,
  correct_questions integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  top_day date,
  low_day date,
  topic_growth jsonb,
  topic_decline jsonb,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, month_year)
);
```

---

### 2.18 **User Streaks** <a name="18-user-streaks"></a>

```sql
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_active_date date,
  updated_at timestamp with time zone DEFAULT now()
);
```

---

### 2.19 **User Recommendations** <a name="19-user-recommendations"></a>

*(Optional for advanced adaptive logic.)*

```sql
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  priority_score numeric(5,2),
  reason text,
  recommended_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);
```

---

### 2.20 **Spaced Review Schedule** <a name="20-spaced-review-schedule"></a>

*(Optional for spaced repetition.)*

```sql
CREATE TABLE IF NOT EXISTS public.spaced_review_schedule (
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id uuid,  -- references chapters.id or a separate 'topics' table
  next_review date,
  interval_days integer DEFAULT 1,
  ease_factor numeric(5,2) DEFAULT 2.5,
  repetitions integer DEFAULT 0,
  last_review date,
  PRIMARY KEY (user_id, topic_id)
);
```

---

### 2.21 **Topic Tagging** <a name="21-topic-tagging"></a>

*(Optional for advanced tagging.)*

```sql
CREATE TABLE IF NOT EXISTS public.topic_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.topic_tag_map (
  topic_id uuid,
  tag_id uuid REFERENCES public.topic_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, tag_id)
);
```

---

### 2.22 **System Jobs Log** <a name="22-system-jobs-log"></a>

*(Optional for cron/scheduled tasks.)*

```sql
CREATE TABLE IF NOT EXISTS public.system_jobs_log (
  job_name text,
  run_date date,
  run_time timestamp with time zone,
  status text,
  notes text,
  PRIMARY KEY (job_name, run_date)
);
```

---

## 3. Relationships

1. **users : user_profiles** (1:1)  
2. **users : user_goals** (1:1)  
3. **users : onboarding_surveys** (1:1)  
4. **users : study_preferences** (1:N)  
5. **users : user_studied_chapters** (1:N)  
6. **users : practice_sessions** (1:N)  
7. **users : user_bookmarks** (1:N)  
8. **users : user_activities** (1:N)  
9. **users : notifications** (1:N)  
10. **subjects : chapters** (1:N)  
11. **chapters : questions** (1:N)  
12. **questions : answer_options** (1:N)  
13. **practice_sessions : question_attempts** (1:N)  
14. **user_reports_daily / weekly / monthly** each references user  
15. **user_streaks : users** (1:1)  
16. **user_recommendations : users** (N:1) and `user_recommendations : questions` (N:1)  
17. **spaced_review_schedule** references user + topics  

---

## 4. Indexes

Usual indexing on `user_id` (type text) for quick lookups. Example:

```sql
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
```

Similarly for `practice_sessions(user_id)`, etc.

---

## 5. Views

Same as before (e.g., `user_stats_view`, `daily_activity_view`, `leaderboard_view`). Just ensure references to `user_id` are typed `text`.

---

## 6. Functions & Triggers <a name="functions--triggers"></a>

### 6.1 Streak / XP Updates <a name="streak--xp-updates"></a>
- `trigger_update_user_streak`: invoked after `user_activities` insert
- `trigger_update_user_level`: invoked before `xp` changes in `user_profiles`

### 6.2 Completing Practice Session <a name="completing-practice-session"></a>
- `trigger_complete_practice_session`: updates user XP, logs activity, etc.

### 6.3 Studied Chapters <a name="studied-chapters"></a>
- `trigger_record_studied_chapter`: awarding XP for each new studied chapter.

### 6.4 Reports (Daily/Weekly/Monthly) <a name="reports-dailyweeklymonthly"></a>
- `generate_daily_report(user_id, date)`
- `generate_weekly_report(user_id, start_date)`
- `generate_monthly_report(user_id, 'YYYY-MM')`
- Each upserts into `user_reports_daily`, `user_reports_weekly`, `user_reports_monthly`.

### 6.5 Recommendations & Similarity (Optional) <a name="recommendations--similarity"></a>
- `update_similar_users(user_id) / get_similar_users()`
- `recommend_next_questions(user_id)` to fill `user_recommendations`.

### 6.6 Spaced Repetition Updates (Optional) <a name="spaced-repetition-updates"></a>
- `update_spaced_review_schedule(user_id, topic_id, success boolean)` to adjust intervals, ease factor, etc.

---

## 7. Supabase Edge Functions <a name="supabase-edge-functions"></a>
Possible Edge Functions include:

1. **syncClerkUser**: Upserts user data from Clerk to `users`.  
2. **startPracticeSession**: Creates `practice_sessions` record and fetches recommended questions.  
3. **recordQuestionAttempt**: Logs user attempts, updates XP/stats.  
4. **completePracticeSession**: Marks session completed, triggers final reward logic.  
5. **fetchLeaderboard**: Returns top users plus your rank.  
6. **generateReports** (optional): daily/weekly scheduled function for `generate_daily_report`, etc.

*(Any pet-related function is now removed.)*

---

## 8. Row Level Security (RLS) Policies <a name="row-level-security-rls-policies"></a>

Enable RLS on each table referencing `user_id text`. For example:

```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can read their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "User can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);
```

Repeat similarly for `practice_sessions`, `question_attempts`, `user_studied_chapters`, etc. Allow public read on `questions`/`answer_options` if needed.

---

## 9. External Integrations <a name="external-integrations"></a>

1. **Clerk Authentication**  
   - Use `syncClerkUser` or direct JWT approach.  
   - If RLS, let `auth.uid()` match Clerk user ID (text).
2. **Expo Notifications**  
   - Store push tokens in `user_profiles` or separate table.  
   - Trigger them via edge functions or external server.
3. **Analytics Tools**  
   - Possibly log events in `user_activities` or a dedicated table.
4. **Supabase Storage / CDN**  
   - For hosting images or other assets if needed.
5. **Cron / Scheduling**  
   - Use Supabase’s cron triggers or an external scheduler for daily/weekly tasks.  
   - Log runs in `system_jobs_log`.

---