// Import Supabase client and server setup
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Extract user data from the request
    const { user } = await req.json();
    
    if (!user || !user.id) {
      return new Response(JSON.stringify({ error: 'Invalid user data' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user exists first to preserve onboarding status
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, is_onboarded, is_profile_setup')
      .eq('id', user.id)
      .maybeSingle();

    // Format user data for Supabase
    const userData = {
      id: user.id,
      email: user.email || user.primaryEmailAddress?.emailAddress,
      first_name: user.firstName,
      last_name: user.lastName,
      photo_url: user.imageUrl,
      updated_at: new Date().toISOString(),
    };

    if (existingUser) {
      // Update user preserving onboarding status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          ...userData,
          is_onboarded: existingUser.is_onboarded,
          is_profile_setup: existingUser.is_profile_setup
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
    } else {
      // Insert new user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          ...userData,
          is_onboarded: false,
          is_profile_setup: false,
          created_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
    }

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // If no profile exists, create one (even though we have a trigger, this is a backup)
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          xp: 0,
          level: 1,
          streak: 0,
          streak_goal: 0,
          notifications_enabled: true,
          rank: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw profileError;
      }
      
      // Also create user_streaks entry
      const { error: streakError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (streakError) {
        throw streakError;
      }
      
      // Create study preferences with defaults
      const { error: prefError } = await supabase
        .from('study_preferences')
        .insert({
          user_id: user.id,
          daily_questions_goal: 20,
          weekly_topics_goal: 3,
          streak_goal: 7,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (prefError) {
        throw prefError;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User data and profile synced successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error syncing user profile:', err);

    return new Response(JSON.stringify({ 
      error: err.message || 'Failed to sync user profile' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 