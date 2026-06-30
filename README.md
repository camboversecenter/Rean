# REAN - Educational Marketplace (Cambodia)

REAN is a comprehensive educational platform connecting students with schools, tutors, and AI-driven learning missions. It features a gamified community, real-time AI tutoring, and a marketplace for short courses.

## Tech Stack

- **Frontend**: React (v18+), TypeScript, Tailwind CSS, Lucide React.
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **AI**: Google Gemini API (@google/genai).
- **Build Tool**: Vite.

---

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API Key (Get from aistudio.google.com)
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

*   **Automated Code Quality & Testing:** Every push and Pull Request triggers a pipeline that enforces formatting (`Prettier`), type safety (`TypeScript`), and runs unit tests (`Vitest`).
*   **Fail-Fast Strategy:** The `build` and `deploy` jobs are strictly dependent on the tests passing. If a test fails, the pipeline aborts to prevent broken code from being built.
*   **Preview Environments:** Pull requests automatically generate temporary, isolated Cloudflare Preview URLs. This allows for QA and stakeholder review before merging.
*   **Continuous Deployment:** Code merged into the `main` branch is automatically built and deployed to the live **Cloudflare Pages** production environment with zero human intervention.
