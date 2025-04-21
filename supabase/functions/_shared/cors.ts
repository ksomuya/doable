export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // TODO: Restrict in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ps-token",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE", // Added PUT, DELETE just in case, can refine later
}; 