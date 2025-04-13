# Doable Analytics Implementation Guide

This document explains how to use the analytics schema implemented in the Doable application to support the reports functionality.

## Schema Overview

The analytics schema follows a structured approach with three main categories of tables:

1. **Raw Event Tables** (`evt_*`) - Immutable source of truth for all user actions
2. **Derived State Tables** (`dim_*`) - Mutable state calculated from event data
3. **Pre-computed Report Tables** (`rep_*`) - Pre-aggregated metrics for UI display

## Integration Flow

```
User Activity → Event Tables → Derived State → Report Tables → UI Reports
```

### Step 1: Capture Events

When users perform key actions in the app, record them in the appropriate event tables:

#### Question Attempts
```javascript
// When a user answers a question
const recordAttempt = async (userId, questionId, isCorrect, timeTaken) => {
  const { data, error } = await supabase
    .from('evt_question_attempts')
    .insert({
      user_id: userId,
      question_id: questionId,
      is_correct: isCorrect,
      time_taken_seconds: timeTaken,
      completed_at: new Date().toISOString(),
      subject_id: question.subject_id,
      chapter_id: question.chapter_id,
      topic_id: question.topic_id,
      subtopic_id: question.subtopic_id,
      attempt_source: 'practice'
    });

  // Handle error if needed
};
```

#### Study Sessions
```javascript
// When a user starts studying a topic
const startStudySession = async (userId, topicsArray) => {
  const { data, error } = await supabase
    .from('evt_study_sessions')
    .insert({
      user_id: userId,
      topics_covered: topicsArray,
      start_time: new Date().toISOString()
    })
    .select('id')
    .single();
    
  return data?.id; // Return session ID to update later
};

// When they finish studying
const endStudySession = async (sessionId, durationMinutes) => {
  const { data, error } = await supabase
    .from('evt_study_sessions')
    .update({
      end_time: new Date().toISOString(),
      duration_minutes: durationMinutes
    })
    .eq('id', sessionId);
};
```

#### Daily Logins
```javascript
// When user logs in, record the date (ensure only one per day)
const recordDailyLogin = async (userId) => {
  const { data, error } = await supabase
    .from('evt_daily_logins')
    .upsert({
      user_id: userId,
      login_date: new Date().toISOString().split('T')[0]
    });
};
```

### Step 2: Process State Updates (Edge Functions/Scheduled Jobs)

Create Edge Functions or scheduled jobs to process events and update derived state:

#### Topic Mastery Update

This function should run after each study session or periodically:

```javascript
// Example Edge Function
export async function updateTopicMastery(userId, topicId) {
  // 1. Get all attempts for this topic
  const { data: attempts } = await supabase
    .from('evt_question_attempts')
    .select('is_correct, time_taken_seconds, completed_at')
    .eq('user_id', userId)
    .eq('topic_id', topicId);
    
  // 2. Calculate mastery metrics
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter(a => a.is_correct).length;
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
  const lastPracticed = attempts.length > 0 
    ? attempts.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0].completed_at
    : null;
    
  // 3. Apply spaced repetition algorithm
  const { data: existingMastery } = await supabase
    .from('dim_topic_mastery')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();
    
  let easeFactor = existingMastery?.ease_factor || 2.5;
  let repetitionCount = existingMastery?.repetition_count || 0;
  
  // Adjust ease factor based on performance
  const performanceRating = accuracy >= 0.8 ? 5 : 
                           accuracy >= 0.6 ? 4 : 
                           accuracy >= 0.4 ? 3 : 
                           accuracy >= 0.2 ? 2 : 1;
                           
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - performanceRating) * (0.08 + (5 - performanceRating) * 0.02)));
  
  if (performanceRating >= 3) {
    repetitionCount++;
  } else {
    repetitionCount = 0;
  }
  
  // 4. Calculate next review date based on SM-2 algorithm
  const intervalDays = repetitionCount === 0 ? 1 : 
                      repetitionCount === 1 ? 6 : 
                      Math.round(easeFactor * intervalDays);
                      
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
  
  // 5. Calculate mastery level (0-1 scale)
  const recencyFactor = lastPracticed ? 
    Math.max(0, 1 - (Date.now() - new Date(lastPracticed).getTime()) / (30 * 24 * 60 * 60 * 1000)) : 0;
    
  const masteryLevel = (0.4 * accuracy) + 
                      (0.3 * recencyFactor) + 
                      (0.2 * Math.min(1, repetitionCount / 10)) + 
                      (0.1 * (existingMastery?.mastery_level || 0));
  
  // 6. Update or insert mastery record
  await supabase
    .from('dim_topic_mastery')
    .upsert({
      user_id: userId,
      topic_id: topicId,
      mastery_level: masteryLevel,
      repetition_count: repetitionCount,
      last_practiced: lastPracticed,
      ease_factor: easeFactor,
      next_review_date: nextReviewDate.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    });
}
```

### Step 3: Generate Report Data (Daily Jobs)

Schedule nightly jobs to calculate report data for fast UI rendering:

