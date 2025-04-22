Here is your full plan converted into a clean **step-by-step checklist** for Cursor or Notion-style tracking:

---

# ✅ Doable App – Implementation Checklist

---

## **PHASE 1 — App Logic & Onboarding**

- [x] **Auto Login with Clerk**
  - [x] Ensure user session is persisted using Clerk
  - [x] Redirect unauthenticated users to `/login`
  - [x] Set Clerk token for Supabase API after login
  - [x] Hide "Continue with Google" if user is already authenticated
  
  **Implementation Notes:**
  - Enhanced SecureStore token cache in _layout.tsx to persist Clerk sessions
  - Added AuthMiddleware component to handle authentication redirects
  - Updated ClerkSupabaseSync to set Clerk JWT in Supabase client
  - Added authentication check in auth screen to hide login button for authenticated users

- [x] **Minimum Requirement after onboarding**
  - [x] Add validation to block access to practice if no topic is selected
  - [x] Use Supabase query or RPC to verify at least 1 topic exists
  - [x] Allow subject selection only where topics are added in practice session
  - [x] Initially topics need to be added in the home screen chapter input to start evaluation/practice session
  - [x] For new users in practice session add a card for evaluation to see user current performance level

  **Implementation Notes:**
  - Added `hasAtLeastOneTopic` function to check if a user has selected at least one topic
  - Updated the practice screen to block access if no topics are selected
  - Added an evaluation card for new users in the practice screen
  - Implemented topic check using Supabase RPC
  - Created a clear user flow to add topics before starting practice

- [x] **Initial Evaluation Test**
  - [x] Trigger test only once after onboarding
  - [x] Select 15 questions max from studied topics (≤ 2 questions per topics based on importance)
  - [x] Save evaluation attempt results to `evt_question_attempts`
  - [x] Store evaluation completion flag to avoid repetition

  **Implementation Notes:**
  - Created a dedicated evaluation screen with detailed question UI and results summary
  - Added utility functions to fetch, save, and track evaluation data
  - Implemented logic to select up to 15 questions with max 2 per topic, prioritizing by importance
  - Added completion tracking to ensure evaluation is only taken once
  - Stored evaluation results in the `evt_question_attempts` table
  - Integrated evaluation into the app using modal-based navigation to work around routing limitations

---

## **PHASE 2 — Reports & Study Analytics**
---

#### 2‑A  Detailed Performance Reports
- [x] **Create RPC `get_detailed_metrics`**
  - [x] Returns accuracy %, avg time, avg difficulty by subject / chapter / topic  
- [x] **Add columns to `evt_question_attempts`**
  - [x] `avg_time_sec`  
  - [x] `avg_difficulty`
- [x] **Back‑fill historical rows**
- [x] **Extend roll‑up functions**
  - [x] `fn_rollup_daily()`  
  - [x] `fn_rollup_weekly()`
- [x] **Build "Performance" tab in `reports`**
  - [x] Bar chart — Accuracy by subject  
  - [x] Heat‑map — Time × Difficulty by topic  
  - [x] Period selector (Daily / Weekly / Custom)

---

#### 2‑B  Exam Readiness Meter
- [ ] **Verify / finish `fn_calculate_readiness` output**
  - [ ] readiness_score 0‑100  
  - [ ] weakest_subjects JSON  
  - [ ] weakest_topics JSON
- [ ] **Schedule nightly cron** to refresh `rep_exam_readiness`
- [ ] **Add Readiness card to `reports`**
  - [ ] Circular gauge 0‑100  
  - [ ] Colour bands + label
- [ ] **Modal on tap**
  - [ ] List weakest subjects & topics  
  - [ ] CTA "Start Refine Session"
- [ ] **Empty‑state nudge** when no data

---

#### 2‑C  Study Habits Insights
- [ ] **Extend `rep_daily_overview`**
  - [ ] Practice minutes per hour bucket
- [ ] **RPC `get_study_habits`**
  - [ ] streaks, longest streak  
  - [ ] day‑of‑week consistency  
  - [ ] best_hour_utc
- [ ] **Habits tab in `study habits`**
  - [ ] Streak calendar heat‑map  
  - [ ] Bar chart minutes per weekday  
  - [ ] Highlight card "Best focus time"
