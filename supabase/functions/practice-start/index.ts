import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Function 'practice-start' initializing...");

serve(async (req: Request) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client using SERVICE ROLE KEY for direct access
    console.log("Creating Supabase client (service role)...");
    const supabaseAdminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // USE SERVICE ROLE
    );
    console.log("Supabase admin client created.");

    console.log("Parsing request body...");
    const body = await req.json();
    console.log("Request body:", body);
    // Extract userId from body
    const { user_id, exam_id, subject_id, mode, xp_goal } = body; 

    // Validate required fields, including user_id
    if (!user_id || !exam_id || !subject_id || !mode || !xp_goal) {
       console.log("Validation failed: Missing required fields.");
      return new Response(JSON.stringify({ error: "Missing required fields: user_id, exam_id, subject_id, mode, xp_goal" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
     // TODO: Add validation for user_id format if needed (e.g., is it Clerk format?)
    console.log(`Required fields present for user: ${user_id}`);

    // Basic validation (can be expanded)
    if (typeof xp_goal !== 'number' || xp_goal <= 0) {
        console.log("Validation failed: Invalid xp_goal.");
        return new Response(JSON.stringify({ error: "Invalid xp_goal. Must be a positive number." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
    // TODO: Add validation for exam_id, subject_id (check existence in DB?), mode (enum check?)

    console.log("Inserting new practice session...");
    // Use admin client and pass user_id from body
    const { data: sessionData, error: sessionError } = await supabaseAdminClient 
      .from("practice_sessions")
      .insert({
        user_id: user_id, // Use user_id from request body
        exam_id: exam_id, 
        subject_id: subject_id,
        practice_type: mode,
        xp_goal: xp_goal,
        start_time: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sessionError) {
        console.error("Error inserting session:", sessionError.message);
        // Potentially check for specific errors like foreign key violation if user_id is wrong
        if (sessionError.code === '23503') { // Foreign key violation
           return new Response(JSON.stringify({ error: "Invalid user_id provided." }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
        }
        throw sessionError; // Let the generic error handler catch others
    }
    if (!sessionData) {
        console.error("Session insertion failed: No data returned.");
        throw new Error("Failed to create session.");
    }
    console.log(`Practice session created: ${sessionData.id}`);

    const sessionId = sessionData.id;

    // Return only the session_id
    return new Response(JSON.stringify({ session_id: sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201, // Created
    });

  } catch (error) {
    console.error("Error in practice-start function:", error);
    return new Response(JSON.stringify({ error: error.message || "An internal server error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

console.log("Function 'practice-start' ready to serve requests."); 