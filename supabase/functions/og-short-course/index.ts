import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Declare Deno for environments where types are missing
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const courseId = url.searchParams.get('id');

    // The web application URL (frontend)
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://rean.camboverse.world';

    if (!courseId) {
      return new Response('Missing ID', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    // 2. Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://oficlnrazfeswkdrpzjh.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Fetch Course Data for Metadata
    const { data: course, error } = await supabase
      .from('short_courses')
      .select('title, description, cover_image, schools(name)')
      .eq('id', courseId)
      .single();

    if (error || !course) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: `${frontendUrl}/`,
        },
      });
    }

    // 4. Sanitize strings
    const safeTitle = (course.title || 'Short Course').replace(/"/g, '&quot;');
    const safeDesc = (course.description || 'View course details on REAN')
      .substring(0, 160)
      .replace(/"/g, '&quot;');
    const image =
      course.cover_image ||
      'https://oficlnrazfeswkdrpzjh.supabase.co/storage/v1/object/public/Rean/course-covers/default-course.png';
    const redirectUrl = `${frontendUrl}/#/course/${courseId}`;
    const schoolName = course.schools?.name || 'REAN';

    // 5. Construct HTML Template
    const html = `<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle} | ${schoolName}</title>
    
    <!-- SEO & Meta Tags -->
    <meta name="description" content="${safeDesc}">
    <link rel="canonical" href="${redirectUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${redirectUrl}">
    <meta property="og:title" content="${safeTitle} | ${schoolName}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${image}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${redirectUrl}">
    <meta property="twitter:title" content="${safeTitle} | ${schoolName}">
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
    <p>កំពុងនាំអ្នកទៅកាន់ ${safeTitle}...</p>
    <script>
        window.onload = function() {
            window.location.href = "${redirectUrl}";
        };
    </script>
</body>
</html>`;

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
