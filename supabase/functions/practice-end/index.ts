import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";

console.log("Function 'practice-end' initializing...");

serve(async (req: Request) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  // Require POST method
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Allow": "POST" },
        status: 405,
    });
  }

  try {
    // 1. Parse request body to get user_id and session_id
    console.log("Parsing request body...");
    // Ensure body is parsed even if empty (client sends empty body)
    let user_id: string | null = null;
    let session_id: string | null = null;
    try {
      const body = await req.json();
      user_id = body.user_id;
      session_id = body.session_id;
    } catch (e) {
        // Ignore error if body is empty or not JSON
        console.warn("Could not parse request body (likely empty):", e.message);
    }

    // Validate extracted IDs
    if (!user_id || !session_id) {
        console.log("Request body validation failed: Missing user_id or session_id.");
        return new Response(JSON.stringify({ error: "Missing user_id or session_id in request body" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
    console.log(`Request to end session ${session_id} for user ${user_id}`);

    // 2. Use Service Role Client to update session
    console.log("Creating Supabase client (service role)...");
    const supabaseAdminClient = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    console.log("Supabase admin client created.");

    // 3. Update session status and end time using IDs from body
    console.log(`Attempting to end session ${session_id} for user ${user_id}...`);
    const { data, error } = await supabaseAdminClient
        .from('practice_sessions')
        .update({
            status: 'completed',
            end_time: new Date().toISOString(),
        })
        .eq('id', session_id)
        .eq('user_id', user_id)
        .eq('status', 'in_progress')
        .select('id')
        .single();

    if (error) {
        // Handle potential errors
        if (error.code === 'PGRST116') { // Matching row not found
             console.log(`Session ${session_id} not found, already ended, or user mismatch.`);
             // Check if session exists at all
             const { data: sessionExists } = await supabaseAdminClient.from('practice_sessions').select('id').eq('id', session_id).maybeSingle();
             const errorMsg = sessionExists 
                 ? "Session already ended or belongs to another user"
                 : "Session not found";
             return new Response(JSON.stringify({ message: errorMsg }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 404, 
            });
        }
        console.error("Error updating session:", error.message);
        throw error;
    }

    if (!data) {
        console.warn(`Session ${session_id} status update seemed to succeed but no row returned.`);
         return new Response(JSON.stringify({ message: "Session likely ended, but confirmation failed."}), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, 
        });
    }

    console.log(`Session ${session_id} successfully ended.`);

    // 4. Return success response
    return new Response(JSON.stringify({ success: true, message: "Practice session ended." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in practice-end function:", error.message);
    return new Response(JSON.stringify({ error: error.message || "An internal server error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

console.log("Function 'practice-end' ready to serve requests."); 