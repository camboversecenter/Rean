import { supabase } from './supabaseClient';
import { GoogleGenAI } from '@google/genai';
import { canAfford } from './gamificationService';

// --- ECONOMY CONFIGURATION ---
export const AI_COSTS = {
  CHAT: 1, // Simple Text
  EVALUATION: 5, // Complex Reasoning
  LESSON: 10, // Large Context Generation
  STRUCTURE: 10, // JSON Structure
  IMAGE: 25, // Expensive Compute
  LIVE_SESSION: 10, // Entry Fee for Live
  EMBEDDING: 1, // Plagiarism Check (Cheap)
  TAG_REPLY: 10, // Tagging @tonsay
};

// DEV-ONLY direct Gemini access. In production this is always an empty
// string: the import.meta.env.DEV guard is statically false in a production
// build, so the key can never end up in the shipped bundle. All production
// AI calls go through the ai-assistant Edge Function, which holds the real
// key in Supabase secrets and deducts points server-side.
const DEV_GEMINI_KEY: string = import.meta.env.DEV
  ? (import.meta.env.VITE_GEMINI_DEV_KEY as string) || ''
  : '';

export const hasDevAiKey = (): boolean => Boolean(DEV_GEMINI_KEY);

export const ai = new GoogleGenAI({ apiKey: DEV_GEMINI_KEY });

// --- HELPER: AFFORDABILITY GATE (UX ONLY) ---
// The authoritative balance check and deduction happen inside the
// ai-assistant Edge Function. Charging here as well double-bills the user,
// so this only pre-checks the balance to fail fast with a clear message.
const ensureAffordable = async (cost: number): Promise<void> => {
  const affordable = await canAfford(cost);
  if (!affordable) {
    throw new Error(`មិនមានពិន្ទុគ្រប់គ្រាន់! (Insufficient Points). ត្រូវការ ${cost} ពិន្ទុ។`);
  }
};

// --- HELPER: DIRECT FALLBACK (DEV MODE) ---
const tryDirectFallback = async (taskName: string, operation: () => Promise<any>) => {
  if (DEV_GEMINI_KEY) {
    console.warn(`Edge Function failed for ${taskName}. Attempting direct client-side fallback...`);
    try {
      return await operation();
    } catch (e: any) {
      console.error(`Direct Fallback for ${taskName} failed:`, e);
      // Help debug Service Worker issues
      if (e.message?.includes('405') || e.status === 405) {
        console.error(
          'CRITICAL: A Service Worker is likely intercepting the API request. Please refresh the page to unregister it.'
        );
      }
    }
  } else {
    console.warn(
      `Edge Function failed for ${taskName}. No dev fallback key found. For local development set VITE_GEMINI_DEV_KEY in .env.`
    );
  }
  return null;
};

// --- HELPER: PARSE EVALUATION ---
const parseEvaluationResponse = (
  text: string
): { passed: boolean; score: number; feedback: string } => {
  const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

  let feedback = text.replace(/SCORE:\s*\d+/i, '').trim();
  feedback = feedback.replace(/^FEEDBACK:\s*/i, '').trim();

  const passed = score >= 70;

  if (!scoreMatch) {
    if (text.toUpperCase().includes('PASSED') || text.toUpperCase().startsWith('PASS')) {
      return { passed: true, score: 100, feedback: text.replace(/PASSED|PASS/i, '').trim() };
    }
  }

  return { passed, score, feedback };
};

// --- SECURE BACKEND CALLS ---

/**
 * Generates text embedding vector.
 * Cost: 1 Point (Plagiarism Check)
 */
export const generateEmbedding = async (text: string): Promise<number[] | null> => {
  await ensureAffordable(AI_COSTS.EMBEDDING);

  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'embed',
        payload: { text },
      },
    });

    if (error || data?.error) {
      throw new Error(data?.error || 'Embedding Failed');
    }
    return data.embedding;
  } catch (error) {
    console.error('Secure Embedding Error:', error);

    // Fallback
    const fallback = await tryDirectFallback('Embedding', async () => {
      const res = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: { parts: [{ text }] },
      });
      return res.embeddings?.[0]?.values;
    });

    return fallback || null;
  }
};

