# Doable - Supabase Database Schema

This document provides a comprehensive overview of the Supabase database schema for the Doable application.

## Database Overview

The Doable database is organized into several key entities that form the foundation of an educational platform focused on exam preparation. The main entities include:

- Users and user-related data (profiles, streaks, study preferences)
- Educational content hierarchy (subjects, chapters, topics, subtopics)
- Questions bank with detailed categorization
- Study progress tracking

## Table Structure

### User-Related Tables

#### users

Primary user table storing core user information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | text | false | | Primary key |
| email | text | true | | User's email address |
| first_name | text | true | | User's first name |
| last_name | text | true | | User's last name |
| photo_url | text | true | | URL to user's profile photo |
| date_of_birth | date | true | | User's birth date |
| parent_mobile | text | true | | Parent's mobile number |
| is_onboarded | boolean | true | false | Whether user has completed onboarding |
| is_profile_setup | boolean | true | false | Whether user has completed profile setup |
| created_at | timestamptz | true | now() | Creation timestamp |
| updated_at | timestamptz | true | now() | Last update timestamp |

#### user_profiles

Extended user profile information including gamification elements.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| user_id | text | true | | Foreign key to users.id |
| xp | integer | true | 0 | Experience points |
| level | integer | true | 1 | User level |
| snowballs | integer | true | 0 | Snowballs (in-app currency) |
| streak | integer | true | 0 | Current streak |
| streak_goal | integer | true | 0 | Target streak goal |
| notifications_enabled | boolean | true | true | Whether notifications are enabled |
| rank | integer | true | 0 | User ranking |
| created_at | timestamptz | true | now() | Creation timestamp |
| updated_at | timestamptz | true | now() | Last update timestamp |

#### user_streaks

Tracks user study streaks and activity.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | text | false | | Primary key, Foreign key to users.id |
| current_streak | integer | true | 0 | Current consecutive days of activity |
| longest_streak | integer | true | 0 | Longest streak achieved |
| last_active_date | date | true | | Date of last activity |
| updated_at | timestamptz | true | now() | Last update timestamp |

#### onboarding_surveys

Stores user responses to onboarding questionnaires.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| user_id | text | true | | Foreign key to users.id |
| exam_type | text | true | | Target exam (JEE, NEET, etc.) |
| current_class | text | true | | User's current class/grade |
| preparation_level | text | true | | Self-assessed preparation level |
| daily_study_time | text | true | | Planned daily study time |
| created_at | timestamptz | true | now() | Creation timestamp |
| updated_at | timestamptz | true | now() | Last update timestamp |

#### study_preferences

Stores user study preferences.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| user_id | text | true | | Foreign key to users.id |
| preference | text | true | | Study preference setting |
| created_at | timestamptz | true | now() | Creation timestamp |

#### employees

Internal system users/employees.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | auth.uid() | Primary key |
| email | text | false | | Employee email |
| first_name | text | true | | First name |
| last_name | text | true | | Last name |
| role | text | false | 'employee' | Employee role |
| created_at | timestamptz | false | now() | Creation timestamp |
| updated_at | timestamptz | false | now() | Last update timestamp |

#### prelaunch_signups

Tracks pre-launch signup information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| email | text | false | | Email address |
| name | text | true | | User name |
| exam_type | text | true | | Target exam |
| signup_date | timestamptz | true | now() | Signup timestamp |
| created_at | timestamptz | true | now() | Creation timestamp |

### Educational Content Tables

#### subjects

Top-level educational subjects.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| name | text | false | | Subject name |
| created_at | timestamptz | true | now() | Creation timestamp |
| updated_at | timestamptz | true | now() | Last update timestamp |
| jee_mains | boolean | true | false | Relevant for JEE Mains |
| jee_advanced | boolean | true | false | Relevant for JEE Advanced |
| neet | boolean | true | false | Relevant for NEET |

#### chapters

Subject chapters.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| subject_id | uuid | true | | Foreign key to subjects.id |
| name | text | false | | Chapter name |
| created_at | timestamptz | true | now() | Creation timestamp |
| updated_at | timestamptz | true | now() | Last update timestamp |
| jee_mains | boolean | true | false | Relevant for JEE Mains |
| jee_advanced | boolean | true | false | Relevant for JEE Advanced |
| neet | boolean | true | false | Relevant for NEET |
| class | text | true | | Target class/grade level |

#### topics

