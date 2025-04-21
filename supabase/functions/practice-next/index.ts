import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts"; // Assuming generated types

console.log("Function 'practice-next' initializing...");

// Type definitions (replace with actual generated types if available)
type Question = Database["public"]["Tables"]["questions"]["Row"];
type PracticeSession = Database["public"]["Tables"]["practice_sessions"]["Row"];

// Add type definitions for fetched data
type SRQItem = Database["public"]["Tables"]["dim_spaced_repetition_queue"]["Row"];
type TopicMastery = Database["public"]["Tables"]["dim_topic_mastery"]["Row"];

// --- Core Recommendation Logic Placeholder ---
// This needs significant implementation based on Section 5 of the spec
async function selectNextQuestion(
  supabase: SupabaseClient<Database>,
  userId: string,
  session: PracticeSession,
): Promise<Question> {
  console.log(`Selecting question for session ${session.id}, mode ${session.practice_type}, user ${userId}`);

  const subjectId = session.subject_id;
  const examId = session.exam_id;
  const mode = session.practice_type;
  const BATCH_SIZE = 10; // Micro-batch size from spec

  if (!subjectId || !examId || !mode) {
    throw new Error(`Session is missing required fields: subjectId=${subjectId}, examId=${examId}, mode=${mode}`);
  }

  // --- 1. Fetch Snapshot Data ---
  console.log("Fetching user/session snapshot...");
  const now = new Date();
  const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Recently delivered questions (to avoid immediate repeats)
  const { data: recentDeliveries, error: recentError } = await supabase
      .from('practice_deliveries')
      .select('question_id')
      .eq('session_id', session.id)
      .order('delivered_at', { ascending: false })
      .limit(BATCH_SIZE * 2); // Avoid repeating last ~2 batches

  if (recentError) console.warn("Error fetching recent deliveries:", recentError.message);
  const recentQuestionIds = recentDeliveries?.map(d => d.question_id) ?? [];

  // SRQ items (due now and soon)
  const { data: srqItems, error: srqError } = await supabase
      .from('dim_spaced_repetition_queue')
      .select('*') // Select necessary fields: question_id, scheduled_for, priority_score, priority_boost
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .eq('status', 'pending')
      .lte('scheduled_for', oneDayAhead.toISOString()) // Due now or within 24h
      .order('scheduled_for', { ascending: true })
      .order('priority_score', { ascending: false }); // Prioritize higher scores among due items

  if (srqError) console.warn("Error fetching SRQ items:", srqError.message);
  const dueNowSRQ = srqItems?.filter(item => new Date(item.scheduled_for!) <= now) ?? [];
  const dueSoonSRQ = srqItems?.filter(item => new Date(item.scheduled_for!) > now) ?? [];
  console.log(`SRQ items: ${dueNowSRQ.length} due now, ${dueSoonSRQ.length} due soon.`);

  // Topic Mastery
  const { data: topicMasteryData, error: masteryError } = await supabase
      .from('dim_topic_mastery')
      .select('topic_id, mastery_level') // Need mastery level
      .eq('user_id', userId);
      // TODO: Filter by subject implicitly if topics are linked to subjects?

  if (masteryError) console.warn("Error fetching topic mastery:", masteryError.message);
  const masteryMap = new Map(topicMasteryData?.map(item => [item.topic_id, item.mastery_level]) ?? []);

  // Define mastery thresholds (example)
  const WEAK_THRESHOLD = 0.4;
  const STRONG_THRESHOLD = 0.75;

  const weakTopics = topicMasteryData?.filter(t => t.mastery_level < WEAK_THRESHOLD).map(t => t.topic_id) ?? [];
  const strongTopics = topicMasteryData?.filter(t => t.mastery_level >= STRONG_THRESHOLD).map(t => t.topic_id) ?? [];
  console.log(`Mastery: ${weakTopics.length} weak, ${strongTopics.length} strong topics.`);

  // TODO: Fetch blueprint/exam weights? For simplicity, assume equal weight for now.

  // --- 2. Compute Mix --- (
  console.log(`Computing mix for mode: ${mode}`);
  let mix = { srqDueNow: 0, srqDueSoon: 0, weakNew: 0, eval: 0, hardMastered: 0 };

  switch (mode) {
    case 'recall':
      mix = { srqDueNow: 4, srqDueSoon: 2, weakNew: 0, eval: 3, hardMastered: 0 }; // simplified average mastery -> eval
      break;
    case 'refine':
      mix = { srqDueNow: 3, srqDueSoon: 0, weakNew: 4, eval: 3, hardMastered: 0 }; // simplified SR weak -> srqDueNow
      break;
    case 'conquer':
      mix = { srqDueNow: 2, srqDueSoon: 0, weakNew: 0, eval: 2, hardMastered: 6 }; // simplified SR strong -> srqDueNow
      break;
    default:
        console.warn(`Unknown practice mode: ${mode}. Defaulting to recall mix.`);
        mix = { srqDueNow: 4, srqDueSoon: 2, weakNew: 0, eval: 3, hardMastered: 0 };
  }
   console.log("Computed mix:", mix);

  // --- 3. Pull Candidates --- //
  console.log("Pulling candidate questions...");
  let candidates: Question[] = [];
  const fetchedQuestionIds = new Set<string>(recentQuestionIds);

  // Helper to add candidates and avoid duplicates
  const addCandidates = (newCandidates: Question[] | null | undefined) => {
      if (!newCandidates) return;
      newCandidates.forEach(q => {
          if (!fetchedQuestionIds.has(q.id)) {
              candidates.push(q);
              fetchedQuestionIds.add(q.id);
          }
      });
  };

  // Fetch SRQ Due Now candidates
  if (mix.srqDueNow > 0 && dueNowSRQ.length > 0) {
    const srqQIds = dueNowSRQ.map(item => item.question_id).filter(id => !!id) as string[];
    const { data } = await supabase.from('questions').select('*').in('id', srqQIds);
    addCandidates(data);
    console.log(`Fetched ${data?.length ?? 0} candidates from SRQ Due Now.`);
  }

  // Fetch SRQ Due Soon candidates (if needed for recall)
  if (mode === 'recall' && mix.srqDueSoon > 0 && dueSoonSRQ.length > 0) {
      const srqQIds = dueSoonSRQ.map(item => item.question_id).filter(id => !!id) as string[];
      const { data } = await supabase.from('questions').select('*').in('id', srqQIds);
      addCandidates(data);
      console.log(`Fetched ${data?.length ?? 0} candidates from SRQ Due Soon.`);
  }

  // Fetch Weak-Topic New candidates (for Refine)
  if (mix.weakNew > 0 && weakTopics.length > 0) {
      let query = supabase.from('questions').select('*')
          .eq('subject_id', subjectId)
          .in('topic_id', weakTopics)
          .limit(mix.weakNew * 2); // Fetch more to account for filtering
      if (fetchedQuestionIds.size > 0) {
          query = query.not('id', 'in', `(${Array.from(fetchedQuestionIds).join(',')})`);
      }
      const { data } = await query;
      addCandidates(data);
      console.log(`Fetched ${data?.length ?? 0} candidates from Weak New.`);
  }

  // Fetch Hard Mastered candidates (for Conquer)
  if (mix.hardMastered > 0 && strongTopics.length > 0) {
      let query = supabase.from('questions').select('*')
          .eq('subject_id', subjectId)
          .in('topic_id', strongTopics)
          .in('difficulty', ['Hard', '0.7', '0.8', '0.9', '1.0']) // Example filter for hard
          .limit(mix.hardMastered * 2);
      if (fetchedQuestionIds.size > 0) {
          query = query.not('id', 'in', `(${Array.from(fetchedQuestionIds).join(',')})`);
      }
      const { data } = await query;
      addCandidates(data);
      console.log(`Fetched ${data?.length ?? 0} candidates from Hard Mastered.`);
  }

  // Fetch Evaluation candidates (always needed)
  if (mix.eval > 0) {
      // Simple eval: fetch random unseen questions from the subject
      let query = supabase.from('questions').select('*')
          .eq('subject_id', subjectId)
          // TODO: Add more sophisticated Eval logic (breadth, unseen topics)
          .limit(mix.eval * 3);
        if (fetchedQuestionIds.size > 0) {
          query = query.not('id', 'in', `(${Array.from(fetchedQuestionIds).join(',')})`);
      }
       const { data } = await query;
      addCandidates(data);
       console.log(`Fetched ${data?.length ?? 0} candidates for Evaluation.`);
  }

  // Fallback: If still no candidates, fetch *any* non-recent question from the subject
  if (candidates.length === 0) {
    console.warn("Candidate pool empty after mix-based fetching. Falling back to general subject pool.");
    let query = supabase.from('questions').select('*')
        .eq('subject_id', subjectId)
        .limit(BATCH_SIZE);
    if (recentQuestionIds.length > 0) {
        query = query.not('id', 'in', `(${recentQuestionIds.join(',')})`);
    }
    const { data } = await query;
    addCandidates(data);
  }

  // Final check for candidates
  if (candidates.length === 0) {
    console.error("CRITICAL: No questions found for this subject/exam, even after fallback!");
    // Consider returning a specific error message or a placeholder "no questions available" object
    throw new Error("No available questions could be found for your selection.");
  }
  console.log(`Total unique candidates fetched: ${candidates.length}`);

  // --- 4. Rank & Select --- //
  // Placeholder: Select a random candidate FOR NOW.
  // TODO: Implement proper weighting and selection based on the computed `mix` proportions.
  // This involves:
  //    - Defining the `weightFn` from the spec.
  //    - Applying weights to candidates.
  //    - Selecting *one* question, likely prioritizing SRQ > Weak > Eval > Hard based on the mix.
  //      A simple approach could be: iterate through mix categories, pick a random weighted item from that pool until one is found.
  console.log("Ranking and selecting... (Using random selection for now)");
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const selectedQuestion = candidates[randomIndex];
  console.log(`Selected question ID: ${selectedQuestion.id}`);

  return selectedQuestion;
}

