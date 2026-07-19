# Tutors

The Tutors feature is a marketplace connecting students with independent educators for
one-on-one or small-group teaching, bookings, and homework.

**Relevant code:** `services/tutorService.ts`, `pages/TutorListPage.tsx`,
`pages/TutorDetailPage.tsx`, `pages/TutorDashboard.tsx`, `components/TutorCard.tsx`,
`components/TutorRequestCard.tsx`.

## Who uses it

- **Tutor role:** publishes a profile and teaches students.
- **Students:** find tutors, book sessions, post requests, and submit homework.

## Tutor Profile

A tutor (`types.ts` → `Tutor`, `TutorProfile`) publishes a profile with their bio,
subjects, rates, and availability. Managed with `getMyTutorProfile`,
`updateTutorProfile`. Students browse all tutors with `fetchAllTutors` and view one with
`getTutorById`.

## Bookings

The core transaction between a student and a tutor.

- A student creates a booking (`createBooking`).
- The tutor sees incoming bookings (`getTutorBookings`); the student tracks theirs
  (`getStudentBookings`).
- Either party views a booking's detail (`getBookingById`).
- The tutor updates the booking status (`updateBookingStatus`, e.g. pending → confirmed
  → completed / cancelled).

## Student Requests

Instead of picking a tutor first, a student can post an open **request** describing what
they need (`createStudentRequest`). Tutors browse these requests
(`fetchStudentRequests`) and **apply** to the ones they can teach (`applyToRequest`).
Students can remove their request with `deleteStudentRequest`.

## Classroom Logs & Homework

Once a session is underway, the tutor can:

- Keep **classroom logs** of what was covered (`fetchClassroomLogs`,
  `createClassroomLog`).
- **Assign homework** to the student (`assignHomework`) and view assignments
  (`fetchHomeworks`).
- The student **submits homework** (`submitHomework`) for the tutor to review.

## The Tutor Dashboard

`pages/TutorDashboard.tsx` brings bookings, requests, classroom logs, and homework
together for the Tutor role.

## Social Sharing

Tutor pages get rich link previews through the `og-tutor` edge function.
