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
  - a **task** (the concrete goal, e.g. "Create a SWOT analysis"),
  - an **AI persona** (system instructions for the module's AI tutor),
  - an **initial prompt** (what the AI says to start),
  - an optional **theory prompt** (the topic the AI teaches),
  - an optional **simulation** config (PhET, Wokwi, or other embedded tool).
- **Squad settings:** `squadSize` and `squadCreation` (`auto` or `manual`).
- **Enrollment type:** `open` (public) or `invite_only` (private).
- **Optional plagiarism check** using AI embeddings.
- **Payment details:** QR code URL, payment instructions, Telegram group link.

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
   - **Brief**: the mission/module overview.
   - **Learn**: AI teaches the theory.
   - **Studio**: where the student writes their answer or does the task.
   - **Team**: the squad view.
   - **Simulation**: embedded PhET/Wokwi tools when configured.
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

When a creator enables it, submissions are embedded into vectors (`generateEmbedding`,
`saveSubmissionVector`) and compared against prior submissions (`checkPlagiarism`) to
detect copied work. The embedding check costs 1 point.

## Creator Tools

From the Creator Dashboard, a creator can:

- Create / update / delete missions (`createMission`, `updateMission`, `deleteMission`).
- Assign a mentor (`assignMissionMentor`).
- Manage classes and join codes.
- Add students by email (`addStudentByEmail`), move them between squads and classes,
  update enrollment status, and remove students.
- Approve or reject payments and view uploaded receipts (`getReceiptSignedUrl`).
- Generate a full mission structure with AI (`generateMissionStructure`).
