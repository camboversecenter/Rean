import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Declare Deno for environments where types are missing
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This page interpolates database values (mission titles, descriptions, image
// URLs authored by creators) into HTML. Everything must be escaped or a crafted
// title becomes stored XSS on the function's origin for anyone opening a shared
// link.
const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Record ids are opaque database keys (UUIDs today). Restricting them to a safe
// charset keeps quotes, angle brackets and backslashes out of the redirect URL
// and the HTML below, without hardcoding one specific key format.
const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// Safe to embed inside a <script> block: JSON-encoded, with the closing-tag
// sequence neutralised so the string cannot terminate the script element.
const toScriptString = (value: string): string => JSON.stringify(value).replace(/</g, '\\u003c');

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const missionId = url.searchParams.get('id');
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://rean.camboverse.world';

    if (!missionId || !SAFE_ID_RE.test(missionId)) {
      return new Response('Missing or invalid ID', { status: 400 });
    }

    // Initialize Supabase Client with custom domain
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Mission Data
    const { data: mission, error } = await supabase
      .from('missions')
      .select('title, description, thumbnail')
      .eq('id', missionId)
      .single();

    if (error || !mission) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/` },
      });
    }

    const safeTitle = escapeHtml(mission.title || 'Mission');
    const safeDesc = `${escapeHtml((mission.description || '').substring(0, 150))}...`;
    const safeImage = escapeHtml(mission.thumbnail || '');
    const redirectUrl = `${frontendUrl}/#/mission/${missionId}`;
    const safeRedirectUrl = escapeHtml(redirectUrl);

    const html = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="UTF-8">
        <title>${safeTitle} | REAN</title>
        <meta name="description" content="${safeDesc}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${safeRedirectUrl}">
        <meta property="og:title" content="${safeTitle}">
        <meta property="og:description" content="${safeDesc}">
        <meta property="og:image" content="${safeImage}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:title" content="${safeTitle}">
        <meta property="twitter:description" content="${safeDesc}">
        <meta property="twitter:image" content="${safeImage}">

        <style>
           body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f9fafb; color: #374151; }
           .loader { border: 4px solid #f3f3f3; border-top: 4px solid #0F766E; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
           @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <p>កំពុងនាំអ្នកទៅកាន់ REAN...</p>
        <script>
          setTimeout(() => {
            window.location.href = ${toScriptString(redirectUrl)};
          }, 50);
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
