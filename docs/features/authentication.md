# Authentication & Roles

REAN uses Supabase Auth with Google as the sign-in provider. After the first sign-in,
every user must choose a role before they can use the app. Access to pages is then gated
by session and role.

**Relevant code:** `services/authService.ts`, `services/supabaseClient.ts`,
`components/LoginPage.tsx`, `components/RoleSelectionPage.tsx`,
`components/ProtectedRoute.tsx`, `App.tsx`.

## Who uses it

- **Everyone.** Authentication is the entry point for all roles.

## Sign-in flow

1. A visitor opens the app. Public pages (Home, Schools, Tutors, Explore, Mission
   Detail, Docs, License) are viewable without logging in.
2. To interact, the user signs in with **Google** (`signInWithGoogle`), which uses
   Supabase OAuth and redirects back to the app's origin.
3. On return, `App.tsx` reads the session with `supabase.auth.getSession()` and listens
   for changes via `onAuthStateChange`.
4. The app loads the user's profile with `getCurrentUserProfile`.

## Role gating

- If the user is **logged in but has no role**, the app blocks every route except the
  Role Selection page and the License page. The user must pick one of Student, Tutor,
  School, or Business (`RoleSelectionPage.tsx`).
- Choosing a role calls `updateUserRole`, which saves it to the user's profile.
- Once a role is set, the full app unlocks.

See [User Roles](../user-roles.md) for what each role can do.

## Protected routes

`components/ProtectedRoute.tsx` wraps routes that require a session. Public vs.
protected routes are declared in `App.tsx`:

- **Public:** `/`, `/schools`, `/school/:id`, `/course/:id`, `/tutors`, `/tutor/:id`,
  `/explore`, `/profile/:id`, `/mission/:id`, all `/docs/*`, `/license`, `/login`.
- **Protected:** `/account`, `/chat`, `/community`, `/community/question/:id`,
  `/school/dashboard`, `/creator`, `/tutor/dashboard`, `/classroom/:id`,
  `/leaderboard`, `/rewards`.

## Helper functions (`authService.ts`)

- `signInWithGoogle()`: start Google OAuth.
- `signOut()`: end the session.
- `getCurrentUser()`: the raw Supabase auth user.
- `getCurrentUserProfile()`: the app profile (includes role, XP, points, level).
- `getUserProfileById(id)`: another user's public profile.
- `updateUserRole(role)`: set the user's role.
- `hasRole(role)`: check whether the current user has a given role.

## Session behavior

The app keeps session state at the top level (`App.tsx`) and re-checks the profile
whenever auth state changes, so role changes and sign-outs are reflected immediately.
Routing uses `HashRouter`, which suits static hosting on Cloudflare Pages.
