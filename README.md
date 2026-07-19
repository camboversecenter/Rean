# REAN - Educational Marketplace (Cambodia)

REAN (រៀន means "to learn" in Khmer) is a comprehensive educational platform for Cambodia, connecting students with schools, tutors, and AI-driven learning missions. It features a gamified community, real-time AI tutoring, and a marketplace for short courses.

> **Incubated by CamboVerse Center, National University of Management (NUM).**

## Tech Stack

- **Frontend**: React (v18+), TypeScript, Tailwind CSS, Lucide React.
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **AI**: Google Gemini API (@google/genai).
- **Build Tool**: Vite.
- **Hosting**: Cloudflare Pages (deployed via Wrangler / GitHub Actions).

---

## 📖 Project Overview

### Core Feature Areas

1. **Missions (project-based learning)**: The core learning product. A Mission is a project-based course made of modules. Each module defines a task, an AI persona, a theory prompt, and an initial prompt so the AI can teach the topic and then evaluate the student's submission (scored out of 100, pass at 70 or above). Missions support:
   - **Squads**: small student teams, formed automatically or manually.
   - **Classes / cohorts**: groups with start/end dates and join codes.
   - Optional **plagiarism checking** via AI embeddings.
   - Payment QR codes, payment instructions, and Telegram group links.
   - Embedded **simulations** (PhET, Wokwi) inside the classroom workspace.

2. **Schools**: School profiles with admissions, enrollment management, inquiries, scholarships, and a dedicated `SchoolDashboard` for administrators.

3. **Tutors**: Tutor profiles, bookings, and student tutor-requests, with listing/detail pages and a `TutorDashboard`.

4. **Short Courses**: A simpler marketplace product alongside Missions, managed from the `CreatorDashboard`.

5. **AI Tutor "Kru Rean"**: A Gemini-powered chat assistant (`KruReanChat`) plus a `LiveVoiceTutor` for real-time voice sessions. AI usage is metered by the points economy (see below) and processed server-side through the `ai-assistant` Edge Function, which verifies affordability and deducts points using the service-role key so the economy cannot be bypassed from the client. A direct client-side fallback exists for local development.

6. **Gamified Community ("Lazy Learning")**: A Q&A-style community feed with reactions, accepted answers, and bounties. Includes leaderboards, achievements, Lucky Drops (random rewards, limited per day), Mystery Boxes, and a rewards page for redeeming points.

7. **Roles & Auth**: After signup, users must select a role (student / school / tutor / creator) before using the app. Routing is gated by session and role, with role-specific dashboards behind `ProtectedRoute`.

8. **Social Sharing (OG functions)**: The `og`, `og-school`, `og-mission`, `og-tutor`, and `og-short-course` Edge Functions generate Open Graph pages so shared links render rich previews.

### The Points Economy

Users hold two balances: **XP** (reputation, never spent) and **Points** (spendable currency).

- **Earning** (with daily limits to prevent farming): posting questions (5 XP), helpful replies (2 XP + 1 point), receiving likes (1 XP), accepted solutions (20 XP), Lucky Drops (max 3/day).
- **Spending on AI features**: chat (1 pt), answer evaluation (5 pts), lesson generation (10 pts), structured/JSON generation (10 pts), image generation (25 pts), live voice session entry (10 pts), plagiarism embedding check (1 pt), tagging the AI in community posts (10 pts).

### Codebase Structure

| Path                  | Purpose                                                                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `App.tsx`             | All routing (HashRouter) and top-level auth/session state.                                                                                                                    |
| `pages/`              | Route-level pages (Home, Explore, Schools, Tutors, Classroom, Leaderboard, dashboards, etc.).                                                                                 |
| `components/`         | Reusable UI plus feature managers (mission/school/tutor forms, community feed, chat, mystery boxes).                                                                          |
| `services/`           | All Supabase and Gemini access: `missionService`, `missionProgressService`, `schoolService`, `tutorService`, `communityService`, `gamificationService`, `geminiService`, etc. |
| `types.ts`            | The domain model (~25 interfaces: Mission, School, Tutor, ShortCourse, UserProfile, …).                                                                                       |
| `documents/`          | In-app documentation pages rendered at `/docs/*`.                                                                                                                             |
| `supabase/functions/` | Deno Edge Functions (`ai-assistant` + the `og-*` social preview functions).                                                                                                   |
| `*.sql` (root)        | Supabase setup scripts: schema, RLS policies, point triggers, and table partitioning for scalability.                                                                         |