// --- Edge Function --- //
serve(async (req: Request) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Parse request body to get user_id and session_id
    console.log("Parsing request body...");
    const { user_id, session_id } = await req.json();

    if (!user_id || !session_id) {
        console.log("Request body validation failed: Missing user_id or session_id.");
        return new Response(JSON.stringify({ error: "Missing user_id or session_id in request body" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
    console.log(`Request for session ${session_id}, user ${user_id}`);

    console.log("Creating Supabase client (service role)...");
    // Use Service Role Key for backend operations
    const supabaseAdminClient = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    console.log("Supabase admin client created.");

    // 2. Fetch session details and validate using user_id and session_id from body
    console.log(`Fetching session details for ${session_id}...`);
    const { data: session, error: sessionError } = await supabaseAdminClient
      .from('practice_sessions')
      .select('*') // Select all session fields needed by selectNextQuestion
      .eq('id', session_id)
      .eq('user_id', user_id) // Validate against user_id from body
      .eq('status', 'in_progress') // Ensure session is active
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!session) {
        console.log("Session validation failed: Not found, wrong user, or not in progress.");
        // Check if session exists at all for better error message
        const { data: sessionExists } = await supabaseAdminClient.from('practice_sessions').select('id').eq('id', session_id).maybeSingle();
        const errorMsg = sessionExists 
            ? "Invalid session (belongs to different user or not in progress)"
            : "Practice session not found";
        return new Response(JSON.stringify({ error: errorMsg }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404, // Or 403 if forbidden
        });
    }
    console.log("Session details fetched and validated.");

    // 3. Select the next question using the algorithm
    console.log("Selecting next question...");
    // Pass user_id and session object to the selection function
    const nextQuestion = await selectNextQuestion(supabaseAdminClient, user_id, session); 
    console.log(`Selected question: ${nextQuestion.id}`);

    // 4. Log delivery for idempotency
    console.log("Logging practice delivery...");
    const deliveryUUID = crypto.randomUUID(); 
    const { error: deliveryError } = await supabaseAdminClient
        .from('practice_deliveries')
        .insert({
            delivery_uuid: deliveryUUID,
            session_id: session_id, // Use session_id from body
            question_id: nextQuestion.id,
            delivered_at: new Date().toISOString(),
        });
    if (deliveryError) {
        console.error("Error logging delivery:", deliveryError.message);
        throw new Error("Failed to log question delivery.");
    }
    console.log(`Delivery logged with UUID: ${deliveryUUID}`);

    // 5. Calculate current XP and bonus status (simplified)
    // TODO: Needs actual XP calculation
    const xpSoFar = 0; // Placeholder
    const bonusActive = session.bonus_started_at !== null;

    // 6. Prepare and return response
    console.log("Preparing response...");
    const responsePayload = {
      delivery_uuid: deliveryUUID,
      question: nextQuestion,
      xp_so_far: xpSoFar,
      xp_goal: session.xp_goal,
      bonus_active: bonusActive,
      mix_snapshot: {}, // Placeholder
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in practice-next function:", error);
    return new Response(JSON.stringify({ error: error.message || "An internal server error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

console.log("Function 'practice-next' ready to serve requests."); 