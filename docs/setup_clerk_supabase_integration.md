# Setting up Clerk-Supabase Integration

To properly integrate Clerk authentication with Supabase Row Level Security (RLS), follow these steps:

## 1. Create a JWT Template in Clerk

1. Go to your Clerk Dashboard
2. Navigate to JWT Templates
3. Create a new JWT Template called "supabase"
4. Configure the claims as follows:

```json
{
  "sub": "{{user.id}}",
  "aud": "authenticated",
  "role": "authenticated",
  "exp": "{{exp}}",
  "iat": "{{iat}}"
}
```

5. Save the template

## 2. Configure Supabase to Verify Clerk JWTs

1. Go to your Supabase Dashboard
2. Navigate to Settings > Authentication > JWT Settings
3. Enter the JWT Secret from Clerk (your Clerk JWT verification key)
4. Set the JWT algorithms to `HS256` or match what Clerk is using

## 3. Test the Integration

Use the following code to verify the integration is working:

```typescript
const token = await getToken({ template: "supabase" });
console.log("JWT Token:", token);

// Log in to Supabase with the token
const { data, error } = await supabase.auth.signInWithJWT({
  token,
});
console.log("Supabase Auth Result:", data, error);

// Try a request with RLS to verify it works
const { data: testData, error: testError } = await supabase
  .from('some_protected_table')
  .select('*')
  .limit(1);
console.log("RLS Test Result:", testData, testError);
```

## 4. Fix Current RLS Policy Issues

### Option 1: Set Up RLS Policies Correctly

Ensure your RLS policies are correctly checking `auth.uid()` against your Clerk user ID:

```sql
-- Example policy
CREATE POLICY "Users can insert their own survey data" 
ON public.onboarding_surveys 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);
```

### Option 2: Temporary Fix - More Permissive Policies

If you're having trouble getting the integration working, you can temporarily make the policies more permissive:

```sql
-- More permissive policy for testing
CREATE POLICY "Users can insert their own survey data" 
ON public.onboarding_surveys 
FOR INSERT 
WITH CHECK (true);
```

**Note:** This is less secure and should only be used during development/testing.

## 5. Long-term Solution

For a production-ready solution:

1. Ensure Clerk and Supabase are properly integrated with JWT
2. Make sure the `auth.uid()` in Supabase matches the Clerk user ID format
3. Consider adding a custom claim to your JWT that matches exactly the format Supabase expects
4. Use type casting in SQL policies (`auth.uid()::text = user_id::text`) to avoid type mismatch issues

For a robust implementation, refer to the official guides:
- [Clerk Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase External Auth Providers](https://supabase.com/docs/guides/auth/auth-clerk) 