export const checkContentQuality = async (content: string): Promise<number> => {
  const prompt = `
        Act as a strict content moderator for an educational community.
        Rate this reply on a scale of 0 to 100 based on its helpfulness and depth.
        Rules:
        - If it is "Thanks", "Good", "Ok", or purely phatic: Score < 30.
        - If generic: Score 30-69.
        - If specific answer/explanation: Score 70-100.
        Content: "${content.substring(0, 500)}"
        Return ONLY the integer number.
    `;

  const parseScore = (text: string): number => {
    const score = parseInt(text.match(/\d+/)?.[0] || '0');
    return isNaN(score) ? 0 : score;
  };

  try {
    // Free action (cost 0): runs on the Edge Function so it works in
    // production, where the browser has no Gemini key.
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { action: 'quality', payload: { prompt } },
    });
    if (error || data?.error) throw new Error(data?.error || 'Quality Check Failed');
    return parseScore(data.text || '0');
  } catch (e) {
    const fallbackText = await tryDirectFallback('Quality Check', async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    });
    if (fallbackText) return parseScore(fallbackText);
    return 50;
  }
};

export const chatWithAI = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = [],
  customSystemInstruction?: string,
  useSearch: boolean = false
) => {
  await ensureAffordable(AI_COSTS.CHAT);

  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'chat',
        payload: { message, history, systemInstruction: customSystemInstruction, useSearch },
      },
    });

    if (error || data?.error) {
      throw new Error(data?.error || 'Connection Failed');
    }
    return data.text;
  } catch (error: any) {
    console.error('Secure Chat Failed:', error);
    const fallback = await tryDirectFallback('Chat', async () => {
      const modelName = 'gemini-3-flash-preview'; // gemini-3-pro-preview is discontinued
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: customSystemInstruction,
          tools: useSearch ? [{ googleSearch: {} }] : undefined,
        },
        history: history.map((h) => ({ role: h.role, parts: h.parts })),
      });
      const res = await chat.sendMessage({ message });
      return res.text;
    });
    if (fallback) return fallback;
    return `⚠️ ប្រព័ន្ធមានបញ្ហា (System Error): ${error.message}`;
  }
};

/**
 * Specifically for @tonsay tagging.
 * COST: 10 Points (Handled by Edge Function, not client side spendPoints)
 */
export const chatWithAiTag = async (message: string, systemInstruction: string) => {
  // 1. Check Affordability Client-Side (Good UX)
  const affordable = await canAfford(AI_COSTS.TAG_REPLY);
  if (!affordable) {
    throw new Error(`មិនមានពិន្ទុគ្រប់គ្រាន់! ត្រូវការ ${AI_COSTS.TAG_REPLY} ពិន្ទុ។`);
  }

  try {
    // 2. Invoke Edge Function (Authoritative deduction happens here)
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'tag-reply',
        payload: { message, systemInstruction },
      },
    });

    if (error || data?.error) {
      throw new Error(data?.error || 'AI Tagging Failed');
    }
    return data.text;
  } catch (error: any) {
    console.error('Secure Tag Chat Failed:', error);
    // Fallback allowed for DEV, but in prod this would bypass payment if we use direct gemini
    // So we enforce server-side only for this paid feature unless in full dev mode
    if (DEV_GEMINI_KEY) {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction },
      });
      const res = await chat.sendMessage({ message });
      return res.text;
    }
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  await ensureAffordable(AI_COSTS.IMAGE);

  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { action: 'generate-image', payload: { prompt } },
    });

    if (error || !data?.image) return null;
    return data.image;
  } catch (e) {
    console.error('Image Gen Error:', e);
    return null;
  }
};

