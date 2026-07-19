# AI Tutor (Kru Rean)

"Kru Rean" (គ្រូរៀន, "Teacher Rean") is the platform's AI assistant, powered by Google
Gemini. It teaches, chats, grades submissions, generates images, and can even hold live
voice conversations. Every AI action costs **points** from the user's balance, and the
spending happens server-side so it cannot be bypassed.

**Relevant code:** `services/geminiService.ts`, `components/KruReanChat.tsx`,
`components/LiveVoiceTutor.tsx`, `supabase/functions/ai-assistant/index.ts`.

## Who uses it

- **Students:** the main audience for chat, teaching, and grading.
- **Creators:** use AI to generate mission structures and branding.
- **All roles:** can chat with Kru Rean.

## How requests are processed

All AI requests are routed through the `ai-assistant` Deno **edge function**, which:

1. Verifies the user is authenticated.
2. Checks the user can **afford** the action's point cost.
3. **Deducts** the points using the Supabase service-role key (server-side, trusted).
4. Calls Google Gemini and returns the result.
5. **Refunds** the points automatically if the Gemini call fails after deduction, so
   users are never charged for a failed request.

Because point deduction happens on the server with the service-role key, users cannot
cheat the economy from the browser. The client only pre-checks affordability
(`canAfford`) for a fast, friendly error; it never deducts points itself. A **direct
client-side fallback** exists for local development only (when `VITE_GEMINI_DEV_KEY`
is set in `.env`; it is stripped from production builds).

## AI feature costs

Defined in `AI_COSTS` (client) and `COSTS` (edge function):

| Action                          | Cost (points) | Function                   |
| ------------------------------- | ------------- | -------------------------- |
| Chat (simple text)              | 1             | `chatWithAI`               |
| Answer evaluation / grading     | 5             | `evaluateSubmission`       |
| Vision grading (image uploads)  | 10            | `evaluateImageSubmission`  |
| Lesson / large-context teaching | 10            | (lesson generation)        |
| Structured / JSON generation    | 10            | `generateMissionStructure` |
| Image generation                | 25            | `generateImage`            |
| Live voice session (entry fee)  | 10            | `LiveVoiceTutor`           |
| Plagiarism embedding check      | 1             | `generateEmbedding`        |
| Tagging the AI in community     | 10            | `chatWithAiTag`            |
| Reply quality moderation        | 0 (free)      | `checkContentQuality`      |

## Capabilities

- **Chat (`chatWithAI`):** free-form conversation with the AI tutor in the chat screen.
- **Teaching:** each mission module has a theory prompt and an AI persona, so the AI
  teaches the specific topic in the "Learn" tab of the classroom.
- **Grading (`evaluateSubmission`, `evaluateImageSubmission`):** scores a student's
  submission out of 100 with written feedback; 70+ passes.
- **Image generation (`generateImage`):** produces images (the most expensive action).
- **Mission structure generation (`generateMissionStructure`):** creators describe a
  topic and the AI drafts a full multi-module mission.
- **Content quality check (`checkContentQuality`):** screens content quality.
- **Live Voice Tutor (`LiveVoiceTutor.tsx`):** a real-time spoken conversation with the
  AI, charged an entry fee.
- **Community tagging (`chatWithAiTag`):** users can tag the AI (`@tonsay`) in a
  community post to get an AI answer.

## Grade parsing

The evaluation response is parsed (`parseEvaluationResponse`) to extract a `SCORE:` and
`FEEDBACK:` block. If no explicit score is present but the text says "PASS"/"PASSED",
it is treated as a pass with a score of 100. The pass threshold is **70**.
