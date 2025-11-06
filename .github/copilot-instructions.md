## Tasktix — Copilot instructions

Be concise and make edits that follow the repository's conventions. This file explains the "why", common workflows, and precise references so an AI coding agent can be productive immediately.

- Project type: Next.js (App Router) + TypeScript. App lives in `app/`. API route implementations are under `app/api/*` and are server-side.
- Main domain logic and utilities live in `lib/` and `model/`. Tests mirror these folders: `lib/*.test.ts`, `model/*.test.ts`.
- Database: MariaDB via Docker Compose. SQL scripts live in `scripts/database/` (notably `create.sql` and `seedTests.sql`). Test scripts assume a test DB named `tasktix_test` and a root password `password` (see `package.json` scripts).

High-value tasks an AI should do first

- Small bug fixes and type improvements: follow `tsconfig.json` (strict true). Prefer minimal, safe edits and add/adjust unit tests in the corresponding `*.test.ts` file.
- When changing behavior that touches persistence or e2e flows, update/inspect `scripts/database/seedTests.sql` and the Docker compose setup (`compose.yaml`, `compose.override.yaml`).

Key developer workflows (concrete commands)

- Start dev (recommended): `npm start` — uses Docker Compose to build and run the app. This is the canonical dev flow used by scripts.
- Stop dev: `npm stop`; teardown: `npm run teardown` (removes containers)
- Run unit tests: `npm run test:jest` (uses `jest` + `ts-jest` preset). Unit tests live under `lib/` and `model/`.
- Run full test suite (unit + e2e): `npm test` — runs Jest then Cypress.
- Run e2e locally (script handles DB/app lifecycle): `npm run test:cy` or `npm run cy:open` to open Cypress.
- Test DB helpers: `npm run testdb:reset` and `npm run testdb:seed` (they execute SQL against the `tasktix_test` DB inside the mariadb container).

Conventions and patterns to follow (concrete examples)

- Types & domain: `model/*` contains typed domain objects and factories (e.g. `model/list.ts`, `model/listItem.ts`). Add types there rather than scattering them.
- Database access: see `lib/database/*` and `lib/db_connect.ts`. Keep SQL and DB-specific logic contained in `lib/database`.
- API routes: `app/api/<resource>/route.ts` or nested handlers — prefer server-side implementations and keeping validation in `lib/validate.ts` / `validate.test.ts`.
- State & UI: components under `components/` use React + Next.js patterns. Shared client logic (e.g., reducers, contexts) lives under `components/Sidebar` and `components/SearchBar` (look at `listContext.ts` and `listReducer.ts`).
- Response envelope: server responses use classes in `Response/` (e.g., `Success.ts`, `ClientError.ts`). When returning API payloads follow this pattern.

Testing & CI specifics

- Jest collects coverage and uses `ts-jest`. See `jest.config.js` for coverage exclusions (database helpers excluded).
- Cypress config sets `baseUrl` to `http://localhost:3000` and removes successful-run videos to save disk (`cypress.config.ts`). Ensure the app is listening at port 3000 for e2e runs.
- CI relies on `danger` and linters (`eslint`) — keep ESLint/Prettier rules intact.

Integration points and environment

- Docker Compose files (`compose.yaml`, `compose.override.yaml`) spin up `mariadb` used in development and testing. The `start`/`start:test` scripts set the environment variables expected by the backend (DB host, user, password, database).
- `.env` is required locally for DB credentials (see README.md). Do not hardcode secrets.

Examples (copyable guidance)

- To run unit tests only and view coverage: `npm run test:jest`.
- To run e2e in CI-like fashion (start test DB, run Cypress, teardown): `npm run test:cy` (the script orchestrates start/stop). If you need to run the app manually before Cypress, use `npm run start:test` and then `npm run cy:open`.

What NOT to change without confirmation

- Docker compose service names, test DB name (`tasktix_test`), and the test DB password used by CI scripts — changing these breaks the test orchestration.
- `tsconfig.json` path aliases (`@/*`) and Jest presets unless tests are updated accordingly.

Where to look for more context

- App routes & pages: `app/` (root of app router). Start with `app/page.tsx`, `app/layout.tsx` and `app/api/*` for server endpoints.
- Domain & DB: `lib/` and `model/` (and `lib/database/`).
- Tests and examples: `lib/*.test.ts`, `model/*.test.ts`, and `cypress/e2e/**`.

If you need more details

- Ask for missing CI commands, environment values, or desired tone/level of change. If a behavior touches CI or DB orchestration, prefer to propose a small patch and run tests rather than large refactors.

— End of copilot instructions —
