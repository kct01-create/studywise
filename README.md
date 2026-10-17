# StudyWise – AI Study Planner

StudyWise helps students turn an exam or assignment deadline into a clear, day-by-day study plan. A student enters a subject, topics, deadline and daily study time, and AI generates a structured plan they can save, edit and tick off as they go.

- **Live app:** https://kct01-create.github.io/studywise/
- **Repository:** https://github.com/kct01-create/studywise

## Who it is for
High-school and university students preparing for exams, finals, certifications or any deadline who want to know exactly what to study each day.

## Features
| Requirement | How it is met |
|---|---|
| Landing page | Explains the product, how it works and who it is for |
| Authentication | Email + password sign-up and sign-in (Supabase Auth), email confirmation, forgot/reset password |
| Dashboard | Home page (stats, streak, upcoming tasks) and a list of all saved plans with progress bars |
| AI study planner | Form for subject, topics, deadline and hours per day; AI returns a dated task list |
| Progress tracking | Tick tasks complete; per-plan and overall progress; daily streak counter |
| Database | Plans stored in Supabase Postgres, private to each user |
| Deployment | Static site on GitHub Pages; backend on Supabase |

Extras: edit/add/remove tasks, regenerate the unfinished part of a plan, calendar reminders (.ics export), browser notifications while the page is open, print/PDF, responsive layout with dark mode.

## Architecture
```
Browser (index.html on GitHub Pages)
   │  supabase-js
   ├── Supabase Auth ........ accounts, sessions, password reset
   ├── Supabase Postgres .... table `plans` (Row Level Security)
   └── Supabase Edge Function `generate-plan` ── Google Gemini API
```
- **Frontend:** a single static HTML file (vanilla JavaScript, no build step).
- **Backend:** Supabase (Auth, Postgres, Edge Functions).
- **AI:** the Edge Function calls the Google Gemini API from the server, so the AI key is never exposed to the browser.

## Security
- Passwords are handled by Supabase Auth; the site never stores them.
- Email must contain an `@` and match a valid address format (checked in the browser and again by Supabase). Passwords must be at least 8 characters.
- Row Level Security is enabled on `plans`. Signed-out visitors have no access, and each signed-in user can read, change and delete only their own rows.
- The Edge Function requires a valid signed-in session (JWT verification on) and limits prompt length.
- Only the public (publishable) Supabase key is in the website. The Gemini key is stored as a Supabase secret.
- The site shows only the landing and sign-in pages until a user is signed in.

## Database
`supabase/schema.sql` creates the `plans` table and its Row Level Security policies. Each plan stores its title, subject, topics, deadline, hours per day, summary and a JSON list of tasks (date, title, topic, minutes, done, doneAt).

## Setup (to run your own copy)
1. Create a Supabase project.
2. In the SQL Editor, run `supabase/schema.sql`.
3. In **Authentication → Providers**, keep Email enabled with email confirmation on and a minimum password length of 8. In **URL Configuration**, set the Site URL and Redirect URLs to your hosted address.
4. Get a Gemini API key from Google AI Studio.
5. Add it as a Supabase secret named `GEMINI_API_KEY`. Optionally set `GEMINI_MODEL` (the default is `gemini-3.8-flash`; Google retires model names over time, so change this secret if generation stops working).
6. Deploy `supabase/functions/generate-plan/index.ts` as an Edge Function named `generate-plan`, with JWT verification on.
7. In `index.html`, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (the publishable key) near the top of the script.
8. Host `index.html` on any static host, for example GitHub Pages.

## Limitations and next steps
- The AI uses Google's free tier, which is rate-limited; Google states free-tier requests may be used to improve its products. A paid plan is advisable for public use.
- There is no per-user cap on AI requests yet.
- Supabase's built-in email sender is rate-limited; a custom SMTP provider is advisable for real users.
- Browser notifications work only while the page is open; calendar (.ics) reminders work when it is closed.
- Passkey sign-in is not implemented.

## Tech stack
HTML, CSS, JavaScript · Supabase (Auth, Postgres, Edge Functions, Deno/TypeScript) · Google Gemini API · GitHub Pages
