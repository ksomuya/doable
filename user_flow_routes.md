# Doable Application User Flow and Routes

This document outlines the complete user flow through the Doable application, detailing each route, the data operations performed, and the UI elements displayed for both new and existing users.

## Authentication Routes

### `/` (Landing Page)
- [x] **Implemented**
- **Purpose**: Initial entry point
- **Database Operations**:
  - **Read**: None
  - **Write**: None
- **UI Elements**:
  - App introduction/value proposition
  - Login/Signup buttons
  - Testimonials/features showcase
- **Next Routes**: `/login` or `/signup`

### `/signup`
- [x] **Implemented**
- **Purpose**: New user registration
- **Database Operations**:
  - **Read**: None
  - **Write**:
    - `auth.users` (creates new user)
    - Triggers `handle_new_user()` function
    - Creates entry in `public.users`
    - Triggers `create_user_profile()` to create entry in `user_profiles`
    - Creates entry in `user_streaks` with default values
- **UI Elements**:
  - Email/password fields
  - Social login options
  - Terms acceptance checkbox
  - Name fields
- **Next Routes**: `/onboarding` (for new registrations)

### `/login`
- [x] **Implemented**
- **Purpose**: User authentication
- **Database Operations**:
  - **Read**:
    - `auth.users` (verifies credentials)
  - **Write**:
    - `auth.sessions` (creates new session)
    - `evt_daily_logins` (records login date)
    - Triggers `handle_login()` function
- **UI Elements**:
  - Email/password fields
  - "Remember me" option
  - "Forgot password" link
  - Social login options
- **Next Routes**: 
  - `/onboarding` (if `is_onboarded` = false)
  - `/setup-profile` (if `is_onboarded` = true but `is_profile_setup` = false)
  - `/home` (if fully onboarded)

### `/forgot-password`
- [ ] **Implemented**
- **Purpose**: Password recovery
- **Database Operations**:
  - **Read**: 
    - `auth.users` (verifies email exists)
  - **Write**:
    - `auth.users` (updates recovery token)
- **UI Elements**:
  - Email input field
  - Submit button
- **Next Routes**: `/login` (after reset email sent)

### `/reset-password/:token`
- [ ] **Implemented**
- **Purpose**: Set new password using reset token
- **Database Operations**:
  - **Read**: 
    - `auth.users` (validates token)
  - **Write**:
    - `auth.users` (updates password)
- **UI Elements**:
  - New password input
  - Confirm password input
- **Next Routes**: `/login` (after successful reset)

## Onboarding Routes

### `/onboarding`
- [x] **Implemented**
- **Purpose**: Collect initial user preferences
- **Database Operations**:
  - **Read**: 
    - `public.users` (checks existing onboarding status)
  - **Write**:
    - `onboarding_surveys` (stores survey responses)
    - Updates `users.is_onboarded` to true
- **UI Elements**:
  - Multi-step form with:
    - Exam type selection (JEE Mains/Advanced, NEET)
    - Current class selection
    - Preparation level assessment
    - Daily study time availability
  - Progress indicator
- **Next Routes**: `/setup-profile`

### `/setup-profile`
- [x] **Implemented**
- **Purpose**: Complete user profile
- **Database Operations**:
  - **Read**: 
    - `public.users` (gets existing profile info)
  - **Write**:
    - `public.users` (updates profile fields)
    - `storage.objects` (if profile photo uploaded)
    - Updates `users.is_profile_setup` to true
- **UI Elements**:
  - Profile photo upload
  - Date of birth selector
  - Parent's mobile number input (optional)
  - Additional user details fields
- **Next Routes**: `/home`

## Main Application Routes

