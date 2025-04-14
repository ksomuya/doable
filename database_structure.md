# Doable Database Structure Documentation

## Project Information

- **Project ID**: kefvngdracxioodkzhro
- **Organization ID**: cevfmytpytjaoeifqifq
- **Name**: doable
- **Region**: ap-south-1
- **Status**: ACTIVE_HEALTHY
- **Database Version**: 15.8.1.054

## Schemas

The database contains the following schemas:
- `public` - Main application schema
- `auth` - Authentication and user management
- `storage` - File storage
- `pgsodium` - Encryption functionality
- `vault` - Secure storage of secrets
- `realtime` - Real-time communication
- `graphql` - GraphQL API
- `cron` - Job scheduling
- `supabase_migrations` - Database migrations

## Tables

### Public Schema

#### `users`

Users of the application.

Columns:
- `id` (text, PK): User ID
- `email` (text): Email address
- `first_name` (text): First name
- `last_name` (text): Last name
- `photo_url` (text): Profile photo URL
- `date_of_birth` (date): Date of birth
- `parent_mobile` (text): Parent's mobile number
- `is_onboarded` (boolean): Onboarding status flag
- `is_profile_setup` (boolean): Profile setup status flag
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

#### `user_profiles`

Extended user profile information.

Columns:
- `id` (uuid, PK): Profile ID
- `user_id` (text): Reference to users.id
- `xp` (integer): Experience points
- `level` (integer): User level
- `snowballs` (integer): Snowballs count
- `streak` (integer): Current streak
- `streak_goal` (integer): Streak goal
- `notifications_enabled` (boolean): Notifications enabled flag
- `rank` (integer): User rank
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

#### `user_streaks`

User streak tracking.

Columns:
- `user_id` (text, PK): Reference to users.id
- `current_streak` (integer): Current streak count
- `longest_streak` (integer): Longest streak achieved
- `last_active_date` (date): Last activity date
- `updated_at` (timestamp with time zone): Update timestamp

#### `onboarding_surveys`

Onboarding survey responses.

Columns:
- `id` (uuid, PK): Survey ID
- `user_id` (text): Reference to users.id
- `exam_type` (text): Exam type
- `current_class` (text): Current class
- `preparation_level` (text): Preparation level
- `daily_study_time` (text): Daily study time
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

#### `study_preferences`

User study preferences.

Columns:
- `id` (uuid, PK): Preference ID
- `user_id` (text): Reference to users.id
- `preference` (text): Preference value
- `created_at` (timestamp with time zone): Creation timestamp

#### `subjects`

Academic subjects.

Columns:
- `id` (uuid, PK): Subject ID
- `name` (text): Subject name
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp
- `jee_mains` (boolean): Flag for JEE Mains
- `jee_advanced` (boolean): Flag for JEE Advanced
- `neet` (boolean): Flag for NEET

#### `chapters`

Chapters within subjects.

Columns:
- `id` (uuid, PK): Chapter ID
- `subject_id` (uuid): Reference to subjects.id
- `name` (text): Chapter name
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp
- `jee_mains` (boolean): Flag for JEE Mains
- `jee_advanced` (boolean): Flag for JEE Advanced
- `neet` (boolean): Flag for NEET
- `class` (text): Class level
- `class_level` (text): Alias for class column

#### `user_studied_chapters`

Records of chapters studied by users.

Columns:
- `id` (uuid, PK): Record ID
- `user_id` (text): Reference to users.id
- `chapter_id` (uuid): Reference to chapters.id
- `study_date` (date): Study date
- `created_at` (timestamp with time zone): Creation timestamp

#### `topics`

Topics within chapters.

Columns:
- `id` (uuid, PK): Topic ID
- `chapter_id` (uuid): Reference to chapters.id
- `name` (text): Topic name
- `description` (text): Topic description
- `difficulty` (text): Difficulty level (Easy, Medium, Hard)
- `jee_weightage` (numeric): JEE exam weightage
- `neet_weightage` (numeric): NEET exam weightage
- `practice_time_minutes` (integer): Recommended practice time
- `importance` (text): Importance level
- `questions_frequency` (numeric): Question frequency
- `prerequisites` (text[]): Prerequisites list
- `learning_outcomes` (text[]): Learning outcomes list
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp
- `jee_mains` (boolean): Flag for JEE Mains
- `jee_advanced` (boolean): Flag for JEE Advanced
- `neet` (boolean): Flag for NEET

