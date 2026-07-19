# Short Courses

Short Courses are a lightweight alternative to Missions: simpler, self-contained courses
offered mainly by Schools. They live in the same marketplace but do not carry the full
module/squad/grading machinery of a Mission.

**Relevant code:** `services/schoolService.ts`, `pages/CourseDetailPage.tsx`,
`components/ShortCourseCard.tsx`, `components/CourseCard.tsx`,
`components/SchoolCourseManager.tsx`, `documents/ShortCoursesDoc.tsx`.

## Who uses it

- **School role (and creators):** publish and manage short courses.
- **Students:** browse and enroll.

## Anatomy

A short course (`types.ts` → `ShortCourse`) is a catalog item with a title,
description, cover image, price, and other display metadata. Enrollment is tracked with
`CourseEnrollment`.

## Managing Short Courses

Schools manage their catalog from the School Dashboard / Course Manager:

- `addShortCourse` creates a course.
- `updateShortCourse` edits it.
- `deleteShortCourse` removes it.
- `fetchAllShortCourses` lists them for the public marketplace.
- `fetchCourseById` loads a single course's detail page.

## Enrolling

- A student enrolls with `enrollInCourse`.
- `getCourseEnrollmentCount` shows how popular a course is.
- `getStudentCourses` lists the courses a student has joined.
- Schools review enrollments via `getSchoolEnrollments` / `updateEnrollmentStatus`.

## Short Courses vs. Missions

| Aspect         | Short Course        | Mission                             |
| -------------- | ------------------- | ----------------------------------- |
| Structure      | Single catalog item | Multi-module "Living Syllabus"      |
| AI involvement | Minimal             | AI teaching + grading per module    |
| Group work     | None                | Squads and classes/cohorts          |
| Grading        | None                | AI scores submissions (pass at 70+) |
| Typical owner  | School              | Business / School / Admin creator   |

## Social Sharing

Short course pages get rich link previews through the `og-short-course` edge function.
