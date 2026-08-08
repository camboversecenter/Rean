import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Declare Deno for environments where types are missing
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This page interpolates database values (titles, descriptions, image URLs
// authored by users) into HTML. Everything must be escaped or a crafted value
// becomes stored XSS on the function origin for anyone opening a shared link.
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
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const missionId = url.searchParams.get('id');

    // The web application URL (frontend)
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://rean.camboverse.world';

    if (!missionId || !SAFE_ID_RE.test(missionId)) {
      return new Response('Missing or invalid ID', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    // 2. Initialize Supabase Client with CUSTOM DOMAIN
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Fetch Mission Data for Metadata
    const { data: mission, error } = await supabase
      .from('missions')
      .select('title, description, thumbnail')
      .eq('id', missionId)
      .single();

    if (error || !mission) {
      // Redirect to home if mission not found
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: `${frontendUrl}/`,
        },
      });
    }

    // 4. Escape every value that lands in the HTML below.
    const safeTitle = escapeHtml(mission.title || 'Mission');
    const safeDesc = escapeHtml((mission.description || '').substring(0, 160));
    const image = escapeHtml(
      mission.thumbnail || `${supabaseUrl}/storage/v1/object/public/Rean/missions/default-og.png`
    );
    const redirectUrl = `${frontendUrl}/#/mission/${missionId}`;
    const safeRedirectUrl = escapeHtml(redirectUrl);

    // 5. Construct HTML Template with Open Graph Tags
    const html = `<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle} | REAN</title>
    
    <!-- SEO & Meta Tags -->
    <meta name="description" content="${safeDesc}">
    <link rel="canonical" href="${safeRedirectUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${safeRedirectUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${image}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${safeRedirectUrl}">
    <meta property="twitter:title" content="${safeTitle}">
    <meta property="twitter:description" content="${safeDesc}">
    <meta property="twitter:image" content="${image}">

    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            background: #f9fafb; 
            color: #374151; 
            margin: 0; 
            text-align: center;
        }
        .loader { 
            border: 3px solid #f3f3f3; 
            border-top: 3px solid #0F766E; 
            border-radius: 50%; 
            width: 30px; 
            height: 30px; 
            animation: spin 0.8s linear infinite; 
            margin-bottom: 20px; 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        p { font-size: 14px; font-weight: 500; }
    </style>
</head>
<body>
    <div class="loader"></div>
    <p>កំពុងនាំអ្នកទៅកាន់ REAN...</p>
    <script>
        window.onload = function() {
            window.location.href = ${toScriptString(redirectUrl)};
        };
    </script>
</body>
</html>`;

    // 6. Return Response with strict HTML header
    return new Response(html, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
