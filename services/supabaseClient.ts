import { createClient } from '@supabase/supabase-js';

// ⚠️ PRODUCTION NOTICE:
// In a real production build, these keys MUST come from environment variables.
// Do not commit hardcoded keys to public GitHub repositories.

// Safe environment variable retrieval (Vite injects import.meta.env in the
// browser, in tests, and at build time; no process.env polyfill is shipped).
const getEnv = (key: string): string => {
  const env = import.meta.env as Record<string, string | undefined>;
  return env?.[key] || '';
};

// Preferred: set VITE_SUPABASE_URL at build time. The fallback points at the
// project's default supabase.co URL (the old e-khmer.com custom domain was
// retired).
export const SUPABASE_URL =
  getEnv('VITE_SUPABASE_URL') || 'https://sjlduyivbwpvgkeiqysr.supabase.co';

// Support both VITE_SUPABASE_PUBLISHABLE_KEY (New Standard) and VITE_SUPABASE_ANON_KEY (Legacy)
const SUPABASE_KEY =
  getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  'sb_publishable_T1vB15fvoAiPpDrlDvO1nA_rvgSpo4u';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    // PKCE returns the OAuth result as a ?code= query param instead of a
    // #access_token hash fragment. The app uses HashRouter, which owns the
    // URL hash for routing; with the implicit (hash) flow the two collide and
    // the session is lost on redirect, bouncing the user back to the landing
    // page. PKCE avoids that collision.
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Bucket name provided by user
export const STORAGE_BUCKET = 'Rean';
