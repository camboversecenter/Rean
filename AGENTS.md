# AGENTS.md

Guidance for AI coding agents (and new contributors) working in the REAN repository.
Read this before making changes.

## Project

REAN (រៀន means "to learn" in Khmer) is a free, open-source educational marketplace for
Cambodia. It connects students with schools, tutors, and AI-driven learning missions,
wrapped in a gamified community and a points-based economy.

- **Incubated by:** CamboVerse Center, National University of Management (NUM).
- **Model:** Free for users in Cambodia; sustained by community support, donations,
  grants, and training (not by selling the software).
- **Detailed docs:** see the [`docs/`](./docs/README.md) folder for per-feature and
  per-role documentation and the architecture overview.

## Tech stack

- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, React Router (HashRouter),
  Lucide icons.
- **Backend:** Supabase (PostgreSQL + Row-Level Security, Auth, Storage, Edge Functions).
- **AI:** Google Gemini via `@google/genai`.
- **Hosting:** Cloudflare Pages (via Wrangler / GitHub Actions).

## Repository layout

| Path                  | Purpose                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `App.tsx`             | Routing (HashRouter) and top-level auth/session state.                          |
| `pages/`              | Route-level screens.                                                            |
| `components/`         | Reusable UI and feature managers.                                               |
| `services/`           | All Supabase and Gemini access. The only layer that touches the backend.        |
| `supabase/functions/` | Deno edge functions (`ai-assistant` and the `og-*` previews).                   |
| `documents/`          | In-app documentation pages rendered at `/docs/*` (TSX, not the `docs/` folder). |
| `docs/`               | Project documentation (Markdown).                                               |
| `types.ts`            | The domain model (~25 interfaces).                                              |
| `constants.ts`        | Shared constants.                                                               |
| `utils/`              | Small helpers.                                                                  |
| `*.sql` (root)        | Supabase schema, RLS policies, triggers, partitioning.                          |

## Commands

```bash
npm install            # install dependencies
npm run dev            # start the Vite dev server (http://localhost:5173)
npm run build          # production build
npm run format         # Prettier (writes changes) over **/*.{ts,tsx,css,md}
npm run format:check   # Prettier check only (what CI runs)
npm run lint           # TypeScript type check (tsc --noEmit)
npm run test           # Vitest (run once)
npm run deploy         # build + deploy to Cloudflare Pages
```

**Always run `npm run format` before committing.** CI runs Prettier and Vitest on every
push and PR (`.github/workflows/ci.yml`).

## Conventions

### Architecture

- **Components never call Supabase or Gemini directly.** All backend access goes through
  a module in `services/`. Add or extend a service rather than querying from a component.
- **All AI features route through the `ai-assistant` edge function.** It checks
  affordability and deducts points server-side with the service-role key so the points
  economy cannot be bypassed from the client. Keep it that way; do not move point
  spending to the client. A direct client-side fallback exists for local dev only.
- **The points economy is the spine of the app.** Earning rules live in
  `services/gamificationService.ts` (`GAME_RULES`); AI costs live in
  `services/geminiService.ts` (`AI_COSTS`) and mirror the edge function's `COSTS`. If you
  change a cost, update both places.

### Code style

- TypeScript throughout. Match the style and naming of the surrounding code.
- Prettier is the formatter of record; do not hand-format against it.
- Styling is Tailwind utility classes.
- The UI is **bilingual (Khmer and English)**. Preserve existing Khmer strings; when you
  add user-facing text, follow the nearby pattern (often Khmer with an English label).

### Writing style (prose)

- **Do not use the em-dash character `—`** anywhere in project text, docs, comments, or
  commit messages. Use commas, colons, periods, or "to" instead. Keep prose plain and
  natural. (The one exception is `LICENSE`, which is verbatim legal text and must not be
  altered.)

## Git workflow

- **Sign off every commit** with the Developer Certificate of Origin: `git commit -s`.
  See [CONTRIBUTING.md](./CONTRIBUTING.md).
- Write clear, descriptive commit messages.
- Do not commit secrets. Supabase URL/keys and the Gemini key come from environment
  variables (`.env`, Vite `import.meta.env`). The **publishable** key is browser-safe;
  the **service-role** key belongs only in edge functions and must never reach the client.

## Security notes

- Row-Level Security protects data at the database level; keep policies in the root SQL
  scripts in sync with schema changes.
- Never expose the service-role key to the frontend bundle.
- Validate and gate actions by role where relevant (`student`, `tutor`, `school`,
  `business`, `admin`).

## Licensing

- Application code: **AGPL-3.0-or-later** (see [LICENSE](./LICENSE)).
- Documentation and prose: **CC BY-SA 4.0**.
- The REAN name and logo are trademarks, separate from the code license
  ([TRADEMARK.md](./TRADEMARK.md)).
- Contributions are accepted under these licenses via the DCO sign-off.

## Known gotchas

- CI enforces `npm run lint` (`tsc --noEmit`, currently zero errors) and
  `npm run format:check`. Run both locally before pushing; a single unformatted file or
  type error fails the pipeline.
- Routing uses `HashRouter` (URLs contain `#/`) to suit static hosting. Keep new routes
  consistent with the public vs. protected split declared in `App.tsx`.
- Supabase Storage uses a single public bucket named `Rean`.
- The AI economy deducts points ONLY in the `ai-assistant` edge function, which refunds
  on failure. Client services call `canAfford` for UX and never `spendPoints` for AI.
- Wallet writes go through the `spend_points` / `award_action` RPCs (see
  `SUPABASE_HARDENING.sql`); the direct-write code paths are legacy fallbacks only.