// Evaluate Image Submission (Vision)
export const evaluateImageSubmission = async (
  task: string,
  persona: string,
  imageBase64: string,
  optionalText: string = ''
): Promise<{ passed: boolean; score: number; feedback: string }> => {
  // Uses higher cost for vision
  await ensureAffordable(AI_COSTS.EVALUATION + 5);

  const prompt = `
        [SYSTEM: GRADING MODE - VISION]
        You are acting as: ${persona}
        The student was assigned this task: "${task}"
        
        The student has uploaded an image of their work (handwritten or digital).
        Additional notes from student: "${optionalText}"
        
        INSTRUCTIONS:
        1. Analyze the image to identify the student's work/solution.
        2. Verify if the math/logic is correct.
        3. If there is handwriting, transcribe the key parts into LaTeX format (wrapped in $$) in your feedback so they can see it clearly.
        4. Rate on scale 0-100.
           - 0-69: Fail / Incorrect
           - 70-100: Pass / Correct
        5. Return ONLY:
           SCORE: [number]
           FEEDBACK: [Constructive feedback in Khmer, use LaTeX for math formulas]
      `;

  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { action: 'evaluate-image', payload: { prompt, imageBase64 } },
    });

    if (error || data?.error) throw new Error(data?.error || 'Vision Eval Failed');
    return parseEvaluationResponse(data.text || '');
  } catch (error: any) {
    console.error('Vision Evaluation Error:', error);

    const fallbackText = await tryDirectFallback('Vision Evaluate', async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Correct model for image input
        contents: {
          parts: [{ inlineData: { mimeType: 'image/png', data: imageBase64 } }, { text: prompt }],
        },
      });
      return response.text;
    });
    if (fallbackText) return parseEvaluationResponse(fallbackText);

    return {
      passed: false,
      score: 0,
      feedback: 'បរាជ័យក្នុងការមើលរូបភាព។ សូមព្យាយាមម្តងទៀត ឬប្រើអក្សរជំនួស។',
    };
  }
};

export const evaluateSubmission = async (
  task: string,
  persona: string,
  submission: string
): Promise<{ passed: boolean; score: number; feedback: string }> => {
  await ensureAffordable(AI_COSTS.EVALUATION);

  const prompt = `
      [SYSTEM: GRADING MODE]
      You are acting as: ${persona}
      The student was assigned this task: "${task}"
      Here is their submission: "${submission}"
      
      INSTRUCTIONS:
      1. Analyze the submission strictly against the task.
      2. Rate on scale 0-100.
         - 0-69: Fail
         - 70-100: Pass
      3. Return ONLY:
         SCORE: [number]
         FEEDBACK: [Constructive feedback in Khmer, max 100 words]
    `;

  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { action: 'evaluate', payload: { prompt } },
    });

    if (error || data?.error) throw new Error(data?.error || 'Eval Failed');
    return parseEvaluationResponse(data.text || '');
  } catch (error) {
    console.error('Secure Evaluation Error:', error);
    const fallbackText = await tryDirectFallback('Evaluate', async () => {
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return res.text;
    });
    if (fallbackText) return parseEvaluationResponse(fallbackText);
    return { passed: false, score: 0, feedback: 'ប្រព័ន្ធដាក់ពិន្ទុមានបញ្ហា។ សូមព្យាយាមម្តងទៀត។' };
  }
};

export const generateMissionStructure = async (topic: string): Promise<Partial<any>> => {
  await ensureAffordable(AI_COSTS.STRUCTURE);

  const prompt = `
        Act as an expert curriculum designer. 
        Create a structured educational "Mission" for students based on: "${topic}".
        If the topic involves Math, Physics, or Chemistry, ensure tasks are distinct problems.
        Return a purely JSON object (no markdown) with:
        {
            "title": "Title",
            "description": "Hook",
            "level": "Beginner",
            "price": 0,
            "squadSize": 3,
            "modules": [
                { "id": "mod1", "title": "", "objective": "", "keyPoints": ["", "", ""], "task": "Use LaTeX $$...$$ for math formulas", "aiPersona": "", "initialPrompt": "", "theoryPrompt": "" }
            ]
        }
        Create 5 distinct modules.
        For every module:
        - "objective" is one or two sentences written TO the student saying what they will be
          able to do after the lesson. Student facing prose, never an instruction to the AI.
        - "keyPoints" is an array of 3 to 5 short student facing strings covering the main
          ideas, useful tricks, and common mistakes.
        - "task" is the assignment the student hands in, and is shown separately from the
          lesson brief, so it must make sense on its own.
    `;

  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { action: 'structure', payload: { prompt } },
    });

    if (error || data?.error) throw new Error(data?.error || 'Structure Failed');
    const cleanText = (data.text || '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('AI Mission Gen Error:', error);
    const fallbackText = await tryDirectFallback('Structure', async () => {
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      return res.text;
    });
    if (fallbackText) {
      const cleanText = fallbackText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleanText);
    }
    throw new Error('Failed to generate mission structure.');
  }
};
