import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default when deployed
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase SERVICE_ROLE KEY - env var exported by default when deployed
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Calculate current ISO week
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)

    // Get users who have been active in the past 30 days
    const { data: activeUsers, error: userError } = await supabaseClient
      .from('evt_daily_logins')
      .select('user_id')
      .gte('login_date', new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('login_date', { ascending: false })
    
    if (userError) {
      throw userError
    }

    // Process unique users
    const uniqueUsers = [...new Set(activeUsers.map(u => u.user_id))]
    console.log(`Processing reports for ${uniqueUsers.length} active users`)
    
    const results = {
      daily: 0,
      weekly: 0,
      readiness: 0
    }

    // Generate daily reports for all active users
    for (const userId of uniqueUsers) {
      // Daily report for yesterday
      await supabaseClient.rpc('fn_rollup_daily', { 
        p_user: userId, 
        p_day: yesterdayStr 
      })
      results.daily++

      // Weekly report (if today is Sunday)
      if (now.getDay() === 0) {
        await supabaseClient.rpc('fn_rollup_weekly', { 
          p_user: userId, 
          p_year: now.getFullYear(), 
          p_week: weekNumber 
        })
        results.weekly++
      }

      // Exam readiness (refresh every 7 days)
      if (now.getDay() === 1) { // Monday
        // Get user's exam type preference
        const { data: prefs } = await supabaseClient
          .from('onboarding_surveys')
          .select('exam_type')
          .eq('user_id', userId)
          .single()
        
        if (prefs?.exam_type) {
          await supabaseClient.rpc('fn_calculate_readiness', { 
            p_user: userId, 
            p_exam_type: prefs.exam_type 
          })
          results.readiness++
        }
      }

      // Queue recommended questions
      await supabaseClient.rpc('fn_queue_recommended_questions', { 
        p_user: userId, 
        p_limit: 10 
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Reports generated successfully',
        processed: results
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