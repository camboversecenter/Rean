import { createClient } from '@supabase/supabase-js';

// Connection details come from the environment only. Nothing is hardcoded, so
// a clone of this repository never talks to somebody else's Supabase project
// by accident — you must point it at your own (see .env.example).

// Safe environment variable retrieval (Vite injects import.meta.env in the
// browser, in tests, and at build time; no process.env polyfill is shipped).
const getEnv = (key: string): string => {
  const env = import.meta.env as Record<string, string | undefined>;
  return env?.[key] || '';
};

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');

// Support both VITE_SUPABASE_PUBLISHABLE_KEY (New Standard) and VITE_SUPABASE_ANON_KEY (Legacy)
const SUPABASE_KEY = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Fail loudly and early: an unconfigured client otherwise surfaces later as
  // a wall of confusing "Failed to fetch" errors on every screen.
  throw new Error(
    'Supabase is not configured. Copy .env.example to .env and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see README "Setup Instructions").'
  );
}

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
