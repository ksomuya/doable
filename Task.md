Below is a **copy‑paste‑ready “Cursor todo list.”**  
Put it into a single **`TASKS.md`** file (or straight into Cursor’s command bar) and run each task from top to bottom.  
Every task is already phrased the way Cursor understands:

---

### 0. Bootstrap
- [ ] **Install native packages**  
  `cursor add expo-focus-mode react-native-notifications lottie-react-native react-native-confetti`  
  _Then_ run `npx pod-install` for iOS.
- [ ] **Create `src/providers/AuthProvider.tsx`**  
  ```tsx
  // provides Splash‑screen auth check and context
  ```
- [ ] **Wrap `<App>` in `<AuthProvider>`** inside `App.tsx`.

---

### 1. Splash‑screen & Auto‑login
- [ ] **Inside `AuthProvider` add**  
  ```ts
  const { data } = await supabase.auth.getSession();
  setState(data.session ? "ready" : "guest");
  ```
- [ ] **Delete** the redirect logic from `app/routes/index.tsx` (flicker fix).

---

### 2. Skip “Continue with Google”
- [ ] **DB migration `20240415_add_provider.sql`**
  ```sql
  ALTER TABLE public.users ADD COLUMN provider text;
  ```
- [ ] **Update trigger `handle_new_user()`** to set `provider`.
- [ ] **Hide Google button** in `src/components/LoginCard.tsx` when `user.provider`.

---

### 3. Onboarding topic guard
- [ ] **RPC `has_minimum_topics.sql`**
  ```sql
  CREATE OR REPLACE FUNCTION has_minimum_topics(p_uid text)
  RETURNS boolean
  LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_studied_topics
    WHERE user_id = p_uid
  );
  $$;
  ```
- [ ] **Disable “Start Practice” CTA** in `/home` when RPC returns false.

---


## 4. **Bite‑size Evaluation Test (max 15 Qs)**

> Replaces the previous “30‑question evaluation” task.

- [ ] **Migration `20240415_initial_evaluation.sql`**
  ```sql
  CREATE TABLE initial_evaluations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id text REFERENCES users(id),
    completed_at timestamptz
  );
  ```
- [ ] **Edge function `start_initial_test.ts`**
  1. **Inputs**: `user_id`.
  2. If the user already has a row in `initial_evaluations`, return `null`.
  3. Else:
     - Insert row.
     - Query **15 questions total**:  
       ```sql
       WITH pool AS (
         SELECT q.id, row_number() OVER (PARTITION BY subject_id ORDER BY random()) AS rn
         FROM questions q
         JOIN topics  t ON t.id = q.topic_id
         WHERE t.id = ANY (:userTopicIds)
       )
       SELECT id
       FROM pool
       WHERE rn <= 5   -- at most 5 per subject so it never overwhelms
       LIMIT 15;
       ```
     - Return the 15 IDs.
- [ ] **Route `/evaluation`**
  - Only mounts when `start_initial_test` returns IDs.
  - Re‑uses the normal question UI.
  - On completion, attempts are written to `evt_question_attempts`; nothing else needed.

---

## 5. **Distraction‑Shield (overlay instead of native Focus Mode)**

> Replaces the “native Focus Mode API” section.

### 5‑A Android overlay
- [ ] **Add package**  
  `cursor add react-native-android-overlay-permission`
- [ ] **Create service `DistractionShieldService.kt`**
  - Requests `SYSTEM_ALERT_WINDOW` & `PACKAGE_USAGE_STATS`.
  - Polls `UsageStatsManager` every 2 s.
  - If the foreground package **matches a blocked list** (`instagram`, `tiktok`, `twitter`, etc.), launches `ShieldActivity` (full‑screen, non‑dismissable for 10 s) that says:  
    > “Hey 👋 Time to practise! Tap here to jump back to Doable.”
- [ ] **JS wrapper `useDistractionShield.ts`**
  ```ts
  import { startShield, stopShield } from 'react-native-android-overlay-permission';
  ```
  - Start on app **background** (`AppState === 'background'`) and stop when foreground again.

### 5‑B iOS fallback
*(True overlays aren’t allowed on iOS.)*
- [ ] **Schedule “nudge” local push** whenever the app goes to background **and** ScreenTime category = Social.  
  - Use `DeviceActivityReport` + `ManagedSettings` APIs (iOS 16+).
  - The notification deep‑links to `doable://practice`.

