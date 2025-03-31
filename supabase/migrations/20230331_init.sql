-- Create a basic todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow users to see their own todos
CREATE POLICY "Users can only see their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to only allow users to insert their own todos
CREATE POLICY "Users can only insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to only allow users to update their own todos
CREATE POLICY "Users can only update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to only allow users to delete their own todos
CREATE POLICY "Users can only delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id); 