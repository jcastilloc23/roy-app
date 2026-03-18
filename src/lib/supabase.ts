import { createClient } from "@supabase/supabase-js";

// Browser / client-side client — uses anon key, respects RLS
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

// Server-side client — uses service role key, bypasses RLS
// Only import this in API routes and server actions, never in client components
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );
}
