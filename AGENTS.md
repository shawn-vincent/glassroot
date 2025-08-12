# Repository Guidelines

## Project Structure & Module Organization
- Root: npm workspaces for `api` and `client` plus shared configs (`biome.json`, `package.json`).
- `api/`: Cloudflare Workers API (Wrangler), D1 schema in `api/schema.sql`, entry in `api/src/index.ts`.
- `client/`: Vite + React + Tailwind app; pages in `client/src/pages`, components in `client/src/components`, hooks in `client/src/hooks`, shared utils in `client/src/lib`.
- Assets: `client/public`, `client/icons`. Mobile build scripts in `client/bin/`.

## Build, Test, and Development Commands
- `npm run dev`: run API and Web together (concurrently).
- `npm run dev:ios` | `dev:android`: run Capacitor dev targets.
- `npm run build` | `build:api` | `build:client`: production builds.
- `npm run typecheck`: TypeScript `--noEmit` for both workspaces.
- `npm run lint` | `npm run format`: Biome lint/format.
- `npm run db:migrate` | `db:migrate:local`: apply D1 migrations from `api/schema.sql`.
- Client-only preview: `npm --workspace client run preview`.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). ESM modules.
- Formatting/Linting: Biome; run `npm run format && npm run lint` before commits.
- React: components PascalCase (`FooBar.tsx`), hooks start with `use*`, pages end with `*Page.tsx`.
- Files: UI in `components/`, route screens in `pages/`, reusable logic in `hooks/` and `lib/`.

## Testing Guidelines
- No formal test suite yet. Validate changes via `npm run check`, manual smoke tests (`npm run dev`), and API logs (`npm --workspace api run tail`).
- Prefer small, pure functions in `lib/` and `utils/` to ease future unit testing.

## Commit & Pull Request Guidelines
- Commits: conventional style observed in history (e.g., `feat: …`, `fix: …`, `refactor: …`, `chore: …`).
- PRs: clear description, linked issues, before/after screenshots for UI, steps to reproduce/verify, and note any schema or env changes.
- CI expectations: pass `typecheck`, `lint`, and build locally before requesting review.

## Security & Configuration Tips
- Secrets and bindings configured via `wrangler.toml`/environments; never commit secrets.
- For D1: run local migrations before pushing; confirm production migration plan on staging first (`deploy:staging`).
