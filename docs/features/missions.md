# Missions (Project-Based Learning)

Missions are the core learning product of REAN. A Mission is a project-based course
built from a sequence of modules. Students learn a topic from the AI, complete a
practical task, and submit their work for AI grading before unlocking the next module.

**Relevant code:** `services/missionService.ts`, `services/missionProgressService.ts`,
`components/MissionWorkspace.tsx`, `components/MissionManager.tsx`,
`components/MissionForm.tsx`, `components/MissionClassManager.tsx`,
`pages/MissionDetailPage.tsx`, `pages/ClassroomPage.tsx`, `pages/CreatorDashboard.tsx`.

## Who uses it

- **Business / School / Admin (creators):** create and manage missions.
- **Students:** enroll in and complete missions.
- **Mentors (tutors or staff):** can be assigned to a mission to guide students.

## Anatomy of a Mission

A Mission (`types.ts` → `Mission`) contains:

- **Title, description, thumbnail, category, level** (Beginner / Intermediate / Advanced).
- **Price** (missions can be free or paid).
- **Modules**: the "Living Syllabus". Each module (`MissionModule`) has:
  - a **task** (the assignment the student hands in, e.g. "Create a SWOT analysis"),
  - an optional **objective** (student-facing prose describing what the student will be
    able to do after the lesson),
  - optional **key points** (a list of the main ideas, tricks, and common mistakes),
  - an **AI persona** (system instructions for the module's AI tutor),
  - an **initial prompt** (what the AI says to start),
  - an optional **theory prompt** (the topic the AI teaches),
  - an optional **simulation** config (PhET, Wokwi, or other embedded tool).
- **Squad settings:** `squadSize` and `squadCreation` (`auto` or `manual`).
- **Enrollment type:** `open` (public) or `invite_only` (private).
- **Optional plagiarism check** using AI embeddings.
- **Payment details:** QR code URL, payment instructions, Telegram group link.

Note the split in audience among the module fields. **Objective** and **key points**
are written for the student and appear on the Brief tab. **Theory prompt** and
**AI persona** are written for the AI and are never shown directly, except that the
theory prompt stands in on the Brief tab when no objective was authored. Modules are
stored as JSONB, so these fields need no database migration and older missions simply
omit them.

## Classes / Cohorts

A Mission can be split into **classes** (`MissionClass`), such as "Semester 1 - 2025"
or "Weekend Group". Each class has optional start/end dates and a **join code**.
Managed via `getMissionClasses`, `createMissionClass`, `deleteMissionClass`.

## Squads

Students are grouped into small **squads** (teams). Squads can be formed automatically
by the platform or assigned manually by the creator. Squad members collaborate and can
share a squad note. See `getSquadMembers`, `updateStudentSquad`, `updateMissionSquadNote`.

## The Student Journey

1. **Discover** a mission on the Explore page or Mission Detail page.
2. **Enroll** (`enrollInMission`). For paid missions, the student uploads a **payment
   receipt**; the creator later approves or rejects it (`approvePayment`,
   `rejectPayment`). Enrollment status flows through pending → active.
3. **Learn** in the Classroom (`MissionWorkspace.tsx`), which has tabs:
   - **Brief**: the lesson brief. What the lesson teaches, the key points, a step by
     step map of how the lesson works, and study tips. The assignment is deliberately
     not shown here.
   - **Learn**: AI teaches the theory.
   - **Studio**: the practice screen. The task appears in a collapsible card at the
     top so it stays visible while the student writes their answer below it.
   - **Team**: the squad view.
   - **Simulation**: embedded PhET/Wokwi tools when configured, with the same task
     card and any lab instructions.
4. **Submit** work in the Studio tab (text or image).
5. **Get graded** by the AI (see below), or reviewed by a mentor (`reviewSubmission`).
6. **Advance**: passing unlocks the next module. Module status is one of
   `locked`, `active`, `review`, `completed`.

## Grading

Submissions are evaluated by Google Gemini through the `ai-assistant` edge function
(`evaluateSubmission`, `evaluateImageSubmission` in `services/geminiService.ts`).
The AI returns a score out of 100 with feedback. **A score of 70 or above passes.**
Grading costs points from the student's balance (evaluation = 5 points).

## Plagiarism Check (optional)

A creator turns this on per mission with **Enable Plagiarism Check (AI)** in the mission
form (`missions.enable_plagiarism_check`). When it is on, handing work in goes like this:

1. Answers shorter than `PLAGIARISM_MIN_CHARS` (50) are skipped — a one-line answer
   resembles everyone's and the score would mean nothing.
2. The answer is embedded through the `ai-assistant` edge function (`embed`, 1 point) and
   compared against classmates' submissions for the same module with the
   `match_submissions` RPC (`checkPlagiarism`).
3. A cosine similarity at or above `PLAGIARISM_THRESHOLD` (0.85) blocks the submission:
   the student is told to write it themselves and **the answer is never sent for
   grading**, so no evaluation points are spent.
4. Otherwise the answer is graded as usual, and if it passes it joins the corpus
   (`saveSubmissionVector`) for the next student to be checked against. The vector from
   step 2 is reused, so a submission is only ever embedded once.

The student's own enrollment is excluded from the search, so retrying a lesson never
flags them against themselves; a retry replaces their stored vector.

The check **fails open**: if the embedding or the search fails, the submission proceeds
and the failure is logged rather than blocking the student on an outage.

Requires `SUPABASE_PLAGIARISM.sql` (pgvector, the `submission_embeddings` table with its
RLS policies, and the `match_submissions` function). Submission text is readable only by
its author and by the mission owner/mentor; `match_submissions` is `SECURITY DEFINER` and
returns similarity scores only — never another student's text — and only to someone
inside the mission.

## Creator Tools

From the Creator Dashboard, a creator can:

- Create / update / delete missions (`createMission`, `updateMission`, `deleteMission`).
- Assign a mentor (`assignMissionMentor`).
- Manage classes and join codes.
- Add students by email (`addStudentByEmail`), move them between squads and classes,
  update enrollment status, and remove students.
- Approve or reject payments and view uploaded receipts (`getReceiptSignedUrl`).
- Generate a full mission structure with AI (`generateMissionStructure`).
