import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvahhlarlwdndanyojqx.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YWhobGFybHdkbmRhbnlvanF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MTg2MDIsImV4cCI6MjEwMjM5NDYwMn0.vxqxIQOSHmP0Yaqa7gypg4Vi_D8PKOUEjtbBSPx_JEE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
