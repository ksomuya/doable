import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

// Define the expected structure for options
type StandardOption = { id: string; text: string };

// --- Configuration ---
const BATCH_SIZE = 1000; // Process 1000 questions at a time
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// ---------------------

// Load environment variables from .env file (or system env)
// Wrap top-level await in an async IIFE for broader compatibility
(async () => {
  let dotEnvPath = ".env"; // Look in CWD by default
  console.log(`Attempting to load environment variables from: ${dotEnvPath}`);
  try {
    // Load configuration from the specified path
    const loadedConfig = await config({ export: true, path: dotEnvPath }); 
    // console.log("dotenv config loaded successfully:", Object.keys(loadedConfig));
  } catch (err: any) {
      console.warn(`WARN: Could not load .env file at ${dotEnvPath}: ${err.message}. Relying on system environment variables.`);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
    console.error(`SUPABASE_URL found: ${!!SUPABASE_URL}`);
    console.error(`SUPABASE_SERVICE_ROLE_KEY found: ${!!SUPABASE_SERVICE_ROLE_KEY}`);
    Deno.exit(1);
  }

  console.log("Initializing Supabase client with Service Role Key...");
  const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log("Supabase client initialized.");

  await processAllQuestionsInBatches(supabase);
})();


async function processAllQuestionsInBatches(supabase: SupabaseClient) {
    let offset = 0;
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    let totalSkipped = 0;
    let hasMore = true;

    console.log(`Starting question standardization process in batches of ${BATCH_SIZE}...`);

    while(hasMore) {
        console.log(`Fetching batch starting at offset ${offset}...`);
        const { data: questions, error: fetchError } = await supabase
            .from('questions')
            .select('id, options, correct_answer')
            .range(offset, offset + BATCH_SIZE - 1);

        if (fetchError) {
            console.error(`Error fetching batch at offset ${offset}:`, fetchError);
            // Decide whether to stop or try next batch
            console.error("Stopping due to fetch error.");
            hasMore = false; 
            break; 
        }

        if (!questions || questions.length === 0) {
            console.log("No more questions found.");
            hasMore = false;
            break;
        }

        console.log(`Processing batch of ${questions.length} questions (Offset: ${offset})...`);
        const { updatedCount, errorCount, skippedCount } = await standardizeQuestionBatch_SequentialUpdates(supabase, questions);
        
        totalUpdated += updatedCount;
        totalErrors += errorCount;
        totalSkipped += skippedCount;
        totalProcessed += questions.length;

        if (questions.length < BATCH_SIZE) {
            console.log("Last batch processed.");
            hasMore = false;
        } else {
            offset += BATCH_SIZE;
        }
        console.log(`Batch complete. Current Totals -> Processed: ${totalProcessed}, Updated: ${totalUpdated}, Errors: ${totalErrors}, Skipped: ${totalSkipped}`);
        // Optional delay between batches
        // await new Promise(resolve => setTimeout(resolve, 500)); 
    }

    console.log("\n--- Overall Standardization Complete ---");
    console.log(`Total Questions Processed: ${totalProcessed}`);
    console.log(`Successfully Updated: ${totalUpdated}`);
    console.log(`Errors / Not Updated: ${totalErrors}`);
    console.log(`Skipped (Invalid initial data): ${totalSkipped}`);
    if (totalErrors > 0) {
        console.log("\nRECOMMENDATION: Review the logged errors above for questions that could not be fully standardized, especially 'COULD NOT STANDARDIZE correct answer' messages.");
    }
}


