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
