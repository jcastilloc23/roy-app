import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser / client-side client — uses anon key, respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client — uses service role key, bypasses RLS
// Only import this in API routes and server actions, never in client components
export function supabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
