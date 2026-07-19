/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** LOCAL DEV ONLY: direct Gemini fallback key. Never set in production builds. */
  readonly VITE_GEMINI_DEV_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
