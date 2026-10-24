# Eduspark

A responsive study workspace for JEE Main and NEET UG, built with React, TypeScript, TanStack Start, Tailwind, Lucide, Netlify Functions, Netlify Identity, and Netlify Database with Drizzle.

## Run and deploy

Use Node 22.23+ and `pnpm install`. For local development, run `netlify dev --port 8889` on a linked Netlify site. Deploy through the linked Git repository. Netlify runs the configured build and applies the generated database migration automatically. Do not apply migrations manually. The database is provisioned on first connection. Identity activation has been requested by the feature activation script. Email confirmations depend on the site's Identity email configuration. Google login only appears when its provider is enabled in Identity settings.

## Ollama setup

Install Ollama on a server you control, then run `ollama pull gemma3:4b` and `ollama serve`. Choose another compatible Gemma or downloaded Llama model by changing `OLLAMA_MODEL`. Do not expose an unauthenticated Ollama server publicly. Put it behind authenticated HTTPS infrastructure reachable from Netlify, and set `OLLAMA_BASE_URL` to that endpoint. A computer's localhost is not accessible from hosted functions. If the reverse proxy uses a bearer credential, configure `OLLAMA_AUTH_TOKEN` server-side. No endpoint credentials are included in browser code.

Runtime environment names: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, optional `OLLAMA_AUTH_TOKEN`, `AI_REQUEST_TIMEOUT` (milliseconds, capped at 50 seconds), `AI_MAX_OUTPUT_LENGTH` (tokens, capped at 4096), and `AI_DEFAULT_LANGUAGE`. `.env.example` contains names and nonsecret defaults. Database and Identity connections use Netlify's managed runtime; do not supply browser database credentials. No hosted AI fallback is used. Image capabilities are checked through Ollama `/api/show` before sending an image.

## Workflows

The sample dashboard is explicitly marked as demo data. Sign in to use private saved notes, materials, tutor explanations, bookmarks, progress records, manual and focus sessions, scheduled tasks, flashcard review, and friend requests. Accounts without activity show empty or zero values. Notes support text imports and offline text downloads. Study materials support summaries, formulas, text mind maps and flashcard generation. Quiz generation validates structured output, hides correct answers, and scores submissions on the server using +4/−1 rules. Submissions are serialized and idempotent. Topic checkboxes drive the illustrative syllabus completion percentage. The focus timer uses an absolute deadline without server polling.

Spaced revision repeats failed recall after one day; good recall doubles and easy recall triples the prior interval, capped at 90 days. The simple planner allocates 45-minute sessions to incomplete topics on successive available dates, avoiding existing sessions. It does not yet optimize all daily budgets or infer topic priorities. Friend search discloses only username and account ID. All learning content stays private, including when the profile's future sharing preference is set to friends.

## API

All endpoints require a verified Identity session cookie and derive ownership server-side. No browser-supplied owner ID is trusted. Database access is exclusively server-side; this application does not expose a SQL/REST database client or use Supabase RLS.

- `GET/POST /api/profile`: read or update username, privacy and preferences.
- `GET/POST /api/records`: list owned content (quiz answers excluded), create supported learning records.
- `PUT/DELETE /api/records/:id`: change or delete an owned editable record. Scored attempts and quiz content cannot be rewritten.
- `POST /api/ai`: `{prompt, language, mode, level?, image?}`; mode is tutor, doubt, summary, translation, flashcards, mindmap, notes, formulas or quiz. Eight requests per user per minute. Images are base64, maximum 2 MB through the UI.
- `POST /api/quiz/submit`: `{id, answers, seconds}` returns score and explanations. Correct answers are available only after submission.
- `GET /api/friends?search=username`: username-prefix discovery. Without search, list own friendship records.
- `POST /api/friends`: `{recipient, action}` where action is request, accept, remove or reject. Only the recipient can accept a pending request.

## Verification and current limits

Source files, generated migration, endpoint ownership predicates, quiz answer projection, and configuration were reviewed. Dependency installation, migration generation and the Identity activation script completed successfully. This run did not execute builds, tests, type checking or a development server because the hosting workflow reserves validation for the deployment pipeline. No registration, database round trip, AI output, browser layout, or deployment success is claimed as verified.

This is an initial functional foundation, not complete coverage of every requested feature. Ollama requires a configured reachable endpoint; no live model request was verified. OCR, image note scanning, private binary uploads, PDF export, structured graphical mind maps, verified video references, full-length timed mock exams, push/email reminders, friend metric sharing/leaderboards, automatic quiz-to-topic completion, achievement awards, and service-worker offline sync are not implemented. Text downloads provide offline reading, not an offline application. AI calls are buffered rather than streamed. UI translations currently cover English and Hindi navigation; other UI strings fall back to English, while all 18 requested output languages and Arabic/Urdu RTL layouts are selectable. AI language quality and speech availability depend on the model/browser. Representative syllabus topics and sample patterns are illustrative; official sources are linked for confirmation, not asserted as independently validated current exam rules.