Chapter topics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| chapter_id | uuid | true | | Foreign key to chapters.id |
| name | text | false | | Topic name |
| description | text | true | | Topic description |
| difficulty | text | true | | Difficulty level (Easy, Medium, Hard) |
| jee_weightage | numeric | true | 0 | JEE exam weightage |
| neet_weightage | numeric | true | 0 | NEET exam weightage |
| practice_time_minutes | integer | true | 30 | Recommended practice time |
| importance | text | true | | Importance level (Low, Medium, High, Very High) |
| questions_frequency | numeric | true | 0 | Frequency of questions in exams |
| prerequisites | text[] | true | | Required prerequisite topics |
| learning_outcomes | text[] | true | | Learning outcomes |
| created_at | timestamptz | true | now() | Creation timestamp |
| updated_at | timestamptz | true | now() | Last update timestamp |
| jee_mains | boolean | true | false | Relevant for JEE Mains |
| jee_advanced | boolean | true | false | Relevant for JEE Advanced |
| neet | boolean | true | false | Relevant for NEET |

#### subtopics

Topic subtopics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| topic_id | uuid | true | | Foreign key to topics.id |
| subtopic_name | text | false | | Subtopic name |
| created_at | timestamptz | true | now() | Creation timestamp |

#### questions

Question bank storing all practice questions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| question_text | text | false | | Question content |
| options | jsonb | true | | Answer options (for MCQs) |
| correct_answer | text | false | | Correct answer |
| solution | text | true | | Solution explanation |
| step_by_step_solution | text | true | | Detailed step-by-step solution |
| question_type | text | false | | Type of question |
| difficulty | text | true | | Difficulty level (Easy, Medium, Hard, Conceptual) |
| exam | text | true | | Target exam |
| image_url | text | true | | URL to question image (if any) |
| smiles_string | text | true | | Chemical formula (for chemistry) |
| generated_at | timestamptz | true | now() | Generation timestamp |
| created_at | timestamptz | true | now() | Creation timestamp |
| updated_at | timestamptz | true | now() | Last update timestamp |
| desmos_formula | text | true | | Mathematical formula |
| converted_from | uuid | true | | Source question if converted |
| subject_id | uuid | false | gen_random_uuid() | Foreign key to subjects.id |
| chapter_id | uuid | false | gen_random_uuid() | Foreign key to chapters.id |
| topic_id | uuid | false | gen_random_uuid() | Foreign key to topics.id |
| subtopic_id | uuid | false | gen_random_uuid() | Foreign key to subtopics.id |
| content_hash | text | true | | Content hash for deduplication |

### Progress Tracking Tables

#### user_studied_chapters

Tracks user progress at the chapter level.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| user_id | text | true | | Foreign key to users.id |
| chapter_id | uuid | true | | Foreign key to chapters.id |
| study_date | date | true | CURRENT_DATE | Date of study |
| created_at | timestamptz | true | now() | Creation timestamp |

#### user_studied_topics

Tracks user progress at the topic level.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | gen_random_uuid() | Primary key |
| user_id | text | true | | Foreign key to users.id |
| chapter_id | uuid | true | | Foreign key to chapters.id |
| topic_id | uuid | true | | Topic ID |
| topic_name | text | true | | Topic name |
| study_date | date | true | CURRENT_DATE | Date of study |
| created_at | timestamptz | true | now() | Creation timestamp |
| updated_at | timestamptz | true | now() | Last update timestamp |
| topic_id_normalized | uuid | true | COALESCE(topic_id, '00000000-0000-0000-0000-000000000000'::uuid) | Normalized topic ID |

## Entity Relationships

### User-Related Relationships

- `users` is the central table, linked to by:
  - `user_profiles` via `user_id`
  - `user_streaks` via `user_id`
  - `onboarding_surveys` via `user_id`
  - `study_preferences` via `user_id`
  - `user_studied_chapters` via `user_id`
  - `user_studied_topics` via `user_id`

### Educational Content Relationships

- `subjects` contains:
  - `chapters` via `subject_id`
- `chapters` contains:
  - `topics` via `chapter_id`
- `topics` contains:
  - `subtopics` via `topic_id`
- `questions` is linked to:
  - `subjects` via `subject_id`
  - `chapters` via `chapter_id`
  - `topics` via `topic_id`
  - `subtopics` via `subtopic_id`

### Progress Tracking Relationships

- `user_studied_chapters` tracks:
  - User progress on `chapters` via `chapter_id`
- `user_studied_topics` tracks:
  - User progress on `topics` via `topic_id`
  - Associated `chapter_id` for context

## Row-Level Security (RLS)

The following tables have Row-Level Security enabled:

- `users`
- `user_profiles`
- `user_streaks`
- `onboarding_surveys`
- `study_preferences`
- `subjects`
- `chapters`
- `topics`
- `subtopics`
- `user_studied_chapters`
- `user_studied_topics`
- `employees`

The `questions` table does not use RLS, likely to allow efficient database operations across the entire question bank. 