// Renamed original function and modified it to return processing results
async function processQuestionLogic(question: any): Promise<{ status: string; updatePayload?: any; originalCorrectAnswer?: any; standardizedOptions?: StandardOption[] }> {
    let needsUpdate = false;
    let standardizedOptions: StandardOption[] | null = null;
    let standardizedCorrectAnswerId: string | null = null;
    let originalOptions = question.options;
    let originalCorrectAnswer = question.correct_answer;
    const qidLogPrefix = `[QID: ${question.id}]`;

    try {
        // --- 1. Validate and Parse Original Options --- 
        if (!originalOptions) return { status: 'skipped' };
        let parsedOptionsSource: any = originalOptions;
        if (typeof originalOptions === 'string') {
            try { parsedOptionsSource = JSON.parse(originalOptions); } 
            catch (e: any) { console.error(`${qidLogPrefix} Failed to parse options JSON: ${e.message}`); return { status: 'error' }; }
        }
        if (!Array.isArray(parsedOptionsSource)) return { status: 'skipped' };
        const parsedOptions: any[] = parsedOptionsSource;
        if (parsedOptions.length === 0) return { status: 'skipped' };

        // --- 2. Standardize Options Format --- 
        const firstOption = parsedOptions[0];
        if (typeof firstOption === 'string') {
            standardizedOptions = parsedOptions.map((text, i) => ({ id: alphabet[i]||`${i}`, text: String(text) }));
            needsUpdate = true; 
        } else if (typeof firstOption === 'object' && firstOption !== null && 'label' in firstOption) {
            standardizedOptions = parsedOptions.map((opt, i) => ({ id: alphabet[i]||`${i}`, text: String(opt.text) }));
            needsUpdate = true; 
        } else if (typeof firstOption === 'object' && firstOption !== null && 'id' in firstOption) {
            const currentOptions = parsedOptions as StandardOption[];
            const needsIdUpdate = currentOptions.some((opt, i) => opt.id !== (alphabet[i]||`${i}`));
            if (needsIdUpdate) {
                standardizedOptions = currentOptions.map((opt, i) => ({ id: alphabet[i]||`${i}`, text: opt.text }));
                needsUpdate = true; 
            } else {
                standardizedOptions = currentOptions; 
            }
        } else {
             console.warn(`${qidLogPrefix} Skipping - Unknown options format.`); return { status: 'skipped' };
        }

        // --- 3. Standardize Correct Answer --- 
        if (!standardizedOptions) { console.error(`${qidLogPrefix} Internal Error`); return { status: 'error' }; }
        if (originalCorrectAnswer === null || originalCorrectAnswer === undefined || String(originalCorrectAnswer).trim() === "") {
            standardizedCorrectAnswerId = null; // Mark as null if missing/empty
        } else {
            let correctAnswerToMatch = String(originalCorrectAnswer);
            if (correctAnswerToMatch.startsWith('[') && correctAnswerToMatch.endsWith(']')) { 
                try { 
                    const pa = JSON.parse(correctAnswerToMatch); 
                    if (Array.isArray(pa) && pa.length === 1 && typeof pa[0] === 'string') correctAnswerToMatch = pa[0];
                } catch (e:any) { /* Ignore parse error, use original */ } 
            }
            const trimmedCorrectAnswer = correctAnswerToMatch.trim();
            const isAlreadyValidId = standardizedOptions.some(opt => opt.id === trimmedCorrectAnswer);
            if (isAlreadyValidId) {
                standardizedCorrectAnswerId = trimmedCorrectAnswer;
                if (originalCorrectAnswer !== standardizedCorrectAnswerId) needsUpdate = true;
            } else {
                let found = false;
                let potentialMatchId : string | null = null;
                let matchType = 'none';
                
                for (let i = 0; i < standardizedOptions.length; i++) {
                    // Priority 2: Exact Text Match
                    if (trimmedCorrectAnswer === standardizedOptions[i].text.trim()) {
                        potentialMatchId = standardizedOptions[i].id; found = true; matchType='text'; break;
                    }
                    // Priority 3: Index Match
                    if (trimmedCorrectAnswer === String(i)) {
                         potentialMatchId = standardizedOptions[i].id; found = true; matchType='index'; break;
                    }
                     // Priority 4: Label Match (original data)
                    if (parsedOptions[i]?.label && trimmedCorrectAnswer === String(parsedOptions[i].label).trim()) {
                         potentialMatchId = standardizedOptions[i].id; found = true; matchType='label'; break;
                    }
                }
                // Priority 5: Substring Match (Cautious)
                 if (!found) {
                     const textSubMatches = standardizedOptions.filter(opt => trimmedCorrectAnswer.includes(opt.text.trim()));
                     const optSubMatches = standardizedOptions.filter(opt => opt.text.trim().includes(trimmedCorrectAnswer));
                     if (textSubMatches.length === 1 && optSubMatches.length === 0) { // Only if answer contains option, not other way
                         potentialMatchId = textSubMatches[0].id; found = true; matchType='substr_answer_contains_option';
                         console.log(`${qidLogPrefix} Standardized answer via unique answer-contains-option substring match to ID ${potentialMatchId}`);
                     } else if (optSubMatches.length === 1 && textSubMatches.length === 0) {
                         potentialMatchId = optSubMatches[0].id; found = true; matchType='substr_option_contains_answer';
                         console.log(`${qidLogPrefix} Standardized answer via unique option-contains-answer substring match to ID ${potentialMatchId}`);
                     } else if (textSubMatches.length > 0 || optSubMatches.length > 0) {
                          console.warn(`${qidLogPrefix} Ambiguous substring match for correct answer. Original: '${originalCorrectAnswer}'`);
                     }
                 }

                if (found && potentialMatchId) {
                    standardizedCorrectAnswerId = potentialMatchId;
                    needsUpdate = true; 
                } else {
                    standardizedCorrectAnswerId = null; // Failed to standardize
                    // Don't mark needsUpdate=true just for this, but log failure
                    console.error(`${qidLogPrefix} COULD NOT STANDARDIZE correct answer. Original: '${originalCorrectAnswer}', Standardized Options: ${JSON.stringify(standardizedOptions)}`);
                    return { status: 'error', originalCorrectAnswer: originalCorrectAnswer, standardizedOptions: standardizedOptions }; 
                }
            }
        }
        
        // --- 4. Determine Update Payload --- 
        if (needsUpdate && standardizedOptions) {
             const updatePayload: any = { options: standardizedOptions };
             if (standardizedCorrectAnswerId !== null) {
                 updatePayload.correct_answer = standardizedCorrectAnswerId;
             } else if (standardizedCorrectAnswerId === null && originalCorrectAnswer !== null && originalCorrectAnswer !== undefined && String(originalCorrectAnswer).trim() !== ""){
                 // We only log error if original answer was present but failed standardization
                 console.warn(`${qidLogPrefix} Options standardized, but correct answer failed standardization. Correct answer will NOT be updated.`);
                 // Still return status 'update_options_only', error was logged above
                 return { status: 'update_options_only', updatePayload: { options: standardizedOptions } };
             }
             return { status: 'needs_update', updatePayload: updatePayload };
         } else {
             return { status: 'no_change' };
         }

    } catch (e: any) {
        console.error(`${qidLogPrefix} UNEXPECTED ERROR processing question: ${e.message || e}`);
        return { status: 'error' };
    }
}

// New function for sequential updates within a batch
async function standardizeQuestionBatch_SequentialUpdates(supabase: SupabaseClient, questions: any[]) {
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const question of questions) {
        const result = await processQuestionLogic(question);
        const qidLogPrefix = `[QID: ${question.id}]`;

        if (result.status === 'skipped') {
            skippedCount++;
            continue;
        }
        if (result.status === 'error') {
            errorCount++;
            continue;
        }
        if (result.status === 'no_change') {
            continue;
        }

        // Perform update if needed ('needs_update' or 'update_options_only')
        if (result.updatePayload) {
            // console.log(`${qidLogPrefix} Updating... Payload: ${JSON.stringify(result.updatePayload)}`);
            const { error: updateError } = await supabase
                .from('questions')
                .update(result.updatePayload)
                .eq('id', question.id);

            if (updateError) {
                console.error(`${qidLogPrefix} Error updating question:`, updateError);
                errorCount++; 
            } else {
                updatedCount++;
                // If only options were updated due to answer error, still count error
                if (result.status === 'update_options_only') {
                    errorCount++; 
                }
            }
        }
    }

    return { updatedCount, errorCount, skippedCount };
} 