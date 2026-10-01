// Public Supabase configuration shared by server and browser clients.
// Vercel variables remain the preferred source; the anon key is public by design and is RLS-protected.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cwbenhuiextfoiyfboxo.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ejzonFzRvs2cILpTRUoNEA_3dcdbtb-";
