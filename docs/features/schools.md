# Schools

The Schools feature lets institutions publish a public presence on REAN and recruit
students through admissions, scholarships, short courses, and inquiries.

**Relevant code:** `services/schoolService.ts`, `pages/SchoolsListPage.tsx`,
`pages/SchoolDetailPage.tsx`, `pages/SchoolDashboard.tsx`, `components/SchoolForm.tsx`,
`components/SchoolCard.tsx`, `components/SchoolAdmissionManager.tsx`,
`components/SchoolCourseManager.tsx`, `components/SchoolEnrollmentManager.tsx`,
`components/SchoolInquiryManager.tsx`.

## Who uses it

- **School role:** owns and manages a school profile.
- **Students:** browse schools, apply through admissions, and send inquiries.

## School Profile

Each school (`types.ts` → `School`) has a profile with a logo, cover image,
description, and contact details. A user with the School role creates their school with
`createMySchool` and edits it with `updateSchoolProfile`. Public visitors view it on the
School Detail page.

## Admissions

Schools publish **admission programs** (`Admission`) describing what they offer and how
to apply. Managed with `addAdmission`, `updateAdmission`, `deleteAdmission`.

## Scholarships

Schools can advertise **scholarships** (`Scholarship`) to attract students, added with
`addScholarship` and removed with `deleteScholarship`.

## Short Courses

Schools can offer **Short Courses** as a lightweight product. See the dedicated
[Short Courses](./short-courses.md) document. Course management functions live in the
school service: `addShortCourse`, `updateShortCourse`, `deleteShortCourse`.

## Inquiries

Students can send an **inquiry** to a school (`createStudentInquiry`). The school sees
incoming inquiries (`getMyInquiries`) and updates their status as the conversation
progresses (`updateInquiryStatus`, e.g. new → contacted → closed) via the Inquiry
Manager.

## Enrollments

Schools manage the students enrolled in their courses:

- `getSchoolEnrollments` lists applicants/enrolled students.
- `updateEnrollmentStatus` moves an application through its lifecycle.
- `getCourseEnrollmentCount` shows how many students a course has.

## The School Dashboard

`pages/SchoolDashboard.tsx` is the control center for the School role, combining the
admission, course, enrollment, and inquiry managers in one place.

## Social Sharing

School pages get rich link previews through the `og-school` edge function, so a shared
school link shows a proper Open Graph card.
