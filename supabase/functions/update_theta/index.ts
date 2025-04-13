import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Edge Function to update a user's theta score based on their performance on a question
 * 
 * This implements a simplified IRT (Item Response Theory) model to adaptively 
 * estimate a student's ability level
 */
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { userId, questionId, isCorrect, timeTaken } = await req.json()
    
    if (!userId || !questionId) {
      throw new Error('Missing required parameters: userId and questionId')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get the current theta value for the user (if it exists)
    let { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('id, theta')
      .eq('user_id', userId)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') { // Not "no rows returned" error
      throw profileError
    }

    // 2. Get question parameters (difficulty, discrimination)
    const { data: question, error: questionError } = await supabaseClient
      .from('questions')
      .select('id, topic_id, subtopic_id, difficulty')
      .eq('id', questionId)
      .single()
    
    if (questionError) {
      throw questionError
    }

    // 3. Map question difficulty to IRT parameters
    // We use a simplified model where:
    // - a (discrimination) is fixed at 1.0 for now (could be customized per question)
    // - b (difficulty) is mapped from our difficulty levels
    // - c (guessing parameter) is 0.25 for multiple choice, 0 for others
    let a = 1.0 // discrimination
    let b = 0.0 // difficulty
    let c = 0.25 // guessing parameter (for multiple choice)
    
    switch(question.difficulty) {
      case 'Easy':
        b = -1.0
        break
      case 'Medium':
        b = 0.0
        break
      case 'Hard':
        b = 1.0
        break
      case 'Conceptual':
        b = 0.5
        c = 0.0 // No guessing for conceptual questions
        break
    }

    // 4. Initialize theta if user doesn't have one
    let theta = userProfile?.theta ?? 0.0
    
    // 5. Probability of correct answer given theta (IRT 3PL model)
    const probability = (theta) => {
      return c + (1 - c) / (1 + Math.exp(-1.7 * a * (theta - b)))
    }
    
    // 6. Update theta using a simple gradient approach
    // If correct, increase theta. If wrong, decrease theta.
    // The amount of change depends on how surprising the result was.
    const learningRate = 0.1
    const error = isCorrect ? 1 - probability(theta) : 0 - probability(theta)
    const newTheta = theta + learningRate * error

    // 7. Calculate theta before and after for analytics
    const thetaBefore = theta
    const thetaAfter = newTheta
    
    // 8. Update user's theta value
    if (!userProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: insertError } = await supabaseClient
        .from('user_profiles')
        .insert({
          user_id: userId,
          theta: newTheta,
          xp: isCorrect ? 10 : 1, // Give XP for attempting
          level: 1
        })
        .single()
      
      if (insertError) {
        throw insertError
      }
    } else {
      // Update existing profile
      const { error: updateError } = await supabaseClient
        .from('user_profiles')
        .update({
          theta: newTheta,
          xp: userProfile.xp + (isCorrect ? 10 : 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id)
      
      if (updateError) {
        throw updateError
      }
    }
    
    // 9. Record the question attempt with theta values
    const { error: attemptError } = await supabaseClient
      .from('evt_question_attempts')
      .insert({
        user_id: userId,
        question_id: questionId,
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
        topic_id: question.topic_id,
        subtopic_id: question.subtopic_id,
        cat_theta_before: thetaBefore,
        cat_theta_after: thetaAfter,
        completed_at: new Date().toISOString()
      })
    
    if (attemptError) {
      throw attemptError
    }

    return new Response(
      JSON.stringify({
        success: true,
        thetaBefore,
        thetaAfter,
        deltaPct: Math.round((newTheta - theta) * 100)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
}) 