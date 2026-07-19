# User Roles

REAN has five roles. Four of them are selectable by users during onboarding, and one
(Admin) is assigned internally. The role type is defined in `types.ts`:

```ts
export type UserRole = 'student' | 'tutor' | 'school' | 'business' | 'admin';
```

After a user signs in for the first time, they are required to choose a role on the
Role Selection screen (`components/RoleSelectionPage.tsx`) before they can use the app.
Routing and dashboards are gated by this role.

---

## 1. Student (សិស្ស / និស្សិត): "Learner"

The default and most common role. Students consume the platform: they learn, ask
questions, and earn rewards.

**What a Student can do:**

- Browse and enroll in **Missions** (project-based courses) and **Short Courses**.
- Work through mission modules in the Classroom, submit work, and get AI grading.
- Join or be assigned to a **squad** and a **class/cohort** inside a mission.
- Find and book **Tutors**, submit tutor **requests**, and complete homework.
- Apply to **Schools** through admissions and inquiries.
- Participate in the **Community (Lazy Learning)**: ask questions, reply, react, and
  get answers accepted.
- Chat with the **AI Tutor (Kru Rean)** and use the **Live Voice Tutor**.
- Earn **XP** and **Points**, level up, claim **rewards**, open **Mystery Boxes**, and
  win **Lucky Drops**.
- Track progress on the **Leaderboard** and collect **Achievements**.

**Primary screens:** Home, Explore, Schools, Tutors, Classroom, Community, Leaderboard,
Rewards, Account.

---

## 2. Tutor (គ្រូបង្រៀន): "Educator"

Independent teachers who offer their services to students.

**What a Tutor can do:**

- Create and manage a **tutor profile** (bio, subjects, rates, availability).
- Receive and manage **bookings** from students (accept, reject, complete).
- Browse **student requests** and apply to them.
- Run sessions, keep **classroom logs**, and assign/collect **homework**.
- Everything a Student can do in the community and economy (tutors are also learners).

**Primary screen:** Tutor Dashboard (`pages/TutorDashboard.tsx`), plus the public
Tutor Detail page that students see.

---

## 3. School (សាលារៀន): "Institution"

Schools and educational institutions that publish a presence and recruit students.

**What a School can do:**

- Create and manage a **school profile** (logo, cover, description, contact).
- Publish **admissions** programs and **scholarships**.
- Offer **Short Courses** and manage **course enrollments**.
- Receive and respond to student **inquiries** (track status: new, contacted, closed).
- Manage the pipeline of applicants through the **School Dashboard**.

**Primary screen:** School Dashboard (`pages/SchoolDashboard.tsx`), plus manager
components for admissions, courses, enrollments, and inquiries.

---

## 4. Business (ក្រុមហ៊ុន): "Partner"

Companies and organizations that partner with REAN, primarily to create learning
Missions and recruit talent.

**What a Business can do:**

- Create and manage **Missions** through the **Creator Studio / Creator Dashboard**.
- Define mission **modules**, AI personas, tasks, and grading.
- Set up **classes/cohorts** and manage enrolled students and their squads.
- Approve or reject **payment receipts** for paid missions.
- Create **Mystery Boxes** and **rewards**, and fulfill reward claims.

**Primary screen:** Creator Dashboard (`pages/CreatorDashboard.tsx`).

> Note: In the code, Mission creation and the Creator Studio are gated by a "creator"
> capability check (see `canAccessStudio` in `components/Header.tsx`). Both Business
> partners and Schools/Admins can act as mission creators.

---

## 5. Admin: Internal

Not selectable on the Role Selection screen. Admins are assigned internally and have
elevated access across the platform.

**What an Admin can do:**

- Everything a creator can do (missions, mystery boxes, rewards).
- Act as the platform owner for system-level actions such as awarding bounties.
- Manage content across schools, missions, and community as needed.

The `admin` role appears throughout the services as the highest-privilege check.

---

## Role Selection Flow

1. A new user signs in with Google.
2. If the user has no role yet, the app blocks all routes except the Role Selection
   page and the License page (`App.tsx`).
3. The user picks one of Student, Tutor, School, or Business.
4. `updateUserRole()` (`services/authService.ts`) saves the choice to the user's
   profile, and the app unlocks the role-appropriate experience.

See [Authentication & Roles](./features/authentication.md) for the full flow.
