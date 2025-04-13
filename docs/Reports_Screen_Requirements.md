# Doable - Reports Screen Requirements

This document outlines the components, data, and algorithms needed for the reports screen in the Doable application.

## Reports Screen Purpose

The reports screen provides users with actionable insights about their learning progress, performance, and study habits to help them understand their strengths and areas for improvement.

## Key Metrics to Display

### 1. Study Progress Overview

**Components:**
- Total study time (daily, weekly, monthly)
- Number of topics covered
- Number of chapters completed
- Subject-wise progress bars

**Data Required:**
- `user_studied_chapters` records with timestamps
- `user_studied_topics` records with timestamps
- Topic and chapter completion status

**Algorithms:**
- Time-series aggregation of study sessions
- Completion percentage calculation: `(completed_items / total_items) * 100`

### 2. Performance Analytics

**Components:**
- Accuracy rate by subject/chapter/topic
- Question difficulty breakdown
- Time spent per question type
- Performance comparison to peer average (optional)

**Data Required:**
- Question attempt history
- Correct/incorrect answers
- Time taken per question

**Algorithms:**
- Accuracy calculation: `(correct_answers / total_attempts) * 100`
- Performance trending over time
- Weighted difficulty scoring

### 3. Streak & Consistency Metrics

**Components:**
- Current streak
- Longest streak
- Weekly consistency heatmap
- Study time distribution by day of week

**Data Required:**
- `user_streaks` data
- Daily login/activity timestamps
- Study session durations

**Algorithms:**
- Streak calculation (consecutive days of activity)
- Consistency score: measure of regular study patterns
- Time distribution analysis

### 4. Topic Mastery Analysis

**Components:**
- Topic mastery gauge (beginner/intermediate/advanced)
- Most mastered topics
- Topics needing review
- Suggested topics to focus on next

**Data Required:**
- Question performance by topic
- Topic difficulty ratings
- Study frequency per topic

**Algorithms:**
- Mastery calculation based on performance, repetition, and recency
- Spaced repetition algorithm for review recommendations
- Knowledge decay model for retention prediction

### 5. Exam Readiness Index

**Components:**
- Overall readiness score
- Subject-wise readiness
- Predicted performance range
- Weakest areas requiring attention

**Data Required:**
- Performance across different question types and difficulties
- Coverage of exam syllabus
- Historical performance trends

**Algorithms:**
- Weighted scoring based on exam importance of topics
- Predictive modeling using performance trends
- Gap analysis between current mastery and required proficiency

### 6. Study Habits Insights

**Components:**
- Optimal study time visualization
- Productivity patterns
- Study session length analysis
- Break frequency recommendations

**Data Required:**
- Study session timestamps and durations
- Performance correlated with time of day/duration

**Algorithms:**
- Time-based performance correlation
- Optimal session length determination
- Productivity scoring based on output/time ratio

## Data Storage Requirements

To support these reports, we need to track:

1. **User Activity Data**
   - Study sessions (start time, end time, topics covered)
   - Daily login/activity timestamps
   - Streak maintenance records

2. **Performance Data**
   - Question attempts with correctness
   - Time spent on each question
   - Review frequency of topics

3. **Progress Data**
   - Completion status of topics/chapters
   - Repetition count for each topic
   - Mastery levels for topics

## Data Tables Needed

Beyond existing tables, consider adding:

1. **user_question_attempts**
   ```sql
   CREATE TABLE user_question_attempts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT REFERENCES users(id),
     question_id UUID REFERENCES questions(id),
     is_correct BOOLEAN,
     time_taken_seconds INTEGER,
     attempt_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
     confidence_level TEXT
   );
   ```

2. **user_study_sessions**
   ```sql
   CREATE TABLE user_study_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT REFERENCES users(id),
     start_time TIMESTAMP WITH TIME ZONE,
     end_time TIMESTAMP WITH TIME ZONE,
     duration_minutes INTEGER,
     topics_covered UUID[] -- Array of topic_ids
   );
   ```

3. **user_topic_mastery**
   ```sql
   CREATE TABLE user_topic_mastery (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT REFERENCES users(id),
     topic_id UUID REFERENCES topics(id),
     mastery_level INTEGER, -- 1-10 scale
     last_practiced TIMESTAMP WITH TIME ZONE,
     repetition_count INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );
   ```

## Implementation Considerations

1. **Caching Strategy**
   - Pre-calculate daily/weekly reports during off-peak hours
   - Cache frequently accessed metrics
   - Use incremental updates for real-time metrics

2. **Data Processing**
   - Use batch processing for historical data analysis
   - Implement real-time updates for critical metrics like streaks
   - Consider using a separate analytics database for complex queries

3. **Visualization Recommendations**
   - Progress: Use progress bars, completion wheels
   - Performance: Use radar charts, line graphs for trends
   - Time-based data: Use heatmaps, calendar views
   - Comparisons: Use bullet charts, percentile indicators

4. **User Personalization**
   - Allow users to customize which metrics they see first
   - Set personal goals and track progress towards them
   - Provide opt-in comparative analytics with peers

## Algorithm Details

### Spaced Repetition Algorithm

For optimal topic review scheduling:

```
review_interval = base_interval * ease_factor ^ (repetition_number - 1)

Where:
- base_interval: Initial review interval (e.g., 1 day)
- ease_factor: Difficulty modifier (typically 1.3-2.5)
- repetition_number: Number of successful reviews
```

### Mastery Calculation

```
mastery_score = (0.4 * accuracy) + (0.3 * recency_factor) + 
                (0.2 * repetition_score) + (0.1 * completion_rate)

Where:
- accuracy: % of correct answers
- recency_factor: Decay function based on time since last practice
- repetition_score: Score based on practice frequency
- completion_rate: % of topic material covered
```

### Readiness Index

```
readiness = Σ(topic_importance * topic_mastery) / Σ(topic_importance)

Where:
- topic_importance: Weightage based on exam frequency
- topic_mastery: Current mastery level (0-1)
```

## Data Aggregation Periods

- Daily metrics: Updated in real-time
- Weekly reports: Generated daily
- Monthly insights: Generated weekly
- Trend analysis: Updated bi-weekly

By implementing these components, the reports screen will provide comprehensive, actionable insights that help users optimize their study approach and track their progress effectively. 