import { createClient } from '@supabase/supabase-js';

// ⚠️ PRODUCTION NOTICE:
// In a real production build, these keys MUST come from environment variables.
// Do not commit hardcoded keys to public GitHub repositories.

// Safe environment variable retrieval
const getEnv = (key: string) => {
  // Check import.meta.env (Vite)
  if ((import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Check process.env (Node/Polyfilled) safely
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors if process is not defined
  }
  return '';
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