---

## 6. Study Reports (detailed metrics **+ exam readiness card**)

> Exam readiness is now **inside** `/progress` instead of a new page.

- [ ] **Cron job** *(same as before)* to keep `rep_exam_readiness` fresh.
- [ ] **Extend `/progress` dashboard**
  1. Add a new **`<ExamReadinessCard>`** at the top‑right:  
     - Shows gauge (0‑100) + label (“Almost there”, “Needs work”…).  
     - Click → modal with weakest subjects/topics list.
  2. Remove the old “Exam Readiness” route from router config.
### 7. Smart practice CAT
- [ ] **Edge RPC `select_next_questions.sql`**
  ```sql
  -- mode = refine | recall | conquer
  ```
  (use `dim_topic_mastery` thresholds 0.4 / 0.7)
- [ ] **Modify `/practice` loader** to call this RPC instead of raw query.

---

### 8. Prevent question repeats
- [ ] **Update question fetch**  
  ```sql
  AND NOT EXISTS (
    SELECT 1 FROM evt_question_attempts a
    WHERE a.user_id = :uid
      AND a.question_id = q.id
      AND a.completed_at > now() - interval '30 days'
  )
  ```

---

### 9. Topic‑level spaced repetition
- [ ] **Table `dim_topic_review_schedule`**  
  ```sql
  user_id text, topic_id uuid, ease_factor numeric, next_review_date date
  ```
- [ ] **Rewrite trigger `trg_update_spaced_repetition()`** to operate on that table.
- [ ] **Build route `/spaced-review`** that lists today’s due topics → question flow.

---

### 10. Native Focus mode & notifications
- [ ] **Hook `useFocusMode.ts`**  
  ```ts
  FocusMode.start(); // on session start
  FocusMode.stop();  // on end
  ```
- [ ] **Ask notification permission** at first login, save `expo_push_token` into `user_profiles`.
- [ ] **Edge job `schedule_study_reminders.ts`**  
  - Query `rep_daily_overview.best_hour_utc`  
  - Insert local push via Supabase `pg_cron`.

---

### 11. XP goals & bonus
- [ ] **Migration** `ALTER TABLE user_profiles ADD COLUMN daily_xp_goal int;`
- [ ] **Modal `SetGoalModal.tsx`** opens before every session.
- [ ] **Edge RPC `grant_bonus_xp.sql`** multiplies XP by 1.05 / 1.10 / 1.15.

---

### 12. Dopamine animations
- [ ] **Import Lottie** files `sad_pet.json`, `happy_pet.json`.
- [ ] **Play sad animation** on wrong answer.  
- [ ] **Maintain counter** in Redux; on 5th correct play confetti + happy animation.

---

### 13. Random rewards
- [ ] **After `/practice/summary`**  
  ```ts
  if (Math.random() < 0.2) open(<RewardModal />);
  ```

---

### 14. Profile simplification
- [ ] **SQL**  
  ```sql
  ALTER TABLE public.users
    ALTER COLUMN first_name DROP NOT NULL,
    ALTER COLUMN last_name DROP NOT NULL;
  ```
- [ ] **Remove name fields** from `/setup-profile` form.

---

### 15. Delete account
- [ ] **Edge function `delete_account.ts`**
  ```ts
  await supabase.auth.admin.deleteUser(uid);
  await supabase
    .from('users')
    .update({ email: null, phone: null, provider: null })
    .eq('id', uid);
  ```
- [ ] **Danger button** in `/settings`.

---

### 16. Bookmarks
- [ ] **Table `bookmarks`**  
  `user_id text, question_id uuid, created_at timestamptz default now()`
- [ ] **Bookmark icon** in `QuestionHeader.tsx` toggles row.
- [ ] **Route `/profile/bookmarks`** shows saved questions.

---

### 17. QA & tests
- [ ] **Add Cypress spec** `onboarding_e2e.cy.ts`.
- [ ] **Add Jest tests** for `select_next_questions`, `grant_bonus_xp`, `delete_account`.
- [ ] **Emit Segment events** in each new edge function.

---

**That’s it.**  
Run tasks sequentially; after every section, execute `npm run test && npx cypress run` to make sure nothing broke.

Happy shipping!