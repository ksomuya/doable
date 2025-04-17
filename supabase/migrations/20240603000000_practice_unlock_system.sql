-- Add new tables for practice unlock system

-- Table to track user practice stats
CREATE TABLE IF NOT EXISTS user_practice_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  recall_attempts INT DEFAULT 0,
  refine_attempts INT DEFAULT 0,
  conquer_attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to log practice unlocks
CREATE TABLE IF NOT EXISTS practice_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_type TEXT NOT NULL CHECK (practice_type IN ('recall', 'refine', 'conquer')),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create materialized view for subject unlock status
CREATE MATERIALIZED VIEW IF NOT EXISTS subject_unlock_status AS
SELECT 
  ust.user_id,
  s.id AS subject_id,
  s.name AS subject_name,
  EXISTS (
    SELECT 1 FROM user_studied_topics 
    WHERE user_id = ust.user_id 
    AND chapter_id IN (
      SELECT id FROM chapters WHERE subject_id = s.id
    )
  ) AS is_unlocked
FROM 
  user_studied_topics ust
CROSS JOIN
  subjects s
GROUP BY
  ust.user_id, s.id, s.name;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subject_unlock_user ON subject_unlock_status(user_id);

-- Add RLS policies
ALTER TABLE user_practice_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS for user_practice_stats
CREATE POLICY "user can read/write own stats"
  ON user_practice_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS for practice_unlocks
CREATE POLICY "user can read own unlocks"
  ON practice_unlocks FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to get available subjects for a user
CREATE OR REPLACE FUNCTION get_available_subjects(p_user_id UUID, p_exam_id TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  is_unlocked BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    COALESCE(sus.is_unlocked, FALSE) AS is_unlocked
  FROM 
    subjects s
  LEFT JOIN 
    subject_unlock_status sus ON s.id = sus.subject_id AND sus.user_id = p_user_id
  WHERE
    (p_exam_id = 'JEE' AND s.jee_mains = TRUE) OR
    (p_exam_id = 'NEET' AND s.neet = TRUE);
END;
$$;

-- Create function to increment practice attempts
CREATE OR REPLACE FUNCTION increment_practice_attempt(
  p_user_id UUID,
  p_practice_type TEXT,
  p_increment INT DEFAULT 1
)
RETURNS TABLE (
  recall_attempts INT,
  refine_attempts INT,
  conquer_attempts INT,
  newly_unlocked TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recall_attempts INT;
  v_refine_attempts INT;
  v_conquer_attempts INT;
  v_newly_unlocked TEXT[] := '{}';
  v_unlock_refine BOOLEAN := FALSE;
  v_unlock_conquer BOOLEAN := FALSE;
BEGIN
  -- Insert or update user practice stats
  INSERT INTO user_practice_stats (user_id, recall_attempts, refine_attempts, conquer_attempts)
  VALUES (p_user_id, 
    CASE WHEN p_practice_type = 'recall' THEN p_increment ELSE 0 END,
    CASE WHEN p_practice_type = 'refine' THEN p_increment ELSE 0 END,
    CASE WHEN p_practice_type = 'conquer' THEN p_increment ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    recall_attempts = user_practice_stats.recall_attempts + CASE WHEN p_practice_type = 'recall' THEN p_increment ELSE 0 END,
    refine_attempts = user_practice_stats.refine_attempts + CASE WHEN p_practice_type = 'refine' THEN p_increment ELSE 0 END,
    conquer_attempts = user_practice_stats.conquer_attempts + CASE WHEN p_practice_type = 'conquer' THEN p_increment ELSE 0 END,
    updated_at = NOW()
  RETURNING 
    recall_attempts, refine_attempts, conquer_attempts
  INTO v_recall_attempts, v_refine_attempts, v_conquer_attempts;

  -- Check if Refine should be unlocked (50 recall attempts)
  IF v_recall_attempts >= 50 THEN
    -- Check if we need to create a new unlock record
    SELECT NOT EXISTS (
      SELECT 1 FROM practice_unlocks
      WHERE user_id = p_user_id AND practice_type = 'refine'
    ) INTO v_unlock_refine;
    
    IF v_unlock_refine THEN
      INSERT INTO practice_unlocks (user_id, practice_type)
      VALUES (p_user_id, 'refine');
      
      v_newly_unlocked := array_append(v_newly_unlocked, 'refine');
    END IF;
  END IF;

  -- Check if Conquer should be unlocked (100 recall attempts + 100 refine attempts)
  IF v_recall_attempts >= 100 AND v_refine_attempts >= 100 THEN
    -- Check if we need to create a new unlock record
    SELECT NOT EXISTS (
      SELECT 1 FROM practice_unlocks
      WHERE user_id = p_user_id AND practice_type = 'conquer'
    ) INTO v_unlock_conquer;
    
    IF v_unlock_conquer THEN
      INSERT INTO practice_unlocks (user_id, practice_type)
      VALUES (p_user_id, 'conquer');
      
      v_newly_unlocked := array_append(v_newly_unlocked, 'conquer');
    END IF;
  END IF;

  -- Return the updated counts and any newly unlocked practice types
  RETURN QUERY SELECT 
    v_recall_attempts, 
    v_refine_attempts, 
    v_conquer_attempts,
    v_newly_unlocked;
END;
$$;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_subject_unlock_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY subject_unlock_status;
  RETURN NULL;
END;
$$;

-- Create trigger to refresh the materialized view when user_studied_topics changes
CREATE TRIGGER refresh_subject_unlock_status_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_studied_topics
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_subject_unlock_status(); 