#### `user_studied_topics`

Records of topics studied by users.

Columns:
- `id` (uuid, PK): Record ID
- `user_id` (text): Reference to users.id
- `chapter_id` (uuid): Reference to chapters.id
- `topic_id` (uuid): Reference to topics.id
- `topic_name` (text): Topic name
- `study_date` (date): Study date
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp
- `topic_id_normalized` (uuid): Normalized topic ID

#### `prelaunch_signups`

Prelaunch signup records.

Columns:
- `id` (uuid, PK): Signup ID
- `email` (text): Email address
- `name` (text): Name
- `exam_type` (text): Exam type
- `signup_date` (timestamp with time zone): Signup date
- `created_at` (timestamp with time zone): Creation timestamp

#### `employees`

Employee records.

Columns:
- `id` (uuid, PK): Employee ID
- `email` (text): Email address
- `first_name` (text): First name
- `last_name` (text): Last name
- `role` (text): Role
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

#### `subtopics`

Subtopics within topics.

Columns:
- `id` (uuid, PK): Subtopic ID
- `topic_id` (uuid): Reference to topics.id
- `subtopic_name` (text): Subtopic name
- `created_at` (timestamp with time zone): Creation timestamp

#### `questions`

Questions database.

Columns:
- `id` (uuid, PK): Question ID
- `question_text` (text): Question text
- `options` (jsonb): Answer options
- `correct_answer` (text): Correct answer
- `solution` (text): Solution explanation
- `step_by_step_solution` (text): Detailed step-by-step solution
- `question_type` (text): Question type
- `difficulty` (text): Difficulty level
- `exam` (text): Exam type
- `image_url` (text): Image URL
- `smiles_string` (text): SMILES notation (for chemistry)
- `generated_at` (timestamp with time zone): Generation timestamp
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp
- `desmos_formula` (text): Desmos formula
- `converted_from` (uuid): Original question ID if converted
- `subject_id` (uuid): Reference to subjects.id
- `chapter_id` (uuid): Reference to chapters.id
- `topic_id` (uuid): Reference to topics.id
- `subtopic_id` (uuid): Reference to subtopics.id
- `content_hash` (text): Content hash for deduplication

#### Analytics Tables

##### `evt_question_attempts`

Records of question attempts.

Columns:
- `id` (uuid, PK): Attempt ID
- `user_id` (text): Reference to users.id
- `question_id` (uuid): Reference to questions.id
- `is_correct` (boolean): Correctness flag
- `confidence_level` (text): Confidence level
- `time_taken_seconds` (integer): Time taken
- `cat_theta_before` (numeric): CAT theta before attempt
- `cat_theta_after` (numeric): CAT theta after attempt
- `subject_id` (uuid): Reference to subjects.id
- `chapter_id` (uuid): Reference to chapters.id
- `topic_id` (uuid): Reference to topics.id
- `subtopic_id` (uuid): Reference to subtopics.id
- `attempt_source` (text): Source of attempt
- `attempt_no` (integer): Attempt number
- `started_at` (timestamp with time zone): Start timestamp
- `completed_at` (timestamp with time zone): Completion timestamp
- `created_at` (timestamp with time zone): Creation timestamp

##### `evt_study_sessions`

Study session records.

Columns:
- `id` (uuid, PK): Session ID
- `user_id` (text): Reference to users.id
- `start_time` (timestamp with time zone): Start time
- `end_time` (timestamp with time zone): End time
- `duration_minutes` (integer): Duration in minutes
- `topics_covered` (uuid[]): Topics covered
- `created_at` (timestamp with time zone): Creation timestamp

##### `evt_daily_logins`

Daily login records.

Columns:
- `user_id` (text, PK): Reference to users.id
- `login_date` (date, PK): Login date
- `created_at` (timestamp with time zone): Creation timestamp

##### `dim_topic_mastery`

Topic mastery tracking.

Columns:
- `user_id` (text, PK): Reference to users.id
- `topic_id` (uuid, PK): Reference to topics.id
- `mastery_level` (numeric): Mastery level
- `repetition_count` (integer): Repetition count
- `last_practiced` (timestamp with time zone): Last practice timestamp
- `ease_factor` (numeric): Ease factor
- `next_review_date` (date): Next review date
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

