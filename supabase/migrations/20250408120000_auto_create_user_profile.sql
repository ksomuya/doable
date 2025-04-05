-- Create a function that will be triggered when a new user is inserted
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile record for the new user with default values
  INSERT INTO public.user_profiles (
    user_id, 
    xp, 
    level, 
    streak, 
    streak_goal,
    notifications_enabled,
    rank,
    created_at
  ) VALUES (
    NEW.id::text,  -- Cast UUID to text
    0,       -- Default XP
    1,       -- Start at level 1
    0,       -- Default streak
    0,       -- Default streak goal
    true,    -- Notifications enabled by default
    0,       -- Default rank
    NOW()    -- Current timestamp
  );
  
  -- Also create an entry in user_streaks table
  INSERT INTO public.user_streaks (
    user_id,
    current_streak,
    longest_streak,
    last_active_date,
    updated_at
  ) VALUES (
    NEW.id::text,  -- Cast UUID to text
    0,       -- Default current streak
    0,       -- Default longest streak
    NULL,    -- Last active date is NULL initially
    NOW()    -- Current timestamp  
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires the function after a new user is inserted
DROP TRIGGER IF EXISTS create_profile_after_user_insert ON public.users;

CREATE TRIGGER create_profile_after_user_insert
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.create_user_profile();

-- Add a comment to explain what this trigger does
COMMENT ON TRIGGER create_profile_after_user_insert ON public.users IS 
'Automatically creates a user profile with default values when a new user is inserted'; 