- [ ] **Pass `best_hour_utc` to push‑reminder scheduler**

---

#### 2‑D  Motivational Nudges
- [ ] Detect "no data" state (`evt_question_attempts` count == 0)
- [ ] Display Nudge component
  - [ ] Illustration + copy  
  - [ ] Button "Start Practice"
- [ ] Emit analytics event `NudgeShown`

---

## **PHASE 3 — Smart Practice System**

- [ ] **Avoid Question Repeats**
  - [ ] Exclude questions attempted in last 30 days
  - [ ] Add fallback when question pool is low

- [ ] **Topic Mastery Tracking**
  - [ ] Display topic progress using `dim_topic_mastery`
  - [ ] Show progress inside question session view

- [ ] **Refine / Recall / Conquer Logic**
  - [ ] Categorize topics based on mastery level:
    - Refine: < 0.4
    - Recall: 0.4 – 0.7
    - Conquer: > 0.7
  - [ ] Use RPC to fetch questions based on mode

---

## **PHASE 4 — Spaced Repetition & Active Recall**

- [ ] **Topic-Level Spaced Repetition**
  - [ ] Create or update `dim_topic_review_schedule`
  - [ ] Track ease factor and next review date per topic
  - [ ] Rewrite repetition logic to be topic-based

- [ ] **Review Session Flow**
  - [ ] Build `/spaced-review` page
  - [ ] Display only due topics
  - [ ] Start review session with those topics

---

## **PHASE 5 — Native Device Features**

- [ ] **Distraction Shield for Android**
  - [ ] Detect usage of distracting apps (Instagram, TikTok, etc.)
  - [ ] Overlay motivational message to return to Doable

- [ ] **Distraction Nudges for iOS**
  - [ ] Use Screen Time APIs (if possible)
  - [ ] Trigger local push notification to bring user back

- [ ] **Push Notifications**
  - [ ] Ask notification permission on login
  - [ ] Store Expo token in Supabase
  - [ ] Schedule reminder based on best hour from reports

---

Here's your **updated checklist for PHASE 6 — XP System & Gamification** with all your requests included:

---

## ✅ **PHASE 6 — XP System & Gamification (Final Version)**

---

### 🎯 **Set XP Goals Before Practice**
- [ ] Allow user to **set an XP goal** before session starts
- [ ] Track **XP earned live** during the session
- [ ] When user reaches the goal:
  - [ ] Trigger **excited pet animation**
  - [ ] Show message:  
    _"Great job! You've reached your goal — every question now earns **+X% XP**!"_
  - [ ] Apply **XP multiplier** to all further questions in the session

---

### 🧠 **Feedback Animations on Answer**

#### ✅ Correct Answer
- [ ] After every 5 correct answers in a row:
  - [ ] Show **excited pet animation**
  - [ ] Display message:  
    _"🔥 5 in a row! You're on fire!"_

#### ❌ Incorrect Answer
- [ ] Show **writing pet animation**
- [ ] Display a **motivational message** like:  
  _"Don't worry! Let's try that again together."_

---

### 🎁 **End-of-Session Reward Reveal**
- [ ] Show **treasure chest animation** at the end of the practice session
- [ ] Reveal rewards:
  - [ ] Total XP earned
  - [ ] Bonus XP from streaks or goal multiplier
  - [ ] Badges or surprise rewards (if any)
- [ ] Include a "Continue" or "Keep Going" button for next action

---

### 🎲 **Random Surprise Reward System**
- [ ] After a session ends, with 20% chance:
  - [ ] Show **special animation** (e.g. sparkles or animated badge)
  - [ ] Give user a surprise reward like:
    - [ ] Bonus XP (e.g., +50 XP)
    - [ ] Temporary XP booster
    - [ ] Special badge (e.g., "Focused Owl")

---

### 🛠 Optional Enhancements (Advanced)
- [ ] Make animations stackable (e.g., 5-in-a-row + XP Goal reached)
- [ ] Store reward history in DB for user profile display
- [ ] Animate the XP progress bar filling live

---

## **PHASE 7 — Profile & Settings**

