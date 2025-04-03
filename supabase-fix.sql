-- Check if users table exists and create if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        -- Create users table
        CREATE TABLE public.users (
            id text PRIMARY KEY,
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
        
        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Drop policy if exists and create new one
DROP POLICY IF EXISTS "Allow all operations" ON public.users;
CREATE POLICY "Allow all operations" 
ON public.users 
FOR ALL 
USING (true);

-- Create function if not exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger exists and create if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'set_users_updated_at' 
        AND tgrelid = 'public.users'::regclass
    ) THEN
        CREATE TRIGGER set_users_updated_at
        BEFORE UPDATE ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION public.set_updated_at();
    END IF;
END
$$; 