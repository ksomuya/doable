-- Create users table that syncs with Clerk users
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY, -- Matches Clerk user ID
    email text,
    first_name text,
    last_name text,
    photo_url text,
    date_of_birth date,
    parent_mobile text,
    is_onboarded boolean DEFAULT false,
    is_profile_setup boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security but create a policy that allows all operations
-- This is simpler but less secure. In production, you should restrict access.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" 
ON public.users 
FOR ALL 
USING (true);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on users table
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 