### `/home`
- [x] **Implemented**
- **Purpose**: Main dashboard/starting point
- **Database Operations**:
  - **Read**: 
    - `user_profiles` (streak, level, XP)
    - `user_streaks` (streak data)
    - `dim_spaced_repetition_queue` (recommended questions)
    - `rep_daily_overview` (today's progress)
    - `evt_study_sessions` (recent sessions)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Daily streak counter
  - Progress summary cards
  - Recommended questions teasers
  - Continue learning section
  - Quick action buttons
- **Next Routes**: Various app sections

### `/subjects`
- [x] **Implemented**
- **Purpose**: Browse all subjects
- **Database Operations**:
  - **Read**: 
    - `subjects` (filtered by user's exam type)
    - `user_studied_chapters` (for progress indicators)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Subject cards with progress indicators
  - Filter options
  - Search functionality
- **Next Routes**: `/subjects/:subjectId`

### `/subjects/:subjectId`
- [x] **Implemented**
- **Purpose**: View chapters within subject
- **Database Operations**:
  - **Read**: 
    - `subjects` (subject details)
    - `chapters` (chapters in subject)
    - `user_studied_chapters` (progress data)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Subject header with description
  - Chapter list with:
    - Progress indicators
    - Difficulty labels
    - Class level indicators
- **Next Routes**: `/chapters/:chapterId`

### `/chapters/:chapterId`
- [x] **Implemented**
- **Purpose**: View topics within chapter
- **Database Operations**:
  - **Read**: 
    - `chapters` (chapter details)
    - `topics` (topics in chapter)
    - `user_studied_topics` (progress data)
    - `dim_topic_mastery` (mastery levels)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Chapter header with description
  - Topic list with:
    - Progress indicators
    - Difficulty labels
    - Importance indicators
    - Estimated practice time
  - Chapter completion status
- **Next Routes**: `/topics/:topicId` or `/practice/:chapterId`

### `/topics/:topicId`
- [x] **Implemented**
- **Purpose**: Study individual topic
- **Database Operations**:
  - **Read**: 
    - `topics` (topic details)
    - `subtopics` (subtopics list)
    - `user_studied_topics` (progress data)
  - **Write**:
    - `user_studied_topics` (marks topic as studied)
    - Calls `update_topic_study_status()` function
- **UI Elements**:
  - Topic header with description
  - Learning outcomes list
  - Prerequisites section
  - Subtopics accordion/list
  - Content explanation
  - "Mark as completed" button
  - Practice button
- **Next Routes**: `/practice/:topicId` or back to chapter

## Study and Practice Routes

### `/practice/:topicId` or `/practice/:chapterId`
- [x] **Implemented**
- **Purpose**: Practice questions on topic/chapter
- **Database Operations**:
  - **Read**: 
    - `questions` (filtered by topic/chapter)
    - `dim_topic_mastery` (adjusts question difficulty)
  - **Write**:
    - `evt_study_sessions` (creates session record)
    - Updates `topics_covered` array with current topic
- **UI Elements**:
  - Practice session controls
  - Timer
  - Question display
  - Multiple choice options
  - Navigation controls
- **Next Routes**: Question flow within practice session

### `/practice/question/:questionId`
- [x] **Implemented**
- **Purpose**: Answer individual question
- **Database Operations**:
  - **Read**: 
    - `questions` (question details)
  - **Write**:
    - `evt_question_attempts` (records attempt)
    - Triggers `fn_update_mastery()` when completed
    - Triggers `trg_update_spaced_repetition()` for future scheduling
- **UI Elements**:
  - Question text
  - Answer options
  - Timer
  - Confidence level selector (after answering)
  - Solution (after answering)
- **Next Routes**: Next question or practice summary

### `/practice/summary`
- [x] **Implemented**
- **Purpose**: Practice session results
- **Database Operations**:
  - **Read**: 
    - `evt_question_attempts` (session results)
  - **Write**:
    - `evt_study_sessions` (updates end_time and duration)
    - Triggers `trg_update_progress()` to update progress data
    - Triggers `trg_update_streak()` to update streak
- **UI Elements**:
  - Performance summary
  - Accuracy statistics
  - Time spent
  - Question breakdown
  - XP earned indicator
  - Next steps recommendations
- **Next Routes**: `/home` or further practice

### `/spaced-review`
- [ ] **Implemented**
- **Purpose**: Review previously answered questions
- **Database Operations**:
  - **Read**: 
    - `dim_spaced_repetition_queue` (due questions)
    - `questions` (question details)
  - **Write**:
    - Same as practice questions
    - Updates `dim_spaced_repetition_queue` status
- **UI Elements**:
  - Similar to practice but with focus on review
  - Spaced repetition status indicator
- **Next Routes**: Similar to practice flow

## Analytics and Reports

### `/progress`
- [x] **Implemented**
- **Purpose**: User progress overview
- **Database Operations**:
  - **Read**: 
    - `rep_daily_overview` (recent days)
    - `rep_weekly_overview` (current/recent weeks)
    - `user_profiles` (XP, level)
    - `user_streaks` (streak data)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Progress overview dashboard
  - Study time trends
  - Accuracy charts
  - Streak calendar
  - Subject progress bars
- **Next Routes**: Detailed report sections

### `/progress/daily`
- [x] **Implemented**
- **Purpose**: Detailed daily progress
- **Database Operations**:
  - **Read**: 
    - `rep_daily_overview` (filtered by date)
    - `evt_question_attempts` (daily attempts)
    - `evt_study_sessions` (daily sessions)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Date selector
  - Daily metrics:
    - Study time
    - Questions attempted/correct
    - Topics completed
    - Chapters completed
  - Hour-by-hour breakdown
- **Next Routes**: Other progress sections

### `/progress/weekly`
- [x] **Implemented**
- **Purpose**: Weekly progress analysis
- **Database Operations**:
  - **Read**: 
    - `rep_weekly_overview` (weekly data)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Week selector
  - Weekly metrics
  - Subject progress comparison
  - Day-by-day breakdown
  - Weak topics identification
- **Next Routes**: Other progress sections

### `/progress/monthly`
- [ ] **Implemented**
- **Purpose**: Monthly progress analysis
- **Database Operations**:
  - **Read**: 
    - `rep_monthly_overview` (monthly data)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Month selector
  - Monthly metrics
  - Subject progress comparison
  - Week-by-week breakdown
  - Progress trends
- **Next Routes**: Other progress sections

### `/exam-readiness`
- [ ] **Implemented**
- **Purpose**: Exam preparation status
- **Database Operations**:
  - **Read**: 
    - `rep_exam_readiness` (readiness data)
    - `subjects` (for subject details)
    - `topics` (for topic details)
  - **Write**:
    - None (view only)
- **UI Elements**:
  - Overall readiness score
  - Subject-wise readiness indicators
  - Predicted score range
  - Weakest subjects/topics
  - Improvement recommendations
- **Next Routes**: Study recommendations

## Profile and Settings

### `/profile`
- [x] **Implemented**
- **Purpose**: View/edit user profile
- **Database Operations**:
  - **Read**: 
    - `users` (user details)
    - `user_profiles` (profile data)
    - `onboarding_surveys` (preferences)
  - **Write**:
    - `users` (if edited)
    - `storage.objects` (if new photo)
- **UI Elements**:
  - Profile information display
  - Edit buttons
  - Achievement badges
  - Account statistics
- **Next Routes**: Various settings pages

### `/settings`
- [x] **Implemented**
- **Purpose**: Application settings
- **Database Operations**:
  - **Read**: 
    - `study_preferences` (user preferences)
  - **Write**:
    - `study_preferences` (if updated)
    - `user_profiles` (if notification settings changed)
- **UI Elements**:
  - Notification settings
  - Theme preferences
  - Study reminder settings
  - Account management options
- **Next Routes**: Various app sections

## User Redirects

### New User Flow
- [x] **Implemented**
1. `/` (Landing) → `/signup`
2. `/signup` → `/onboarding` (after successful registration)
3. `/onboarding` → `/setup-profile` (after survey completion)
4. `/setup-profile` → `/home` (after profile setup)

### Returning User Flow
- [x] **Implemented**
1. `/` (Landing) → `/login`
2. `/login` → `/home` (if previously completed setup)
3. `/login` → `/onboarding` (if not onboarded)
4. `/login` → `/setup-profile` (if onboarded but profile not complete)

### Session Timeout Flow
- [x] **Implemented**
1. Any route → `/login` (when session expires)
2. `/login` → previous route (after re-authentication)

## Data Operation Details

### Authentication Events
- [x] **Implemented**
- **Login**: Creates session in `auth.sessions`, records login in `evt_daily_logins`
- **Registration**: Creates user in `auth.users`, creates linked records in `public.users`, `user_profiles`, and `user_streaks`

### Study Progress Events
- [x] **Implemented**
- **Topic Completion**: Updates `user_studied_topics`, potentially updates `user_studied_chapters` if all topics complete
- **Question Attempt**: Creates record in `evt_question_attempts`, updates mastery in `dim_topic_mastery`
- **Study Session**: Creates/updates record in `evt_study_sessions`, updates streak data in `user_streaks`

### Analytics Generation
- [x] **Implemented**
- **Daily Update**: Automatically triggers `fn_rollup_daily()` to create/update `rep_daily_overview`
- **Weekly Update**: Automatically triggers `fn_rollup_weekly()` to create/update `rep_weekly_overview`
- **Exam Readiness**: Calculated via `fn_calculate_readiness()` to update `rep_exam_readiness` 