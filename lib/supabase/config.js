// Public Supabase configuration shared by server and browser clients.
// Never commit project URLs or API keys as fallbacks: configure them in the
// deployment environment (the publishable/anon key is still RLS-protected).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || "";
