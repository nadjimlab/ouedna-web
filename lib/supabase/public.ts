import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Anonymous Supabase client for Server Components that read public data.
 *
 * Public landmark data must remain fresh after an admin publishes or edits a
 * place. Positive values use Next's data cache; zero disables it completely.
 */
export function createPublicClient(revalidate = 300) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const cacheOptions = revalidate > 0
          ? { next: { revalidate, tags: ["supabase"] } }
          : { cache: "no-store" as const };
        return fetch(input, { ...init, ...cacheOptions } as RequestInit);
      },
    },
  });
}