---

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API Key
API_KEY=your_google_gemini_api_key

# Supabase Configuration (Get from Supabase Dashboard)
VITE_SUPABASE_URL=your_supabase_url
# Use the Publishable Key (Recommended)
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_fbkyJlwt7bcGtiVexvq39w_m6n4_Vxf
# Legacy Support (Optional if Publishable Key is set)
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Database Setup

Run the following SQL scripts in the **Supabase SQL Editor** to set up the schema, security, and functions.

### 4. Storage Buckets

In Supabase Storage, create a public bucket named **`Rean`**.
Create the following folders inside: `avatars`, `school-logos`, `school-covers`, `course-covers`, `missions`, `rewards`.

**Storage Policy**: Ensure the `Rean` bucket has policies allowing:

- **Select**: Public (give access to `anon` role).
- **Insert/Update/Delete**: Authenticated users only.

### 5. Edge Functions

To enable the server-side AI processing and secure point deduction:

1.  Make sure you have the Supabase CLI installed.
2.  Deploy the functions:

```bash
supabase functions deploy ai-assistant --no-verify-jwt
supabase functions deploy og --no-verify-jwt
supabase functions deploy og-school --no-verify-jwt
supabase functions deploy og-mission --no-verify-jwt
```

3.  Set the secrets for the function:

```bash
supabase secrets set GOOGLE_API_KEY=your_gemini_key
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set APP_PUBLISHABLE_KEY=sb_publishable_fbkyJlwt7bcGtiVexvq39w_m6n4_Vxf
supabase secrets set APP_SECRET_KEY=your_service_role_key
```

### 6. Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to start learning!

## 🚀 CI/CD Architecture

This project uses **GitHub Actions** for Continuous Integration and Continuous Deployment (CI/CD), following professional DevOps best practices to ensure high code quality and reliable deployments.

- **Automated Code Quality & Testing:** Every push and Pull Request triggers a pipeline that enforces formatting (`Prettier`), type safety (`TypeScript`), and runs unit tests (`Vitest`).
- **Fail-Fast Strategy:** The `build` and `deploy` jobs are strictly dependent on the tests passing. If a test fails, the pipeline aborts to prevent broken code from being built.
- **Preview Environments:** Pull requests automatically generate temporary, isolated Cloudflare Preview URLs. This allows for QA and stakeholder review before merging.
- **Continuous Deployment:** Code merged into the `main` branch is automatically built and deployed to the live **Cloudflare Pages** production environment with zero human intervention.

## 🤝 Contributing

REAN is a community project. Contributions of code, documentation, translations, and
ideas are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md), which explains the
workflow and the Developer Certificate of Origin (DCO) sign-off we use (`git commit -s`).

## 📄 License

- **Application code** is licensed under the **GNU Affero General Public License v3.0 or
  later (AGPL-3.0-or-later)**. See [LICENSE](./LICENSE) for the full text.
- **Documentation and written content** (the `docs/` folder and other prose) are
  licensed under **Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)**.
- The **REAN name and logo** are trademarks and are not covered by the code license. See
  [TRADEMARK.md](./TRADEMARK.md).

REAN is free for everyone in Cambodia to use. The project sustains itself through
community support, donations, grants, and training rather than by selling the software.

> **Note on AGPL and network use:** Because REAN is delivered as a web service, AGPL
> section 13 asks that users interacting with a modified version over a network be able
> to obtain its source. A common way to satisfy this is a visible "Source code" link in
> the app footer pointing to this repository (or to your fork, if you run a modified
> version).

## 🙏 Acknowledgements

REAN is incubated by the **CamboVerse Center** at the **National University of
Management (NUM)**, Cambodia. The project is built for the Cambodian learning community
and sustained through community support, donations, grants, and training.
