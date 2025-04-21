import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";

console.log("Function 'practice-answer' initializing...");

type PracticeDelivery = Database["public"]["Tables"]["practice_deliveries"]["Row"];
type Question = Database["public"]["Tables"]["questions"]["Row"];

// Helper to safely parse difficulty string to number (0-1)
function parseDifficulty(difficulty: string | null): number {
    if (!difficulty) return 0.5; // Default to medium if missing
    switch (difficulty.toLowerCase()) {
        case 'easy': return 0.2;
        case 'medium': return 0.5;
        case 'hard': return 0.8;
        case 'conceptual': return 0.4; // Example mapping for conceptual
        default:
            const numericVal = parseFloat(difficulty);
            if (!isNaN(numericVal) && numericVal >= 0 && numericVal <= 1) {
                return numericVal;
            }
            return 0.5; // Default if unparseable
    }
}

serve(async (req: Request) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Parse request body to get user_id, session_id, delivery_uuid, etc.
    console.log("Parsing request body...");
    const body = await req.json();
    console.log("Request body:", body);
    const { user_id, session_id, delivery_uuid, answer, time_taken_seconds, confidence_level } = body;

    // Validate required fields from body
    if (!user_id || !session_id || !delivery_uuid || answer === undefined || answer === null || typeof time_taken_seconds !== 'number') {
        console.log("Validation failed: Missing required fields in body.");
        return new Response(JSON.stringify({
            error: "Missing required fields: user_id, session_id, delivery_uuid, answer, time_taken_seconds"
         }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
    console.log(`Required fields present for user ${user_id}, session ${session_id}, delivery ${delivery_uuid}.`);

    // 2. Use Service Role Client for backend operations
    console.log("Creating Supabase client (service role)...");
    const supabaseAdminClient = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    console.log("Supabase admin client created.");

    // 3. Fetch delivery record and associated question/session data
    console.log(`Fetching delivery record ${delivery_uuid}...`);
    const { data: deliveryData, error: deliveryError } = await supabaseAdminClient
        .from('practice_deliveries')
        .select(`
            *,
            practice_sessions ( id, user_id, status ),
            questions ( id, correct_answer, difficulty, subject_id, chapter_id, topic_id, subtopic_id )
        `)
        .eq('delivery_uuid', delivery_uuid)
        .maybeSingle();

    if (deliveryError) throw deliveryError;
    if (!deliveryData || !deliveryData.practice_sessions || !deliveryData.questions) {
        console.log("Validation failed: Delivery UUID not found or related data missing.");
        return new Response(JSON.stringify({ error: "Invalid delivery UUID" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
        });
    }
    console.log("Delivery record fetched.");

    // 4. Validate ownership and session status using IDs from BODY
    if (deliveryData.practice_sessions.user_id !== user_id || deliveryData.practice_sessions.id !== session_id) {
        console.log(`Authorization failed: Delivery record user/session (${deliveryData.practice_sessions.user_id}/${deliveryData.practice_sessions.id}) mismatch with request body (${user_id}/${session_id}).`);
        return new Response(JSON.stringify({ error: "Unauthorized access to delivery record (ID mismatch)" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403, // Forbidden
        });
    }
    if (deliveryData.practice_sessions.status !== 'in_progress') {
         console.log("Validation failed: Session is not in progress.");
         return new Response(JSON.stringify({ error: "Practice session is not active" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400, // Bad request - session ended
        });
    }
    console.log("Ownership and session status validated.");

    // Check if already answered
    const { data: existingAttempt, error: existingAttemptError } = await supabaseAdminClient
      .from('evt_question_attempts')
      .select('id')
      .eq('user_id', user_id) // Use user_id from body
      .eq('question_id', deliveryData.question_id)
      .eq('session_id', session_id) // Add session_id check
      // .eq('attempt_source', `practice:${session_id}`) // Keep source if used
      .limit(1)
      .maybeSingle();

    if(existingAttemptError) console.warn("Warning checking existing attempt:", existingAttemptError.message);
    if(existingAttempt) {
        console.log("Attempt rejected: Question already answered in this session.");
        return new Response(JSON.stringify({ message: "Question already answered in this session.", is_correct: null, xp_awarded: 0, success: false }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 409, // Conflict
        });
    }

    // 5. Determine correctness
    const question = deliveryData.questions;
    const isCorrect = JSON.stringify(answer) === JSON.stringify(question.correct_answer);
    console.log(`Answer correctness: ${isCorrect}`);

    // 6. Insert into evt_question_attempts
    console.log("Inserting question attempt event...");
    const attemptInsertData = {
        user_id: user_id, // Use user_id from body
        question_id: question.id,
        session_id: session_id, // Use session_id from body
        is_correct: isCorrect,
        time_taken_seconds: time_taken_seconds,
        confidence_level: confidence_level,
        subject_id: question.subject_id,
        chapter_id: question.chapter_id,
        topic_id: question.topic_id,
        subtopic_id: question.subtopic_id,
        attempt_source: `practice:${session_id}`,
        completed_at: new Date().toISOString(),
    };

    const { data: attemptData, error: attemptError } = await supabaseAdminClient
      .from('evt_question_attempts')
      .insert(attemptInsertData)
      .select('xp_awarded')
      .single();

    if (attemptError) {
        console.error("Error inserting attempt:", attemptError.message);
        throw new Error("Failed to record question attempt.");
    }
    console.log("Attempt event inserted.");

    const xpAwarded = attemptData?.xp_awarded ?? 0;

    // 7. Return success response
    return new Response(JSON.stringify({ success: true, is_correct: isCorrect, xp_awarded: xpAwarded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in practice-answer function:", error);
    return new Response(JSON.stringify({ error: error.message || "An internal server error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

console.log("Function 'practice-answer' ready to serve requests."); 