- [ ] **Simplify Profile Setup**
  - [ ] Ask only for date of birth and parent's mobile
  - [ ] Remove name fields or make them optional

- [ ] **Delete Account Option**
  - [ ] Add button in settings page
  - [ ] Remove user from Clerk
  - [ ] Anonymize email and phone in Supabase
  - [ ] Retain learning data (anonymized)

- [ ] **Bookmarks**
  - [ ] Allow bookmarking of questions during practice
  - [ ] Create a bookmarks section in profile
  - [ ] Show all bookmarked questions in one view

---

## **PHASE 8 — QA & Testing**

- [ ] **Backend Tests**
  - [ ] Add Jest tests for:
    - Practice session selector
    - Evaluation logic
    - Spaced repetition

- [ ] **Frontend QA**
  - [ ] Add Cypress tests for:
    - Onboarding & topic guard
    - Evaluation session
    - Practice modes
    - Reports dashboard
    - Bookmarks

---

Let me know if you want this converted into a `.md` file or pasted directly into Cursor task format.


Below is a copy‑paste‑ready **implementation checklist** (modeled after the Cursor / Notion style you liked) that covers every layer—DB, backend, and Expo‑Router UI—for the new **"Start Practice" gating flow**.

---

## ✅ Doable App — "Start Practice" Gating & Unlock System

---

### ✅ 0 · Prep & Migration
  - [x] Adds new tables & columns listed in §1

---

### ✅ 1 · Database Schema (Supabase)

| Table / Column | Type | Purpose |
|----------------|------|---------|
| **`user_studied_topics`** | *(exists)* | already records topics user marked as studied |
| **`user_practice_stats`** | `user_id UUID PK`<br>`recall_attempts INT DEFAULT 0`<br>`refine_attempts INT DEFAULT 0` | running totals for unlock logic |
| **`practice_unlocks`** | `user_id UUID`<br>`practice_type TEXT` (`recall`,`refine`,`conquer`)<br>`unlocked_at TIMESTAMPTZ` | historical log / analytics |
| **`subject_unlock_status`** (MATERIALIZED VIEW) | `user_id` `subject_id` `is_unlocked BOOL` | fast look‑ups for subject gating |

> **RLS**
> ```sql
> -- user_practice_stats
> CREATE POLICY "user can read/write own stats"
>   ON user_practice_stats FOR ALL
>   USING (auth.uid() = user_id)
>   WITH CHECK (auth.uid() = user_id);
> ```

---

### ✅ 2 · Edge Function / RPCs

1. [x] **`get_available_subjects(user_id, exam_id)`**
   - Returns every subject with `is_unlocked` flag (uses `subject_unlock_status`).
2. [x] **`increment_practice_attempt(user_id, practice_type, n)`**
   - Atomically `UPDATE user_practice_stats … RETURNING totals`.
   - If thresholds crossed (50 → Refine, 100 each → Conquer) → insert row in `practice_unlocks`.

---

### ✅ 3 · Frontend (Expo Router)

#### ✅ 3.1 SubjectSelectionScreen
- [x] **Fetch** `get_available_subjects`.
- [x] **Render grid**  
  - **Unlocked** → normal card.  
  - **Locked** → greyed‑out, lock icon, CTA "Add a topic to unlock".
- [x] **On locked tap** → modal explaining requirement + **"Go to Add Topics"** button.

#### ✅ 3.2 PracticeTypeScreen
- [x] **Fetch** `user_practice_stats` + `practice_unlocks`.
- [x] **Display chips**  
  - Recall → always enabled.  
  - Refine → disabled until `recall_attempts ≥ 50`.  
  - Conquer → disabled until `recall_attempts ≥ 100 && refine_attempts ≥ 100`.
- [x] **Progress bar** under each locked chip: "34 / 50 questions solved".

#### ✅ 3.3 Session Flow Hook
- [x] **`usePracticeTracker()`**  
  - Subscribes to question results stream.  
  - On every *correct or attempted* question → call `increment_practice_attempt`.

---

### ✅ 4 · Analytics & Gamification

- [x] **Amplitude / PostHog** event `"practice_type_unlocked"` with `practice_type`.