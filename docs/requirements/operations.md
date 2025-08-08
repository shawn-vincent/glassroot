# Zhenren Operations — Requirements & Technical Design

## 1) Operational Goals
- Great DX: fast local setup, one‑command dev, tight feedback loops.
- Two push‑based deployments: staging and production released via Git pushes.
- Safe deploys: previews, health checks, rollbacks, and minimal toil.
- Foundation for rapid prototyping: clear scripts, sensible defaults, and simple patterns.

Principles: Simplicity > elegance > normality > robustness > performance > functionality.

## 2) Repos, Branching, Environments
- Monorepo structure (root with workspaces `client` and `api`).
- Branch strategy:
  - `main`: production branch.
  - `develop`: staging branch.
  - Feature branches: `feat/*`, `fix/*` with PRs into `develop`.
- Environments:
  - Local: dev with hot reload, local D1 (where possible), real Vectorize (optional) or stub.
  - Staging: auto‑deploy on push to `develop` (both API and Web), for product QA.
  - Production: auto‑deploy on tagged release or push to `main` (guarded).

## 3) Toolchain & System Requirements
- Node.js LTS (v20+), npm 10+.
- Cloudflare Wrangler CLI (`npm i -g wrangler`).
- Expo CLI (`npx expo`), EAS CLI (optional for native builds).
- Biome (ships in workspaces), TypeScript.
- GitHub Actions (or your CI) with secrets configured.

## 4) Configuration & Secrets Management
- Secrets are stored in CI and Cloudflare (Workers/Pages) environment configuration:
  - Cloudflare API Token (CI secret) for deployments.
  - Cloudflare account, zone identifiers where required.
  - Worker bindings per environment:
    - D1: `DB` (staging `zhenren-staging`, prod `zhenren`).
    - Vectorize: `VECTORS` (staging `zhenren-vectors-staging`, prod `zhenren-vectors`).
    - AI: `AI` (present in both envs).
- Client runtime config:
  - Web base URL for API per environment (Pages env variables or build‑time .env).
  - No client secret is bundled; OpenRouter key is user‑provided at runtime and stored locally on device/browser.

## 5) Local Development Workflow (DX)
- First‑time setup:
  - `npm install` at repo root; workspaces install via root scripts.
  - Ensure `wrangler.toml` in `api/` is bound to a local D1 (or use `--local` mode).
  - Optional: create and seed local D1: `wrangler d1 execute <DB_NAME> --file api/schema.sql`.
  - Create Vectorize index in Cloudflare dashboard for dev testing, or toggle the dev flag to bind to prod index for experimentation.
- One‑command dev:
  - Root: `npm run dev` launches client web via Expo Router and API via Wrangler with CORS.
- Quality loop:
  - `npm run check` (typecheck + lint) at root and in workspaces.
  - Biome auto‑format on save (editor integration recommended).
- Native/devices:
  - `npm run client:ios` / `client:android` for simulators.
  - `npm run client:electron` for desktop wrapper.

## 6) CI/CD — Two Push‑Based Deployments
- CI: GitHub Actions (reference) with two workflows:
  1) `staging.yml` (trigger: push to `develop` or PR merge to `develop`)
     - Steps: install → typecheck/lint → build client web → deploy API to Workers (staging env) → deploy web to Cloudflare Pages (staging project).
  2) `production.yml` (trigger: push to `main` or `v*` tag)
     - Steps: install → typecheck/lint → build client web → apply D1 migrations → deploy API to Workers (prod env) → deploy web to Pages (prod project).
