/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(() => {
  // SECURITY: never `define` API keys into the client bundle. The Gemini key
  // lives only in Supabase Edge Function secrets. Local development can use
  // VITE_GEMINI_DEV_KEY (read via import.meta.env, DEV-guarded in code).
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve((process as any).cwd(), './'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
