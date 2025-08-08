# Zhenren Client — Requirements & Technical Design

## 1) Goals & Principles
- Simplicity > elegance > normality > robustness > performance > functionality.
- Deliver a fast, understandable, and reliable React web SPA.
- Prefer well‑adopted, actively maintained libraries; avoid over‑engineering.

## 2) Platforms & Distribution
- Web only (Single‑Page Application, static assets).
- Built as a React SPA; deployed to a static host (e.g., Cloudflare Pages) with SPA routing fallback to `index.html`.

## 3) Information Architecture & Navigation
- Global site menu switches between:
  - Home: LLM chat powered by OpenRouter using configured model, prompt, and API key.
  - Documents: CRUD subset (Create, Read, List) + semantic Search backed by the API.
- Configuration panel is accessible globally and overlays current view.

## 4) Features & Functional Requirements

### 4.1 Home (LLM)
- Start a conversation with the selected model using the configured system prompt.
- Requirements:
  - Disabled state until both model and API key are configured.
  - Show streaming or chunked responses if supported by the provider; otherwise buffered responses.
  - Preserve input on failure; provide retry.
  - Clear, inline error messages with original provider text, HTTP status, and timestamp.
  - No server persistence is required; local ephemeral state only.
  - Token length warning: warn when prompt length exceeds a configurable threshold (e.g., ~4k tokens equivalent); do not truncate silently.
  - Streaming fallback: if streaming is unreliable or unsupported, fall back to buffered responses automatically.
- Edge cases:
  - Long prompts and responses (very large content); UI remains responsive and scrollable.
  - Rate‑limits and provider outages; present original message, suggest retry/backoff.
  - Invalid/missing API key; highlight config and offer shortcut to open panel.

### 4.2 Documents
- Create: Title + Content, POST to backend; on success, show confirmation and link to view.
- Read: Fetch and display a single document.
- List: Show recent documents; indicate when dataset is stale (cached) vs fresh.
- Last updated: Show a "Last updated <time>" timestamp for cached lists; update on successful refresh.
- Search: Semantic search against backend; show title, similarity score, and open link.
- Requirements:
  - Client‑side validation (non‑empty title/content).
  - On create failure, keep local draft until user dismisses or succeeds.
  - Loading states for all fetches; empty states with gentle guidance.
  - Update/Delete are intentionally absent; UI hides or disables them.
  - Copy error details: provide a control to copy error payload (with secrets redacted) including correlation id (if present).
- Edge cases:
  - Network loss during create/read/list/search.
  - Backend partial failure (e.g., vector store down) propagated as error.
  - Extremely long content; warn if content exceeds safe embedding size (configurable client threshold).

### 4.3 Configuration Panel
- Theme: Light/Dark toggle; persists; applies immediately.
- Model Prompt: Markdown system prompt editor with syntax highlighting and auto‑expanding text area.
  - Optional Markdown preview toggle.
- LLM Engine Choice: Fetch models from OpenRouter; allow selection; cache last successful list.
- OpenRouter API Key: Password field with visibility toggle (“eye” icon); locally stored.
- Requirements:
  - Persist settings locally via `localStorage` under stable keys.
  - If model list fetch fails, fall back to cached list and mark as “stale”; if none cached, disable selection and show error.
  - Changes take effect for subsequent LLM calls without restart.
- Edge cases:
  - No connectivity; present offline banner and disable network actions.
  - Key accidentally pasted with whitespace; trim and validate basic format.

### 4.4 Global Offline & Error Handling
- Global offline indicator and per‑action inline errors.
- Always display the original error message text (client or server) with a brief human summary; never leak secrets.
- Provide a clear next step: retry, open configuration, or check connectivity.
 - Queued retry: allow user to explicitly retry the last failed action once online; avoid auto‑retry loops.
 - Error schema awareness: parse standardized API errors `{ error, status, timestamp, correlationId }`; display correlation id when available.

## 5) Non‑Functional Requirements
- Performance: Visual feedback ≤100ms; progress indicators >300ms; avoid jank with large lists and long responses.
- Accessibility: Keyboard navigation, screen reader labels, adequate contrast, large touch targets.
- Internationalization‑ready: Strings externalizable; layouts tolerate longer text.
- Security/Privacy: API key stored locally; never logged; redact tokens in surfaced errors.

