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

// Updated to custom domain
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://apirean.e-khmer.com';

// Support both VITE_SUPABASE_PUBLISHABLE_KEY (New Standard) and VITE_SUPABASE_ANON_KEY (Legacy)
const SUPABASE_KEY =
  getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  'sb_publishable_fbkyJlwt7bcGtiVexvq39w_m6n4_Vxf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Bucket name provided by user
export const STORAGE_BUCKET = 'Rean';
