-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  snowballs integer DEFAULT 0,
  streak integer DEFAULT 0,
  streak_goal integer DEFAULT 0,
  notifications_enabled boolean DEFAULT true,
  rank integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_active_date date,
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Add RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profiles"
ON public.user_profiles
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profiles"
ON public.user_profiles
FOR UPDATE
USING (auth.uid()::text = user_id);

-- RLS for user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
ON public.user_streaks
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.user_streaks
FOR UPDATE
USING (auth.uid()::text = user_id); 