## 6) Technical Design

### 6.1 Stack & Libraries
- Framework: React + Vite + React Router (file‑based or config‑based routing as needed).
- UI: Lightweight approach with CSS variables + utility CSS (e.g., Tailwind) or a small component library; avoid mobile‑first RN UI kits.
- State: React state + lightweight Context; avoid global stores. Local drafts kept in component state.
- Data‑fetching: TanStack Query (React Query) for caching, retries (disabled by default), and stale data labeling.
- Storage: `localStorage` for client settings and drafts where applicable.
- Editor (Prompt): CodeMirror 6 with Markdown highlighting (`@codemirror/lang-markdown`), autogrow and soft wrap.
- Icons: Lucide (web package) or similar.
- Validation: `zod` for client input.
- Error boundaries: `react-error-boundary` for global catches with graceful UI.
- Feature Flags: simple env‑driven flags (e.g., `import.meta.env`) to toggle streaming, snippets, and proxy usage for experiments.

### 6.2 Data Flows
- Client → API: JSON over HTTPS to Worker endpoints.
- Model List: `GET https://openrouter.ai/api/v1/models` with cache; on failure, show cached stale list.
- LLM Calls: Direct from client to OpenRouter using stored key; no server proxy required.
 - Error Schema: API responses parsed into a standard structure; unknown shapes fall back to generic display while preserving original text.
 - Last-Updated: cache metadata stores `updatedAt` timestamps for model list and documents list; shown in UI when using cached data.

### 6.3 Error Surfacing
- Capture: Wrap fetch calls; parse JSON error payloads; include status, message, timestamp.
- Display: Inline near the action (chat input, document forms, list/search controls).
- Redaction: Mask anything resembling keys/tokens.
- Dev vs Prod: Verbose console in dev; concise UI in prod with original message intact.
 - Copy Details: Provide a "Copy details" action that copies `{message, status, timestamp, correlationId}` with sensitive values redacted.

### 6.4 Theming & Layout
- Theme via CSS variables or a lightweight theming solution; default from system or last saved setting; instant switch.
- Respect “reduce motion” for animations and micro‑interactions.

### 6.5 Packaging & Builds
- Web: Vite build (`npm run build`) outputs static assets in `client/dist`.
- Deployment: Upload `dist` to static hosting (e.g., Cloudflare Pages). Configure SPA fallback to serve `index.html` on unknown routes.

### 6.6 Code Splitting
- Load the prompt editor (CodeMirror) on demand to reduce initial bundle size on Home/Documents when editor is not visible.

### 6.7 Redaction Utility
- A shared helper removes/obscures strings matching API key/token patterns before rendering or copying error details.

## 7) Usability & Edge Cases
- Protect user drafts on navigation or errors; warn before losing unsaved content.
- Large inputs: autosave to local draft every few seconds.
- Rate limiting: explain cause; suggest waiting; do not auto‑retry aggressively.
- Long lists: virtualize if needed; but limit to recent 50 per API contract.
 - Non-unique titles: if search returns multiple identical titles, show created date to disambiguate.

## 8) Testing Strategy
- Unit: Helpers, storage adapters, error mappers, prompt editor behaviors.
- Component: Key screens with React Testing Library (JSDOM).
- Integration: Mock API and OpenRouter responses; verify offline, stale cache flows, and error surfacing.
- Manual: Web theming, keyboard navigation, and screen reader labels.
 - Additional: token-length warnings, code-split editor load path, feature flag toggles, copy-error action.

## 9) Acceptance Criteria (Samples)
- Home disabled until model + API key present; enabling happens immediately after configuration.
- Create document failure preserves user input and surfaces original server error.
- Model list fetch outage shows cached stale list and disables selection if none available.
- Errors appear inline, include original message and status, and never show secrets.
 - Copy error details copies message/status/timestamp/correlationId with secrets redacted.
 - Cached lists show a clear last-updated timestamp; refresh updates it.
