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

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows public reads but only authenticated inserts/updates 
CREATE POLICY "Public read access"
ON public.users
FOR SELECT
USING (true);

-- Users can only update their own data
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (id = current_setting('request.jwt.claims')::json->>'sub');

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