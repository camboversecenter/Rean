# Security Policy

REAN is a community education platform, and the safety of its users (many of them
students) is a priority. Thank you for helping keep it secure.

## Reporting a vulnerability

Please **do not open a public GitHub issue** for security problems.

Instead, report privately using GitHub's **"Report a vulnerability"** button under the
repository's **Security** tab (private vulnerability reporting), or contact the
maintainers at CamboVerse Center, National University of Management.

Include, where possible:

- A description of the issue and its impact.
- Steps to reproduce (a proof of concept helps a lot).
- The affected area (frontend, Supabase policies, edge functions, CI).

We aim to acknowledge reports within a few days. Please give us reasonable time to fix
the issue before any public disclosure.

## Scope notes for researchers

- The Supabase **publishable/anon key** in the client is public by design; access
  control relies on Row-Level Security and the database grants in
  `SUPABASE_HARDENING.sql`. Bypassing RLS or the wallet protections IS in scope.
- The points economy is enforced server-side (`ai-assistant` edge function and the
  `spend_points` / `award_action` RPCs). Any way to mint, duplicate, or avoid spending
  points is in scope.
- Denial-of-service and social-engineering reports are out of scope.

## Secrets

No real secrets are committed to this repository. If you believe you found one, report
it privately as above so it can be rotated before disclosure.

The app reads its Supabase URL and publishable key from environment variables only
(`.env` locally, host build settings in production). There is no hardcoded fallback
project, so a clone cannot accidentally read or write the live REAN database.

## Known dependency advisories

`npm audit` currently reports moderate advisories that have no fix inside our current
major version ranges. Each was reviewed for reachability in this codebase:

| Advisory                                                  | Status                                                                                                                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react-router` open redirect via backslash                | **Not reachable.** Every `navigate()` / `<Link to>` target is either a static path or `"/literal/" + <database UUID>`; no user-controlled string reaches a route target. |
| `react-router` deserializeErrors constructor injection    | **Not reachable.** SSR hydration only; this app is a client-rendered SPA using `HashRouter`.                                                                             |
| `prismjs` DOM clobbering (via `react-syntax-highlighter`) | Used only to syntax-highlight code inside the learning workspace. Fixing requires `react-syntax-highlighter` v16 (breaking); tracked for the next dependency sweep.      |
| `uuid` buffer bounds check (via `gaxios`)                 | Transitive dev/tooling path of `@google/genai`; not used in the browser bundle.                                                                                          |

Re-check with `npm audit --omit=dev` and please open an issue if you can demonstrate
reachability for any of the above.