##### `dim_spaced_repetition_queue`

Spaced repetition queue.

Columns:
- `id` (uuid, PK): Queue item ID
- `user_id` (text): Reference to users.id
- `question_id` (uuid): Reference to questions.id
- `recommendation_reason` (text): Recommendation reason
- `priority_score` (numeric): Priority score
- `recommended_at` (timestamp with time zone): Recommendation timestamp
- `scheduled_for` (timestamp with time zone): Scheduled timestamp
- `status` (text): Status
- `shown_at` (timestamp with time zone): Shown timestamp
- `attempted_at` (timestamp with time zone): Attempted timestamp
- `is_correct` (boolean): Correctness flag
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

##### `rep_daily_overview`

Daily overview reports.

Columns:
- `user_id` (text, PK): Reference to users.id
- `day` (date, PK): Day
- `study_minutes_total` (integer): Total study minutes
- `chapters_completed` (integer): Chapters completed
- `topics_completed` (integer): Topics completed
- `accuracy_pct` (numeric): Accuracy percentage
- `streak_after_today` (integer): Streak after today
- `best_hour_utc` (integer): Best hour (UTC)
- `attention_threshold_q` (integer): Attention threshold
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

##### `rep_weekly_overview`

Weekly overview reports.

Columns:
- `user_id` (text, PK): Reference to users.id
- `iso_year` (integer, PK): ISO year
- `iso_week` (integer, PK): ISO week
- `study_minutes_total` (integer): Total study minutes
- `subjects_progress` (jsonb): Subject progress
- `accuracy_by_subject` (jsonb): Accuracy by subject
- `best_day_of_week` (integer): Best day of week
- `top_weak_topics` (uuid[]): Top weak topics
- `attention_threshold_q` (integer): Attention threshold
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

##### `rep_monthly_overview`

Monthly overview reports.

Columns:
- `user_id` (text, PK): Reference to users.id
- `year` (integer, PK): Year
- `month` (integer, PK): Month
- `month_start` (date): Month start date
- `study_minutes_total` (integer): Total study minutes
- `subjects_progress` (jsonb): Subject progress
- `accuracy_by_subject` (jsonb): Accuracy by subject
- `top_weak_topics` (uuid[]): Top weak topics
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

##### `rep_exam_readiness`

Exam readiness reports.

Columns:
- `user_id` (text, PK): Reference to users.id
- `exam_type` (text): Exam type
- `readiness_score` (numeric): Readiness score
- `predicted_range_low` (numeric): Predicted range low
- `predicted_range_high` (numeric): Predicted range high
- `weakest_subjects` (uuid[]): Weakest subjects
- `weakest_topics` (uuid[]): Weakest topics
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp

### Auth Schema Tables

- **users**: Authentication user accounts
- **refresh_tokens**: Tokens for refreshing authentication
- **instances**: Multi-site user management
- **audit_log_entries**: Audit trail for user actions
- **schema_migrations**: Auth system updates
- **identities**: User identities
- **sessions**: User session data
- **mfa_factors**: Multi-factor authentication factors
- **mfa_challenges**: MFA challenge records
- **mfa_amr_claims**: MFA authentication method reference claims
- **sso_providers**: SSO provider information
- **sso_domains**: SSO domain mapping
- **saml_providers**: SAML identity provider connections
- **saml_relay_states**: SAML relay state information
- **flow_state**: PKCE login metadata
- **one_time_tokens**: One-time tokens

### Storage Schema Tables

- **buckets**: Storage buckets
- **objects**: Stored objects
- **migrations**: Storage migrations
- **s3_multipart_uploads**: S3 multipart upload tracking
- **s3_multipart_uploads_parts**: S3 multipart upload parts

### Cron Schema Tables

- **job**: Scheduled jobs
- **job_run_details**: Job execution details

### Other Schema Tables

- **pgsodium.key**: Encryption key metadata
- **vault.secrets**: Encrypted secrets
- **realtime.schema_migrations**: Realtime migrations
- **realtime.subscription**: Realtime subscriptions
- **realtime.messages**: Realtime messages
- **supabase_migrations.schema_migrations**: Database migration history
- **supabase_migrations.seed_files**: Seed files for database

## Key Functions

### User Management Functions