- Required CI secrets:
  - `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
  - `PAGES_PROJECT_NAME_STAGING`, `PAGES_PROJECT_NAME_PROD` (if distinct), or reuse with env aliases.
  - D1/Vectorize ids configured in environment‑specific `wrangler.toml` sections or via env vars.
- Deployment artifacts:
  - Client: `client/dist/web` from `expo export -p web`.
  - API: Worker bundle from `api/` via `wrangler deploy`.

### Example CI Steps (Conceptual)
- Install: `npm ci` at root.
- Check: `npm run check`.
- Build Web: `npm run client:build` (exports web bundle).
- Migrate D1 (prod only or when schema changes): `wrangler d1 execute <DB> --file api/schema.sql`.
- Deploy API: `npm run api:deploy` with `--env staging|production` as needed.
- Deploy Web: `wrangler pages deploy client/dist/web --project-name <project> --branch <env-branch>` or use Pages Git integration.

## 7) Database & Vector Index Operations
- D1 schema management:
  - Source of truth: `api/schema.sql`.
  - Apply in staging before production; ensure idempotency or version migrations (consider adopting Wrangler migrations or Drizzle in future).
  - Backup schedule: nightly export to R2 or external storage (manual/cron), retain 7–30 days.
- Vectorize index management:
  - Separate indices per environment.
  - Monitor vector count growth and quotas; document index recreation steps if model changes.

## 8) Observability & Monitoring
- Logging:
  - Workers: use `console` logs with structured JSON; enable `wrangler tail` during incidents.
  - Client: integrate Sentry (optional) to capture runtime errors and user agent context; no secrets included.
- Metrics:
  - Cloudflare Analytics for Workers requests, duration, errors.
  - Track key events: create doc, search, error rates.
- Alerts:
  - Uptime monitors on API and Web (e.g., UptimeRobot) for 5‑minute checks.
  - Error rate alert thresholds (Sentry or custom) for sudden spikes.

## 9) CORS, Security, and Rate Limiting
- CORS:
  - Staging: allow staging web origin(s) only.
  - Prod: allow prod web origin(s) only.
- Rate limiting:
  - Cloudflare Firewall rules per route IP throttle (low effort), refined later.
- Headers:
  - Add security headers on the web site (Pages) and consider minimal headers on API (e.g., `X-Content-Type-Options: nosniff`).
- Secrets hygiene:
  - No secrets stored in repo; CI secrets only.
  - Error payloads must redact tokens before returning to clients.

## 10) Rollouts, Previews, and Rollbacks
- Preview deployments:
  - Pages: enable PR previews automatically.
  - Workers: optional preview environment (`--env preview` or namespaced worker) for PRs touching API.
- Progressive delivery:
  - Staging soak period (e.g., 30–60 minutes) before promoting to prod.
- Rollback:
  - Workers: revert to previous deployment via Wrangler/Cloudflare dashboard.
  - Pages: redeploy last green build.
  - D1: restore from recent backup if schema mutation causes incident (rare in v1).

## 11) Quality Gates & Code Health
- Lint/format/typecheck must pass in CI before deploy.
- Optional pre‑commit hooks (Husky or Lefthook) to run `biome format` and `tsc --noEmit`.
- Dependency hygiene: Dependabot or Renovate for updates (weekly cadence).
- Conventional Commits + auto‑changelog (optional) for release notes.

## 12) Onboarding Checklist
- Install Node LTS, Wrangler CLI, and Expo.
- `npm install` at root.
- `npm run dev` to launch web and API locally.
- Configure Cloudflare account locally if needed (`wrangler login`).
- For native testing, set up iOS/Android tooling per Expo docs.

## 13) Operational Runbooks (Quick Recipes)
- Recreate D1 schema (staging):
  - `wrangler d1 execute <DB_STAGING> --file api/schema.sql`
- Promote staging to prod (manual lightweight):
  - Merge `develop` → `main`, wait for CI to deploy.
- Hotfix:
  - Branch `hotfix/*` from `main`, PR into `main`, CI deploys to prod; cherry‑pick into `develop`.
- Tail logs in prod:
  - `wrangler tail --env production` in `api/`.

## 14) Performance & Capacity Planning (Lightweight)
- Targets:
  - P50: Create < 800 ms; Search < 400 ms; List/Get < 150 ms.
  - 99th percentile target: < 2–3x P50.
- Capacity:
  - Monitor Vectorize and D1 quotas; keep dataset small (prototyping).
  - If growth accelerates, explore chunking content and pagination.

## 15) Future Operational Enhancements
- Adopt Worker‑level redaction/log filtering to protect secrets.
- Add per‑route rate limits and API keys when opening to third‑party clients.
- Automated daily D1 exports to R2 with lifecycle rules.
- Add tracing (OpenTelemetry) if complexity grows.