```javascript
// Example daily report generation (run at midnight)
export async function generateDailyReports() {
  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split('T')[0];
  
  // Get all users who were active yesterday
  const { data: activeUsers } = await supabase
    .from('evt_daily_logins')
    .select('user_id')
    .eq('login_date', yesterdayDate);
    
  // Process each user
  for (const user of activeUsers) {
    const userId = user.user_id;
    
    // Calculate study minutes
    const { data: studySessions } = await supabase
      .from('evt_study_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .gte('start_time', `${yesterdayDate}T00:00:00`)
      .lt('start_time', `${yesterdayDate}T23:59:59`);
      
    const studyMinutesTotal = studySessions.reduce((sum, session) => 
      sum + (session.duration_minutes || 0), 0);
    
    // Calculate chapters and topics completed
    const { data: chaptersStudied } = await supabase
      .from('user_studied_chapters')
      .select('chapter_id')
      .eq('user_id', userId)
      .eq('study_date', yesterdayDate);
      
    const { data: topicsStudied } = await supabase
      .from('user_studied_topics')
      .select('topic_id')
      .eq('user_id', userId)
      .eq('study_date', yesterdayDate);
    
    // Calculate accuracy percentage
    const { data: attempts } = await supabase
      .from('evt_question_attempts')
      .select('is_correct')
      .eq('user_id', userId)
      .gte('completed_at', `${yesterdayDate}T00:00:00`)
      .lt('completed_at', `${yesterdayDate}T23:59:59`);
      
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.is_correct).length;
    const accuracyPct = totalAttempts > 0 ? 
      Math.round((correctAttempts / totalAttempts) * 100) : null;
    
    // Calculate streak
    const { data: loginDates } = await supabase
      .from('evt_daily_logins')
      .select('login_date')
      .eq('user_id', userId)
      .order('login_date', { ascending: false });
      
    let streak = 0;
    let currentDate = new Date(yesterdayDate);
    
    for (const { login_date } of loginDates) {
      const loginDateObj = new Date(login_date);
      const diffDays = Math.floor((currentDate - loginDateObj) / (24 * 60 * 60 * 1000));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = loginDateObj;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Find best study hour
    const { data: hourlyAttempts } = await supabase.rpc('get_hourly_attempts', { 
      user_id: userId, 
      target_date: yesterdayDate 
    });
    
    const bestHour = hourlyAttempts.length > 0 ? 
      hourlyAttempts.sort((a, b) => b.success_rate - a.success_rate)[0].hour : null;
    
    // Calculate attention threshold
    const attentionThreshold = calculateAttentionThreshold(attempts);
    
    // Store in daily overview
    await supabase
      .from('rep_daily_overview')
      .upsert({
        user_id: userId,
        day: yesterdayDate,
        study_minutes_total: studyMinutesTotal,
        chapters_completed: chaptersStudied.length,
        topics_completed: topicsStudied.length,
        accuracy_pct: accuracyPct,
        streak_after_today: streak,
        best_hour_utc: bestHour,
        attention_threshold_q: attentionThreshold,
        updated_at: new Date().toISOString()
      });
  }
}
```

### Step 4: Serve Report Data to UI

Query the pre-computed report tables for rapid UI display:

```javascript
// In your reports screen component
const fetchReportData = async () => {
  // Daily report data
  const { data: dailyData } = await supabase
    .from('rep_daily_overview')
    .select('*')
    .order('day', { ascending: false })
    .limit(7);
    
  // Weekly report
  const currentWeek = getCurrentISOWeek();
  const { data: weeklyData } = await supabase
    .from('rep_weekly_overview')
    .select('*')
    .eq('iso_year', currentWeek.year)
    .eq('iso_week', currentWeek.week)
    .single();
    
  // Readiness data
  const { data: readinessData } = await supabase
    .from('rep_exam_readiness')
    .select('*')
    .single();
    
  // Mastery data for top topics
  const { data: topicMastery } = await supabase
    .from('dim_topic_mastery')
    .select('topic_id, mastery_level')
    .order('mastery_level', { ascending: false })
    .limit(5);
    
  // Use the data to render reports
  setReportData({
    dailyStats: dailyData,
    weeklyStats: weeklyData,
    readiness: readinessData,
    topMasteredTopics: topicMastery
  });
};
```

## Implementing a Spaced Repetition System

The `dim_spaced_repetition_queue` table enables an effective spaced repetition system. Here's how to use it:

```javascript
// Daily job to queue recommended questions
export async function queueRecommendedQuestions() {
  // 1. Get topics due for review
  const { data: topicsDue } = await supabase
    .from('dim_topic_mastery')
    .select('user_id, topic_id')
    .lte('next_review_date', new Date().toISOString().split('T')[0]);
    
  // 2. For each topic, select appropriate questions
  for (const { user_id, topic_id } of topicsDue) {
    // Get questions from this topic the user hasn't seen recently
    const { data: questions } = await supabase
      .from('questions')
      .select('id')
      .eq('topic_id', topic_id)
      .not('id', 'in', supabase
        .from('evt_question_attempts')
        .select('question_id')
        .eq('user_id', user_id)
        .gte('completed_at', getDateXDaysAgo(14))
      )
      .limit(3);
      
    // Add them to the queue
    for (const question of questions) {
      await supabase
        .from('dim_spaced_repetition_queue')
        .upsert({
          user_id,
          question_id: question.id,
          recommendation_reason: 'Spaced Repetition',
          priority_score: 100, // High priority for SR items
          status: 'pending'
        });
    }
  }
  
  // Also add questions from weak topics
  const { data: weakTopics } = await supabase
    .from('dim_topic_mastery')
    .select('user_id, topic_id')
    .lt('mastery_level', 0.4);
    
  // Similar process for weak topics...
}
```

## Conclusion

This analytics schema provides a robust foundation for all the reports functionality described in the Reports_Screen_Requirements.md document. By separating raw events from derived state and pre-computed reports, you achieve:

1. **Better performance** - UI reads from pre-aggregated data
2. **Data integrity** - Raw events are never modified
3. **Algorithm flexibility** - Change how metrics are calculated without restructuring
4. **Scalability** - Expensive calculations happen in background jobs

The implementation of these tables with proper RLS policies ensures data security while enabling the rich analytics capabilities required by your application. 