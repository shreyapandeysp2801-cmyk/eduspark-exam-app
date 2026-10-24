# Eduspark architecture

Eduspark uses TanStack Start / React with Netlify's Vite integration. `src/routes/index.tsx` mounts `src/components/eduspark.tsx`, which shares the responsive application shell across hash-based section views. `__root.tsx` owns share metadata. Existing Radix UI primitives live in `src/components/ui`; the account flow uses the shared accessible Dialog.

`src/styles.css` centralizes the ivory/sage theme and complementary forest dark theme. Use its semantic tokens instead of adding component hex colors. `src/lib/learning.ts` defines language configuration, illustrative exam metadata, sample syllabus, API client and text downloads. Extend localization keys centrally; current UI coverage is partial and English fallback is intentional.

`netlify/functions/api.mts` is the authenticated API boundary. `getUser()` verifies Identity context; every record operation scopes by owner. Never accept a client owner ID or expose the database to the client. Friend data returns only participants' request records and public username discovery, never study content. Profile privacy is a stored preference, not yet metric-sharing authorization.

`db/schema.ts` defines profiles, typed learning records, friendships and persistent AI throttling. `db/index.ts` initializes Drizzle's native Netlify adapter. `drizzle.config.ts` points migrations at `netlify/database/migrations`. Generate a named migration for every schema change; the platform applies it on deployment. Learning records use a discriminated `kind` with JSON payloads to keep the first deployment economical. Extend payload validation before adding new public mutation capabilities. Quiz answer data must never appear in the generic listing. Quiz submission locks the row and persists a single result transactionally.

`server/ollama.ts` owns provider configuration and prompt v1. Ollama is the only AI provider. Read runtime secrets through `Netlify.env`, never log them. Missing providers must produce clear failures rather than demo responses. Verify model image capabilities before sending images. Uploaded text is untrusted study data.

Preferences use local storage only for browser theme/language. User learning data belongs in the database. Downloaded text files support offline reading; do not claim service-worker sync. Timer uses local absolute deadlines while running, not a server request per second. Manual study activity is user-reported.

See README for setup, API contracts, current feature limits and verification status. No builds, type checks, tests or servers are run in the agent build environment; platform validation follows edits. Keep code readable, accessible, and avoid introducing another backend.
