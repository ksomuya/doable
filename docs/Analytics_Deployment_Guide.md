# Doable Analytics Deployment Guide

This document provides instructions for deploying and scheduling the analytics functions needed for the reports system.

## Overview

The Doable analytics system consists of:

1. **Database tables** - For storing events, derived state, and pre-computed reports
2. **PostgreSQL triggers and functions** - For real-time updates and calculations
3. **Edge Functions** - For near-real-time processing and complex calculations
4. **Cron jobs** - For scheduled batch processing

## Deployment Steps

### 1. Create the Database Schema

The schema should already be created from the previous migrations. To verify, check that all the following tables exist:

- Event tables: `evt_question_attempts`, `evt_study_sessions`, `evt_daily_logins`
- Derived state tables: `dim_topic_mastery`, `dim_spaced_repetition_queue`
- Report tables: `rep_daily_overview`, `rep_weekly_overview`, `rep_monthly_overview`, `rep_exam_readiness`

### 2. Deploy Edge Functions

#### 2.1 Initialize Supabase Edge Functions (if not already done)

```bash
supabase functions deploy
```

#### 2.2 Deploy the Individual Functions

```bash
# Deploy the nightly reports function
supabase functions deploy nightly_reports

# Deploy the theta update function
supabase functions deploy update_theta
```

### 3. Schedule Cron Jobs

Use the Supabase dashboard or CLI to schedule the following cron jobs:

#### 3.1 Nightly Reports (Daily at 2 AM UTC)

```bash
supabase cron schedule "nightly-reports" "0 2 * * *" \
  --command "supabase functions invoke nightly_reports --no-wait"
```

#### 3.2 Spaced Repetition Queue (Every 6 Hours)

This job is handled by the nightly reports function, but you can add a dedicated function if needed.

```bash
supabase cron schedule "spaced-repetition" "0 */6 * * *" \
  --command "supabase functions invoke nightly_reports --no-wait"
```

## Client Integration

### 1. Recording Question Attempts

When a user answers a question, call the theta update Edge Function:

```typescript
const recordQuestionAttempt = async (
  questionId: string, 
  isCorrect: boolean, 
  timeTaken: number
) => {
  const { data, error } = await supabase.functions.invoke('update_theta', {
    body: {
      userId: user.id,
      questionId,
      isCorrect,
      timeTaken
    }
  })
  
  if (error) {
    console.error('Error recording attempt:', error)
    return false
  }
  
  // Optionally use the returned theta values
  console.log(`Ability estimate updated: ${data.thetaBefore} → ${data.thetaAfter}`)
  return true
}
```

### 2. Recording Study Sessions

When a user starts studying:

```typescript
const startStudySession = async (topicIds: string[]) => {
  const { data, error } = await supabase
    .from('evt_study_sessions')
    .insert({
      user_id: user.id,
      topics_covered: topicIds,
      start_time: new Date().toISOString()
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Error starting session:', error)
    return null
  }
  
  // Save session ID to update later
  setCurrentSessionId(data.id)
  return data.id
}
```

When they finish:

```typescript
const endStudySession = async (sessionId: string, durationMinutes: number) => {
  const { error } = await supabase
    .from('evt_study_sessions')
    .update({
      end_time: new Date().toISOString(),
      duration_minutes: durationMinutes
    })
    .eq('id', sessionId)
  
  if (error) {
    console.error('Error ending session:', error)
    return false
  }
  
  return true
}
```

### 3. Recording Daily Logins

Add this to your app's startup logic:

```typescript
const recordDailyLogin = async () => {
  const today = new Date().toISOString().split('T')[0]
  
  const { error } = await supabase
    .from('evt_daily_logins')
    .upsert({
      user_id: user.id,
      login_date: today
    })
  
  if (error) {
    console.error('Error recording login:', error)
  }
}
```

### 4. Fetching Report Data

Use the pre-computed reports for UI display:

```typescript
const fetchReportData = async () => {
  // Daily overview (last 7 days)
  const { data: dailyData } = await supabase
    .from('rep_daily_overview')
    .select('*')
    .order('day', { ascending: false })
    .limit(7)
  
  // Weekly overview (current week)
  const currentDate = new Date()
  const startDate = new Date(currentDate)
  startDate.setDate(currentDate.getDate() - currentDate.getDay())
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  const { data: weeklyData } = await supabase
    .from('rep_weekly_overview')
    .select('*')
    .eq('iso_year', currentDate.getFullYear())
    .eq('iso_week', getISOWeek(currentDate))
    .single()
  
  // Exam readiness
  const { data: readinessData } = await supabase
    .from('rep_exam_readiness')
    .select('*')
    .single()
  
  // Return consolidated report data
  return {
    daily: dailyData || [],
    weekly: weeklyData,
    readiness: readinessData
  }
}
```

### 5. Getting Recommended Questions

```typescript
const getRecommendedQuestions = async (limit = 10) => {
  const { data, error } = await supabase
    .from('dim_spaced_repetition_queue')
    .select('question_id, recommendation_reason, priority_score')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('priority_score', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
  
  // Now fetch the actual questions
  if (data.length === 0) return []
  
  const questionIds = data.map(rec => rec.question_id)
  
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .in('id', questionIds)
  
  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
    return []
  }
  
  // Merge recommendations with questions
  return data.map(rec => ({
    ...questions.find(q => q.id === rec.question_id),
    recommendation_reason: rec.recommendation_reason,
    priority_score: rec.priority_score
  }))
}
```

## Maintenance and Monitoring

### Monitoring Function Executions

Use Supabase Dashboard > Edge Functions > Logs to monitor function executions and errors.

### Database Size Management

As event tables grow, consider:

1. Implementing table partitioning (e.g., by month) for `evt_*` tables
2. Setting up data retention policies (e.g., archive events older than 1 year)
3. Using `pg_partman` extension for automated partition management

### Performance Optimization

If you encounter performance issues:

1. Add indexes on frequently queried columns
2. Optimize the nightly jobs to process users in batches
3. Consider materialized views for complex analytics queries

## Troubleshooting

### Common Issues

1. **Missing data in reports**: Check that triggers are working correctly by monitoring event tables
2. **Slow report generation**: Look for missing indexes or optimize SQL functions
3. **Incorrect calculations**: Verify the algorithms in PostgreSQL functions and Edge Functions

### Debugging

To debug function execution:

```bash
# View logs for a specific function
supabase functions logs nightly_reports

# Test a function locally
supabase functions serve update_theta --env-file .env.local
```

## Advanced Topics

### Custom Metrics

To add custom metrics to the reports:

1. Add columns to the appropriate report tables
2. Update the calculation functions to populate these columns
3. Modify the client code to display the new metrics

### Machine Learning Integration

For more advanced predictive features:

1. Export user performance data to an external ML service
2. Train predictive models (e.g., XGBoost for score prediction)
3. Import predictions back via a scheduled job 