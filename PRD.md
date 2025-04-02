# Doable - Database Requirements Document

This document outlines the database requirements to transform the Doable frontend application into a fully functional full-stack application using Supabase as the backend.

## Table of Contents
1. [Overview](#overview)
2. [Database Tables](#database-tables)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Views](#views)
6. [Functions and Triggers](#functions-and-triggers)
7. [Supabase Edge Functions](#supabase-edge-functions)
8. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
9. [External Integrations](#external-integrations)

## Overview

Doable is an educational application focused on helping students study effectively through gamification, progress tracking, and virtual pet interactions. The app requires a database that can store user information, learning progress, practice sessions, and gamification elements like XP, streaks, and virtual pet status.

## Database Tables

### 1. users

**Description:** Core user information synchronized with Clerk authentication.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key matching Clerk user ID |
| email | text | User's email address |
| first_name | text | User's first name |
| last_name | text | User's last name |
| photo_url | text | User's profile picture URL |
| date_of_birth | date | User's date of birth |
| parent_mobile | text | Parent's mobile number |
| is_onboarded | boolean | Whether user has completed onboarding |
| is_profile_setup | boolean | Whether user has completed profile setup |
| created_at | timestamp | User creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 2. user_profiles

**Description:** Tracks user's game progress, stats, and preferences.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| xp | integer | Total experience points earned |
| level | integer | Current user level |
| snowballs | integer | Currency for cooling down pet |
| streak | integer | Current study streak days |
| streak_goal | integer | Target streak goal |
| notifications_enabled | boolean | Whether notifications are enabled |
| rank | integer | Leaderboard rank |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 3. user_goals

**Description:** Stores user's learning goals.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| daily_questions | integer | Daily questions goal |
| weekly_topics | integer | Weekly topics goal |
| streak | integer | Streak goal |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 4. virtual_pets

**Description:** Virtual pet data for the user.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| name | text | Pet name |
| food_level | integer | Current food level (0-100) |
| temperature | integer | Current temperature level (0-100) |
| mood | text | Current mood (happy/neutral/sad) |
| level | integer | Pet level |
| last_temperature_update | timestamp | Last time temperature was updated |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 5. onboarding_surveys

**Description:** Stores user onboarding survey responses.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| exam_type | text | Exam user is preparing for (JEE/NEET) |
| current_class | text | Current class (11/12/Dropper) |
| preparation_level | text | Self-assessed level (Beginner/Intermediate/Advanced) |
| daily_study_time | text | Preferred study duration (1h/2-3h/4+h) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 6. study_preferences

**Description:** Stores user's study preferences (many-to-many mapping).

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| preference | text | Study preference |
| created_at | timestamp | Creation timestamp |

### 7. subjects

**Description:** Available study subjects.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Subject name |
| color | text | Color code for UI |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 8. chapters

**Description:** Chapters within each subject.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| subject_id | uuid | Reference to subjects table |
| name | text | Chapter name |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 9. user_studied_chapters

**Description:** Tracks which chapters a user has studied.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| chapter_id | uuid | Reference to chapters table |
| study_date | date | Date when chapter was studied |
| created_at | timestamp | Creation timestamp |

### 10. questions

**Description:** Question bank for practice sessions.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| chapter_id | uuid | Reference to chapters table |
| subject_id | uuid | Reference to subjects table |
| question_text | text | Question content |
| difficulty | text | Difficulty level (Easy/Medium/Hard) |
| explanation | text | Explanation for correct answer |
| hint | text | Optional hint |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 11. answer_options

**Description:** Multiple-choice options for questions.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| question_id | uuid | Reference to questions table |
| option_text | text | Option content |
| is_correct | boolean | Whether this is the correct answer |
| option_order | integer | Display order of option |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### 12. practice_sessions

**Description:** Records of user practice sessions.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| subject_id | uuid | Reference to subjects table |
| practice_type | text | Type of practice (refine/recall/conquer) |
| xp_goal | integer | Target XP for session |
| xp_earned | integer | Actual XP earned |
| questions_answered | integer | Number of questions answered |
| correct_answers | integer | Number of correct answers |
| time_spent | integer | Time spent in seconds |
| completed | boolean | Whether session was completed |
| started_at | timestamp | Session start time |
| completed_at | timestamp | Session completion time |
| created_at | timestamp | Creation timestamp |

### 13. question_attempts

**Description:** Records of individual question attempts.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| session_id | uuid | Reference to practice_sessions table |
| question_id | uuid | Reference to questions table |
| selected_option_id | uuid | Reference to answer_options table |
| is_correct | boolean | Whether answer was correct |
| time_spent | integer | Time spent on question in seconds |
| xp_earned | integer | XP earned for this attempt |
| created_at | timestamp | Creation timestamp |

### 14. user_bookmarks

**Description:** Questions bookmarked by users.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| question_id | uuid | Reference to questions table |
| created_at | timestamp | Creation timestamp |

### 15. user_activities

**Description:** Log of user activities for XP and rewards.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| activity_type | text | Type of activity |
| description | text | Activity description |
| xp_gained | integer | XP gained from activity |
| metadata | jsonb | Additional activity data |
| created_at | timestamp | Creation timestamp |

### 16. notifications

**Description:** User notifications.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| title | text | Notification title |
| message | text | Notification content |
| is_read | boolean | Whether notification has been read |
| created_at | timestamp | Creation timestamp |

### 17. leaderboard_entries

**Description:** Cached leaderboard data, updated periodically.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| rank | integer | User rank |
| xp | integer | User XP at time of ranking |
| created_at | timestamp | Creation timestamp |

## Relationships

1. **users:user_profiles** - One-to-one relationship
2. **users:virtual_pets** - One-to-one relationship
3. **users:onboarding_surveys** - One-to-one relationship
4. **users:user_goals** - One-to-one relationship
5. **users:study_preferences** - One-to-many relationship
6. **users:user_studied_chapters** - One-to-many relationship
7. **users:practice_sessions** - One-to-many relationship
8. **users:user_bookmarks** - One-to-many relationship
9. **users:user_activities** - One-to-many relationship
10. **users:notifications** - One-to-many relationship
11. **subjects:chapters** - One-to-many relationship
12. **subjects:questions** - One-to-many relationship
13. **chapters:questions** - One-to-many relationship
14. **questions:answer_options** - One-to-many relationship
15. **practice_sessions:question_attempts** - One-to-many relationship

## Indexes

1. **users**
   - Primary key on `id`
   - Index on `email` for fast lookups during authentication

2. **user_profiles**
   - Primary key on `id`
   - Foreign key index on `user_id`
   - Index on `xp` for fast leaderboard calculations

3. **virtual_pets**
   - Primary key on `id`
   - Foreign key index on `user_id`

4. **subjects**
   - Primary key on `id`
   - Index on `name` for searching

5. **chapters**
   - Primary key on `id`
   - Foreign key index on `subject_id`
   - Composite index on `(subject_id, name)` for fast lookups

6. **questions**
   - Primary key on `id`
   - Foreign key indexes on `chapter_id` and `subject_id`
   - Index on `difficulty` for filtering

7. **practice_sessions**
   - Primary key on `id`
   - Foreign key index on `user_id`
   - Index on `completed_at` for reporting

8. **question_attempts**
   - Primary key on `id`
   - Foreign key indexes on `user_id`, `session_id`, and `question_id`
   - Index on `is_correct` for analytics

9. **user_studied_chapters**
   - Primary key on `id`
   - Composite index on `(user_id, chapter_id)` for uniqueness
   - Index on `study_date` for timeline queries

10. **leaderboard_entries**
    - Primary key on `id`
    - Index on `rank` for ordering
    - Foreign key index on `user_id`

## Views

### 1. user_stats_view

```sql
CREATE VIEW user_stats_view AS
SELECT 
    u.id, 
    u.email, 
    u.first_name, 
    u.last_name, 
    up.xp, 
    up.level, 
    up.streak,
    up.streak_goal,
    COUNT(DISTINCT ps.id) as practice_sessions_count,
    COUNT(DISTINCT qa.id) as questions_answered_count,
    SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_answers_count,
    CASE 
        WHEN COUNT(DISTINCT qa.id) > 0 
        THEN ROUND(SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(DISTINCT qa.id)::numeric * 100, 2)
        ELSE 0
    END as accuracy_percentage,
    COUNT(DISTINCT usc.chapter_id) as chapters_studied_count
FROM 
    users u
LEFT JOIN 
    user_profiles up ON u.id = up.user_id
LEFT JOIN 
    practice_sessions ps ON u.id = ps.user_id
LEFT JOIN 
    question_attempts qa ON ps.id = qa.session_id
LEFT JOIN 
    user_studied_chapters usc ON u.id = usc.user_id
GROUP BY 
    u.id, u.email, u.first_name, u.last_name, up.xp, up.level, up.streak, up.streak_goal;
```

### 2. daily_activity_view

```sql
CREATE VIEW daily_activity_view AS
SELECT 
    user_id,
    DATE(created_at) as activity_date,
    COUNT(*) as activity_count,
    SUM(xp_gained) as xp_gained,
    COUNT(DISTINCT CASE WHEN activity_type = 'study_chapter' THEN id END) as chapters_studied,
    COUNT(DISTINCT CASE WHEN activity_type = 'practice_session' THEN id END) as practice_sessions
FROM 
    user_activities
GROUP BY 
    user_id, DATE(created_at)
ORDER BY 
    user_id, activity_date DESC;
```

### 3. leaderboard_view

```sql
CREATE VIEW leaderboard_view AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.photo_url,
    up.xp,
    RANK() OVER (ORDER BY up.xp DESC) as rank
FROM 
    users u
JOIN 
    user_profiles up ON u.id = up.user_id
ORDER BY 
    up.xp DESC;
```

## Functions and Triggers

### 1. update_user_streak

**Description:** Updates user streak based on daily activity.

```sql
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_activity_date DATE;
BEGIN
    -- Get the date of user's last activity
    SELECT MAX(DATE(created_at)) INTO last_activity_date
    FROM user_activities
    WHERE user_id = NEW.user_id AND created_at < CURRENT_DATE;
    
    -- If last activity was yesterday, increment streak
    IF last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
        UPDATE user_profiles
        SET 
            streak = streak + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    -- If last activity was before yesterday, reset streak to 1
    ELSIF last_activity_date < CURRENT_DATE - INTERVAL '1 day' OR last_activity_date IS NULL THEN
        UPDATE user_profiles
        SET 
            streak = 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_streak
AFTER INSERT ON user_activities
FOR EACH ROW
EXECUTE FUNCTION update_user_streak();
```

### 2. update_user_level

**Description:** Updates user level based on XP thresholds.

```sql
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple level calculation: 1 level per 1000 XP
    NEW.level := 1 + FLOOR(NEW.xp / 1000);
    
    -- If level changed, create activity record
    IF OLD.level != NEW.level THEN
        INSERT INTO user_activities (
            user_id,
            activity_type,
            description,
            xp_gained,
            metadata
        ) VALUES (
            NEW.user_id,
            'level_up',
            'Leveled up to level ' || NEW.level,
            0,
            jsonb_build_object('old_level', OLD.level, 'new_level', NEW.level)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
BEFORE UPDATE OF xp ON user_profiles
FOR EACH ROW
WHEN (NEW.xp != OLD.xp)
EXECUTE FUNCTION update_user_level();
```

### 3. complete_practice_session

**Description:** Updates user stats when a practice session is completed.

```sql
CREATE OR REPLACE FUNCTION complete_practice_session()
RETURNS TRIGGER AS $$
DECLARE
    xp_gain INTEGER;
    snowballs_gain INTEGER;
BEGIN
    -- Calculate XP and snowballs
    xp_gain := NEW.xp_earned;
    snowballs_gain := FLOOR(xp_gain * 0.2); -- 20% of XP as snowballs
    
    -- Update user profile
    UPDATE user_profiles
    SET 
        xp = xp + xp_gain,
        snowballs = snowballs + snowballs_gain,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Update pet stats
    UPDATE virtual_pets
    SET 
        food_level = LEAST(food_level + 10, 100),
        temperature = GREATEST(temperature - 15, 10),
        last_temperature_update = NOW(),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Record activity
    INSERT INTO user_activities (
        user_id,
        activity_type,
        description,
        xp_gained,
        metadata
    ) VALUES (
        NEW.user_id,
        'practice_session',
        'Completed a ' || NEW.practice_type || ' practice session',
        xp_gain,
        jsonb_build_object(
            'session_id', NEW.id,
            'questions_answered', NEW.questions_answered,
            'correct_answers', NEW.correct_answers,
            'accuracy', CASE WHEN NEW.questions_answered > 0 
                           THEN (NEW.correct_answers::float / NEW.questions_answered::float) * 100
                           ELSE 0
                       END
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_complete_practice_session
AFTER UPDATE OF completed ON practice_sessions
FOR EACH ROW
WHEN (NEW.completed = TRUE AND OLD.completed = FALSE)
EXECUTE FUNCTION complete_practice_session();
```

### 4. update_pet_mood

**Description:** Updates pet mood based on food and temperature levels.

```sql
CREATE OR REPLACE FUNCTION update_pet_mood()
RETURNS TRIGGER AS $$
BEGIN
    -- Update mood based on food level and temperature
    IF NEW.food_level > 70 AND NEW.temperature < 30 THEN
        NEW.mood := 'happy';
    ELSIF NEW.food_level < 30 OR NEW.temperature > 60 THEN
        NEW.mood := 'sad';
    ELSE
        NEW.mood := 'neutral';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pet_mood
BEFORE UPDATE OF food_level, temperature ON virtual_pets
FOR EACH ROW
EXECUTE FUNCTION update_pet_mood();
```

### 5. record_studied_chapter

**Description:** Creates a user activity when a chapter is marked as studied.

```sql
CREATE OR REPLACE FUNCTION record_studied_chapter()
RETURNS TRIGGER AS $$
DECLARE
    chapter_name TEXT;
    subject_name TEXT;
BEGIN
    -- Get chapter and subject names
    SELECT c.name, s.name 
    INTO chapter_name, subject_name
    FROM chapters c
    JOIN subjects s ON c.subject_id = s.id
    WHERE c.id = NEW.chapter_id;
    
    -- Record activity and award XP
    INSERT INTO user_activities (
        user_id,
        activity_type,
        description,
        xp_gained,
        metadata
    ) VALUES (
        NEW.user_id,
        'study_chapter',
        'Studied ' || chapter_name || ' in ' || subject_name,
        10, -- 10 XP per chapter
        jsonb_build_object('chapter_id', NEW.chapter_id, 'chapter_name', chapter_name, 'subject_name', subject_name)
    );
    
    -- Update user XP
    UPDATE user_profiles
    SET xp = xp + 10
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_record_studied_chapter
AFTER INSERT ON user_studied_chapters
FOR EACH ROW
EXECUTE FUNCTION record_studied_chapter();
```

## Supabase Edge Functions

### 1. syncClerkUser

**Description:** Synchronizes user data from Clerk to the Supabase database.

```typescript
// When a user is created or updated in Clerk, this function ensures 
// the data is synchronized to our database
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { type, data: user } = await req.json()
  
  if (type === 'user.created' || type === 'user.updated') {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email_addresses[0]?.email_address,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.image_url,
        updated_at: new Date().toISOString()
      })
      .select()
      
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create user profile if it doesn't exist
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select()
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (!profile && !profileError) {
      await supabase.from('user_profiles').insert({
        user_id: user.id,
        xp: 0,
        level: 1,
        snowballs: 0,
        streak: 0,
        streak_goal: 0
      })
      
      await supabase.from('virtual_pets').insert({
        user_id: user.id,
        name: 'Frosty',
        food_level: 70,
        temperature: 20,
        mood: 'happy',
        level: 1,
        last_temperature_update: new Date().toISOString()
      })
      
      await supabase.from('user_goals').insert({
        user_id: user.id,
        daily_questions: 20,
        weekly_topics: 3,
        streak: 7
      })
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ success: false, message: 'Not a relevant webhook' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 2. startPracticeSession

**Description:** Initializes a new practice session with questions.

```typescript
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { user_id, subject_id, practice_type, xp_goal } = await req.json()
  
  if (!user_id || !subject_id || !practice_type) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Missing required fields' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Create practice session
  const { data: session, error: sessionError } = await supabase
    .from('practice_sessions')
    .insert({
      user_id,
      subject_id,
      practice_type,
      xp_goal: xp_goal || 100,
      xp_earned: 0,
      questions_answered: 0,
      correct_answers: 0,
      time_spent: 0,
      completed: false,
      started_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (sessionError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: sessionError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Get questions based on subject and difficulty
  let difficulty
  if (practice_type === 'refine') difficulty = 'Easy'
  else if (practice_type === 'recall') difficulty = 'Medium'
  else difficulty = 'Hard'
  
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      difficulty,
      explanation,
      hint,
      answer_options (
        id, 
        option_text, 
        is_correct,
        option_order
      )
    `)
    .eq('subject_id', subject_id)
    .eq('difficulty', difficulty)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (questionsError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: questionsError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    session_id: session.id,
    questions
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 3. recordQuestionAttempt

**Description:** Records user's answer to a practice question.

```typescript
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { 
    user_id, 
    session_id, 
    question_id, 
    selected_option_id,
    time_spent 
  } = await req.json()
  
  // Get selected option and check if it's correct
  const { data: option, error: optionError } = await supabase
    .from('answer_options')
    .select('is_correct')
    .eq('id', selected_option_id)
    .single()
  
  if (optionError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: optionError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const is_correct = option.is_correct
  const xp_earned = is_correct ? 25 : 5 // 25 XP for correct, 5 for attempt
  
  // Record attempt
  const { error: attemptError } = await supabase
    .from('question_attempts')
    .insert({
      user_id,
      session_id,
      question_id,
      selected_option_id,
      is_correct,
      time_spent,
      xp_earned
    })
  
  if (attemptError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: attemptError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Update session stats
  const { error: sessionError } = await supabase
    .from('practice_sessions')
    .update({
      xp_earned: supabase.rpc('increment', { x: xp_earned }),
      questions_answered: supabase.rpc('increment', { x: 1 }),
      correct_answers: supabase.rpc('increment', { x: is_correct ? 1 : 0 }),
      time_spent: supabase.rpc('increment', { x: time_spent })
    })
    .eq('id', session_id)
  
  if (sessionError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: sessionError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    is_correct,
    xp_earned
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 4. completePracticeSession

**Description:** Finalizes practice session and awards rewards.

```typescript
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { session_id } = await req.json()
  
  // Mark session as completed
  const { data: session, error: sessionError } = await supabase
    .from('practice_sessions')
    .update({
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', session_id)
    .select()
    .single()
  
  if (sessionError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: sessionError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    session
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 5. updatePetStatus

**Description:** Updates virtual pet food and temperature.

```typescript
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { user_id, action, snowballs_used } = await req.json()
  
  // Get current pet status
  const { data: pet, error: petError } = await supabase
    .from('virtual_pets')
    .select('*')
    .eq('user_id', user_id)
    .single()
  
  if (petError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: petError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Update based on action
  let updates = {}
  
  if (action === 'feed') {
    updates = {
      food_level: Math.min(pet.food_level + 15, 100)
    }
  } else if (action === 'play') {
    updates = {
      temperature: Math.max(pet.temperature - 5, 10),
      last_temperature_update: new Date().toISOString()
    }
  } else if (action === 'cool_down' && snowballs_used) {
    // Check if user has enough snowballs
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('snowballs')
      .eq('user_id', user_id)
      .single()
    
    if (profileError || profile.snowballs < snowballs_used) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Not enough snowballs' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Deduct snowballs and cool down
    await supabase
      .from('user_profiles')
      .update({ snowballs: profile.snowballs - snowballs_used })
      .eq('user_id', user_id)
      
    updates = {
      temperature: Math.max(pet.temperature - 20, 10),
      last_temperature_update: new Date().toISOString()
    }
  }
  
  if (Object.keys(updates).length === 0) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Update pet
  const { data: updatedPet, error: updateError } = await supabase
    .from('virtual_pets')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user_id)
    .select()
    .single()
  
  if (updateError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: updateError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    pet: updatedPet
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 6. fetchLeaderboard

**Description:** Retrieves current leaderboard rankings.

```typescript
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const url = new URL(req.url)
  const user_id = url.searchParams.get('user_id')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  
  // Get top users from leaderboard view
  const { data: topUsers, error: topUsersError } = await supabase
    .from('leaderboard_view')
    .select('id, first_name, last_name, photo_url, xp, rank')
    .order('rank', { ascending: true })
    .limit(limit)
  
  if (topUsersError) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: topUsersError.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Get current user's rank
  let userRank = null
  if (user_id) {
    const { data: userData, error: userError } = await supabase
      .from('leaderboard_view')
      .select('rank, xp')
      .eq('id', user_id)
      .single()
    
    if (!userError) {
      userRank = userData
    }
  }
  
  // Get total number of users
  const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  const totalUsers = countError ? 0 : count
  
  return new Response(JSON.stringify({ 
    success: true,
    topUsers,
    userRank,
    totalUsers
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## Row Level Security (RLS) Policies

### 1. users Table Policies

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own data
CREATE POLICY "Users can access their own data" ON users
FOR ALL
USING (auth.uid() = id);

-- Allow public access to specific user data for leaderboard
CREATE POLICY "Public access to limited user data" ON users
FOR SELECT
USING (true)
WITH CHECK (false);
```

### 2. user_profiles Table Policies

```sql
-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own profile
CREATE POLICY "Users can access their own profile" ON user_profiles
FOR ALL
USING (auth.uid() = user_id);

-- Allow leaderboard data to be read
CREATE POLICY "Public read access to XP, level, and rank" ON user_profiles
FOR SELECT
USING (true)
WITH CHECK (false);
```

### 3. virtual_pets Table Policies

```sql
-- Enable RLS on virtual_pets table
ALTER TABLE virtual_pets ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own pet
CREATE POLICY "Users can access their own pet" ON virtual_pets
FOR ALL
USING (auth.uid() = user_id);
```

### 4. practice_sessions Table Policies

```sql
-- Enable RLS on practice_sessions table
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own practice sessions
CREATE POLICY "Users can access their own practice sessions" ON practice_sessions
FOR ALL
USING (auth.uid() = user_id);
```

### 5. question_attempts Table Policies

```sql
-- Enable RLS on question_attempts table
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own question attempts
CREATE POLICY "Users can access their own question attempts" ON question_attempts
FOR ALL
USING (auth.uid() = user_id);
```

### 6. user_studied_chapters Table Policies

```sql
-- Enable RLS on user_studied_chapters table
ALTER TABLE user_studied_chapters ENABLE ROW LEVEL SECURITY;

-- Users can only access their own study records
CREATE POLICY "Users can access their own study records" ON user_studied_chapters
FOR ALL
USING (auth.uid() = user_id);
```

### 7. user_bookmarks Table Policies

```sql
-- Enable RLS on user_bookmarks table
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own bookmarks
CREATE POLICY "Users can access their own bookmarks" ON user_bookmarks
FOR ALL
USING (auth.uid() = user_id);
```

### 8. questions and answer_options Tables Policies

```sql
-- Enable RLS on questions table
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Everyone can read questions
CREATE POLICY "Everyone can read questions" ON questions
FOR SELECT
USING (true);

-- Enable RLS on answer_options table
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;

-- Everyone can read answer options
CREATE POLICY "Everyone can read answer options" ON answer_options
FOR SELECT
USING (true);
```

## External Integrations

### 1. Clerk Authentication

The application is already integrated with Clerk for user authentication, as evident from the imports and auth logic in the codebase. This integration should be maintained and extended to work with Supabase:

- Use Clerk for signup, signin, and user management
- Configure JWT verification between Clerk and Supabase
- Set up webhooks from Clerk to Supabase to sync user data
- Use the syncClerkUser edge function to maintain database consistency

### 2. Expo Notifications

The application has notification UI elements and preferences, so integration with Expo Notifications is needed:

- Set up Expo Push Notification Token storage in user_profiles
- Configure server-side notification dispatch through Supabase Edge Functions
- Implement notification grouping and priority based on app features
- Set up scheduling for streak reminders and daily practice notifications

### 3. Content Delivery Network (CDN)

For storing and serving static assets like images and animations:

- Configure Supabase Storage or a third-party CDN for asset hosting
- Set up appropriate CORS policies for asset access
- Implement caching strategies for fast asset loading
- Optimize image and animation delivery for mobile devices

### 4. Analytics Integration (Optional)

For tracking user engagement and application performance:

- Integrate with a service like Mixpanel, Amplitude, or PostHog
- Track key events like practice completion, streak milestones, and feature usage
- Set up funnels to monitor user progression through the learning pathway
- Measure retention and engagement metrics to improve the application 