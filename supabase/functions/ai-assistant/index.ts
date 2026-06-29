
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { GoogleGenAI } from "https://esm.sh/@google/genai";

// Declare Deno for environments where types are missing
declare const Deno: any;

// --- CONFIGURATION ---
const COSTS = {
  'chat': 1,
  'evaluate': 5,
  'structure': 10,
  'generate-image': 25,
  'live-init': 10,
  'award-bounty': 0, // System action, no cost
  'embed': 1, // Cheap cost for checking plagiarism
  'tag-reply': 10 // Cost for tagging @tonsay in community
};

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
    // 2. Setup Clients
    const supabaseKey = Deno.env.get('APP_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      supabaseKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const serviceRoleKey = Deno.env.get('APP_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    );

    const apiKey = Deno.env.get('GOOGLE_API_KEY') || '';
    const ai = new GoogleGenAI({ apiKey });

    // 3. Authenticate User
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Parse Request
    const { action, payload } = await req.json();
    const cost = COSTS[action as keyof typeof COSTS] || 0;

    // 5. TRANSACTION: Check Balance & Deduct Points
    if (cost > 0) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('spendable_points')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found');
      }

      if ((profile.spendable_points || 0) < cost) {
        return new Response(JSON.stringify({ 
          error: `Insufficient funds. Need ${cost}, have ${profile.spendable_points}.` 
        }), {
          status: 402, // Payment Required
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ spendable_points: profile.spendable_points - cost })
        .eq('id', user.id);

      if (updateError) throw new Error('Transaction failed');

      // Log Transaction (Async)
      supabaseAdmin.from('point_transactions').insert({
        user_id: user.id,
        amount: -cost,
        type: 'spend',
        reason: `AI Feature: ${action}`
      }).then();
    }

    // 6. EXECUTE AI LOGIC
    let result: any = {};

    switch (action) {
      case 'chat': {
        const { message, history, systemInstruction, useSearch } = payload;
        const modelName = useSearch ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

        const chat = ai.chats.create({
            model: modelName,
            history: history || [],
            config: {
                systemInstruction,
                tools: useSearch ? [{ googleSearch: {} }] : undefined
            }
        });

        const response = await chat.sendMessage({ message });
        const text = response.text;
        result = { text };
        break;
      }

      case 'tag-reply': {
        const { message, systemInstruction } = payload;
        
        // Use standard flash model for community replies
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction },
            history: [] // No history for single-shot tag replies usually, or pass if needed
        });

        const response = await chat.sendMessage({ message });
        const text = response.text;
        result = { text };
        break;
      }

      case 'evaluate': {
        const { prompt } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        const text = response.text;
        result = { text };
        break;
      }

      case 'structure': {
        const { prompt } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const text = response.text;
        result = { text };
        break;
      }

      case 'generate-image': {
        const { prompt } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: prompt
        });
        
        let imageBase64 = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    break;
                }
            }
        }
        
        if (imageBase64) {
            result = { image: imageBase64 };
        } else {
            result = { error: "Failed to generate image.", details: response.text };
        }
        break;
      }

      case 'embed': {
        const { text } = payload;
        if (!text) throw new Error("Text is required for embedding");
        
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            content: { parts: [{ text }] }
        });
        result = { embedding: response.embedding.values };
        break;
      }

      case 'award-bounty': {
        const { postId, replyId } = payload;
        
        // 1. Verify Post Ownership (Security Check)
        const { data: post, error: postError } = await supabaseAdmin
            .from('student_posts')
            .select('author_id, bounty_points')
            .eq('id', postId)
            .single();
            
        if (postError || !post) throw new Error("Post not found");
        if (post.author_id !== user.id) throw new Error("Unauthorized: Only the question author can accept an answer.");
        
        // 2. Verify Reply Validity
        const { data: reply, error: replyError } = await supabaseAdmin
            .from('community_replies')
            .select('author_id, is_accepted')
            .eq('id', replyId)
            .single();
            
        if (replyError || !reply) throw new Error("Reply not found");
        if (reply.is_accepted) throw new Error("Reply already accepted");

        // 3. Mark Reply as Accepted
        const { error: updateError } = await supabaseAdmin
            .from('community_replies')
            .update({ is_accepted: true })
            .eq('id', replyId);
            
        if (updateError) throw new Error("Failed to update reply status");

        // 4. Transfer Points if Bounty Exists
        const recipientId = reply.author_id;
        // Only transfer if recipient exists and is not AI (author_id would be null for AI usually, or check logic)
        if (recipientId) {
            const bounty = post.bounty_points || 0;
            const xpReward = 20; // Fixed XP for accepted answer
            
            const { data: recipient } = await supabaseAdmin
                .from('profiles')
                .select('spendable_points, lifetime_xp')
                .eq('id', recipientId)
                .single();
            
            if (recipient) {
                // Update Recipient Balance
                await supabaseAdmin.from('profiles').update({ 
                    spendable_points: (recipient.spendable_points || 0) + bounty,
                    lifetime_xp: (recipient.lifetime_xp || 0) + xpReward
                }).eq('id', recipientId);

                // Log Bounty Transaction (Money)
                if (bounty > 0) {
                    await supabaseAdmin.from('point_transactions').insert({ 
                        user_id: recipientId, 
                        amount: bounty, 
                        type: 'earn', 
                        reason: 'Bounty Reward (រង្វាន់ពីចម្លើយ)' 
                    });
                }
                
                // Log XP Transaction (Reputation)
                await supabaseAdmin.from('point_transactions').insert({ 
                    user_id: recipientId, 
                    amount: 0, 
                    type: 'earn', 
                    reason: 'Solution Accepted (ចម្លើយត្រឹមត្រូវ)' 
                });
            }
        }
        result = { success: true };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
