import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Declare Deno for environments where types are missing
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const missionId = url.searchParams.get('id');
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://rean.camboverse.world';

    if (!missionId) {
      return new Response('Missing ID', { status: 400 });
    }

    // Initialize Supabase Client with custom domain
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://sjlduyivbwpvgkeiqysr.supabase.co';
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

    const html = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="UTF-8">
        <title>${mission.title} | REAN</title>
        <meta name="description" content="${mission.description?.substring(0, 150)}...">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${frontendUrl}/#/mission/${missionId}">
        <meta property="og:title" content="${mission.title}">
        <meta property="og:description" content="${mission.description?.substring(0, 150)}...">
        <meta property="og:image" content="${mission.thumbnail}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:title" content="${mission.title}">
        <meta property="twitter:description" content="${mission.description?.substring(0, 150)}...">
        <meta property="twitter:image" content="${mission.thumbnail}">

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
            window.location.href = "${frontendUrl}/#/mission/${missionId}";
          }, 50);
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