- `handle_new_user()`: Trigger function for new user creation
- `handle_login()`: Trigger function for login handling
- `update_admin_role(user_email)`: Updates a user's role to admin
- `setup_admin_user()`: Sets up the admin user
- `ensure_all_employees()`: Ensures employee records exist for all users
- `admin_create_user(admin_email, admin_password)`: Creates an admin user
- `create_user_profile()`: Creates a user profile on user creation

### Study Progress Functions

- `update_chapter_study_status(p_user_id, p_chapter_id, p_studied)`: Updates chapter study status
- `update_topic_study_status(p_user_id, p_chapter_id, p_topic_id, p_topic_name, p_studied)`: Updates topic study status
- `trg_update_progress()`: Trigger function to update progress
- `trg_update_streak()`: Trigger function to update streaks
- `update_user_streak()`: Updates user streak information

### Analytics Functions

- `fn_update_mastery(p_user, p_topic)`: Updates topic mastery
- `fn_calculate_next_review(p_repetition_count, p_ease_factor, p_performance_rating)`: Calculates next review date
- `trg_update_spaced_repetition()`: Trigger function for spaced repetition
- `fn_queue_recommended_questions(p_user, p_limit)`: Queues recommended questions
- `update_daily_reports()`: Updates daily reports
- `update_weekly_reports()`: Updates weekly reports
- `update_all_reports()`: Updates all reports
- `fn_rollup_daily(p_user, p_day)`: Rollups daily statistics
- `fn_rollup_weekly(p_user, p_year, p_week)`: Rollups weekly statistics
- `fn_calculate_readiness(p_user, p_exam_type)`: Calculates exam readiness

### Utility Functions

- `set_updated_at()`: Trigger function to set updated_at column
- `update_timestamp()`: Trigger function to update timestamp
- `ensure_userid_consistency()`: Ensures user ID consistency
- `ensure_userid_is_text()`: Ensures user ID is stored as text
- `check_valid_user_id()`: Validates user ID format

## Extensions

The database has the following key extensions installed:
- `pgcrypto`: Cryptographic functions
- `pgjwt`: JSON Web Token API
- `uuid-ossp`: UUID generation
- `pg_graphql`: GraphQL support
- `supabase_vault`: Secure vault for secrets
- `pg_cron`: Job scheduling
- `pgsodium`: Libsodium encryption functions

## Migrations

The database has 61 applied migrations, starting from `20240403` (create_users_table) to the latest migrations that handle user IDs, RLS policies, and report tables.

## Key Relationships

1. Users and Profiles:
   - `user_profiles` -> `users` via `user_id`
   - `user_streaks` -> `users` via `user_id`
   - `onboarding_surveys` -> `users` via `user_id`
   - `study_preferences` -> `users` via `user_id`

2. Content Structure:
   - `chapters` -> `subjects` via `subject_id`
   - `topics` -> `chapters` via `chapter_id`
   - `subtopics` -> `topics` via `topic_id`
   - `questions` links to `subjects`, `chapters`, `topics`, and `subtopics`

3. User Progress:
   - `user_studied_chapters` -> `users` via `user_id`
   - `user_studied_chapters` -> `chapters` via `chapter_id`
   - `user_studied_topics` -> `users` via `user_id`
   - `user_studied_topics` -> `chapters` via `chapter_id`
   - `user_studied_topics` -> `topics` via `topic_id`

4. Analytics:
   - `evt_question_attempts` -> `users`, `questions`, `subjects`, `chapters`, `topics`, `subtopics`
   - `evt_study_sessions` -> `users`
   - `evt_daily_logins` -> `users`
   - `dim_topic_mastery` -> `users`, `topics`
   - `dim_spaced_repetition_queue` -> `users`, `questions`
   - All report tables (`rep_*`) link to `users`

## Row-Level Security (RLS)

Many tables have RLS enabled to ensure data privacy:
- `users`
- `user_profiles`
- `user_streaks`
- `onboarding_surveys`
- `study_preferences`
- `subjects`
- `chapters`
- `user_studied_chapters`
- `topics`
- `user_studied_topics`
- All analytics tables (`evt_*`, `dim_*`, `rep_*`)

## Authentication System

The database includes a comprehensive authentication system in the `auth` schema, supporting:
- Email/password authentication
- Social authentication via identities
- Multi-factor authentication
- Session management
- SSO and SAML integration
- Audit logging 