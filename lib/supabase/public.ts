import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Anonymous Supabase client for Server Components that read PUBLIC data.
 *
 * The root layout reads a language cookie, which makes every page dynamic, so
 * route-level ISR is not available. Instead each Supabase REST call goes
 * through Next's data cache: identical queries are served from cache for
 * `revalidate` seconds, which removes most database traffic on busy pages.
 * Call `revalidateTag("supabase")` (e.g. from an admin route) to purge it.
 */
export function createPublicClient(revalidate = 300) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate, tags: ["supabase"] } } as RequestInit),
    },
  });
}
