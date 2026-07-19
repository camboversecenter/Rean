# REAN Documentation

This folder contains detailed documentation for the REAN platform, covering every
major feature and every user role.

REAN (រៀន means "to learn" in Khmer) is an educational marketplace for Cambodia that
connects students with schools, tutors, and AI-driven learning missions, wrapped in a
gamified community and a points-based economy.

## User Roles

Start here to understand who uses REAN and what each role can do.

- [User Roles](./user-roles.md) covers the five roles: Student, Tutor, School,
  Business (Partner), and Admin.

## Features

Each feature has its own document with a description, the people it serves, the main
screens involved, and the key rules that govern it.

| Document                                               | What it covers                                               |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| [Missions](./features/missions.md)                     | Project-based courses, modules, squads, classes, and grading |
| [Schools](./features/schools.md)                       | School profiles, admissions, enrollments, inquiries          |
| [Tutors](./features/tutors.md)                         | Tutor profiles, bookings, homework, and student requests     |
| [Short Courses](./features/short-courses.md)           | The lightweight course marketplace                           |
| [AI Tutor (Kru Rean)](./features/ai-tutor.md)          | Gemini chat, live voice tutor, grading, and image generation |
| [Community (Lazy Learning)](./features/community.md)   | Q&A feed, replies, reactions, accepted answers, bounties     |
| [Gamification & Economy](./features/gamification.md)   | XP, points, levels, rewards, mystery boxes, achievements     |
| [Authentication & Roles](./features/authentication.md) | Google sign-in, role selection, protected routes             |

## Architecture

- [Architecture](./architecture.md) explains the frontend, the service layer, the
  Supabase backend, and the Deno edge functions.

## Quick Reference

- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, React Router (HashRouter).
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **AI:** Google Gemini via `@google/genai`.
- **Hosting:** Cloudflare Pages.
- **Languages in the UI:** Khmer and English (mixed throughout).
