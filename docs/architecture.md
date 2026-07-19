# Architecture

This document explains how REAN is put together: the frontend, the service layer, the
Supabase backend, and the Deno edge functions.

## High-level overview

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React 18 + TypeScript, Vite, Tailwind)            │
│                                                             │
│  App.tsx (routing + auth state)                             │
│    ├── pages/         route-level screens                   │
│    ├── components/    UI + feature managers                 │
│    └── services/      all backend access                    │
└───────────────┬───────────────────────────┬────────────────┘
                │                           │
                │ Supabase JS SDK           │ (AI requests)
                ▼                           ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│  Supabase                 │   │  Edge Functions (Deno)        │
│  - PostgreSQL + RLS       │   │  - ai-assistant (Gemini +     │
│  - Auth (Google OAuth)    │◄──┤    server-side point spend)   │
│  - Storage (Rean bucket)  │   │  - og / og-* (OG previews)    │
└───────────────────────────┘   └───────────────┬──────────────┘
                                                │
                                                ▼
                                        Google Gemini API
```

## Frontend

- **React 18 + TypeScript**, built with **Vite**.
- **Tailwind CSS** for styling, **Lucide** for icons.
- **React Router** with **HashRouter** (works well on static hosting).
- Rich content: `react-markdown`, KaTeX (math), CodeMirror (in-app code editor),
  `react-syntax-highlighter`, `canvas-confetti`, `react-hot-toast`.
- `App.tsx` owns routing and top-level auth/session state and splits routes into public
  and protected (via `ProtectedRoute`).

### Folder layout

| Folder                | Contents                                                          |
| --------------------- | ----------------------------------------------------------------- |
| `pages/`              | Route-level screens (Home, Explore, dashboards, Classroom, etc.). |
| `components/`         | Reusable UI and feature managers (forms, feed, chat, managers).   |
| `services/`           | All Supabase + Gemini access. UI never talks to the DB directly.  |
| `documents/`          | In-app documentation pages rendered at `/docs/*`.                 |
| `utils/`              | Small helpers (e.g. `formatHelper.ts`).                           |
| `types.ts`            | The domain model (~25 interfaces).                                |
| `constants.ts`        | Shared constants.                                                 |
| `supabase/functions/` | Deno edge functions.                                              |
| `docs/`               | This documentation.                                               |

## Service layer

Every backend interaction goes through a module in `services/`. This keeps components
free of database logic and centralizes auth, error handling, and the points economy.

| Service                     | Responsibility                                               |
| --------------------------- | ------------------------------------------------------------ |
| `supabaseClient.ts`         | Creates the shared Supabase client.                          |
| `authService.ts`            | Sign-in/out, profile, role management.                       |
| `missionService.ts`         | Mission CRUD, mentors, classes.                              |
| `missionProgressService.ts` | Enrollment, payments, squads, submissions, grading flow.     |
| `schoolService.ts`          | Schools, admissions, scholarships, short courses, inquiries. |
| `tutorService.ts`           | Tutor profiles, bookings, requests, homework, logs.          |
| `communityService.ts`       | Community posts, replies, reactions, accepted answers.       |
| `gamificationService.ts`    | XP/points, rewards, mystery boxes, bounties.                 |
| `leaderboardService.ts`     | Rankings, activity feed, level math.                         |
| `achievementService.ts`     | Achievements.                                                |
| `bookmarkService.ts`        | Saved posts.                                                 |
| `geminiService.ts`          | AI features + AI cost table (calls the edge function).       |
| `storageService.ts`         | File uploads to Supabase Storage.                            |

## Backend (Supabase)

- **PostgreSQL** with **Row-Level Security**. Schema and policies are defined in the
  root SQL scripts: `SUPABASE_SETUP.sql`, `FIX_COMMENTS_RLS.sql`,
  `UPDATE_POINTS_TRIGGER.sql`, `SCALABILITY_PARTITIONING.sql`.
- **Auth:** Google OAuth via Supabase Auth.
- **Storage:** a public bucket named `Rean` with folders for avatars, school logos,
  school covers, course covers, missions, and rewards. Public read; authenticated
  write.
- **Point triggers:** database triggers keep the points/XP economy consistent.

## Edge functions (Deno)

Located in `supabase/functions/`:

- **`ai-assistant`**: the single gateway for AI features. It authenticates the user,
  checks affordability, deducts points with the service-role key, then calls Gemini.
  This is what makes the economy tamper-proof from the client.
- **`og`, `og-school`, `og-mission`, `og-tutor`, `og-short-course`**: generate Open
  Graph HTML so shared links render rich social previews.

## Build, CI/CD & hosting

- **CI:** GitHub Actions (`.github/workflows/ci.yml`) runs Prettier, TypeScript type
  checks, and Vitest on every push and PR. Build and deploy depend on tests passing.
- **Preview environments:** PRs get isolated Cloudflare preview URLs.
- **Production:** merges to `main` deploy automatically to **Cloudflare Pages**
  (`wrangler.toml`).

## Security notes

- AI spending is enforced server-side; the client cannot mint or avoid spending points.
- Row-Level Security protects data access at the database level.
- The Supabase **publishable** key is safe to expose to the browser; the **service-role**
  key is used only inside edge functions and must never reach the client.
