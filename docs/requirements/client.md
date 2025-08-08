# Zhenren Client — Requirements & Technical Design

## 1) Goals & Principles
- Simplicity > elegance > normality > robustness > performance > functionality.
- Deliver a fast, understandable, and reliable multi‑platform app with minimal surprises.
- Prefer well‑adopted, actively maintained libraries; avoid over‑engineering.

## 2) Platforms & Distribution
- Web (static export), iOS, Android, and Desktop (Electron wrapper).
- Single codebase via Expo/React Native; platform‑specific affordances where necessary.

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
- Edge cases:
  - Long prompts and responses (very large content); UI remains responsive and scrollable.
  - Rate‑limits and provider outages; present original message, suggest retry/backoff.
  - Invalid/missing API key; highlight config and offer shortcut to open panel.

### 4.2 Documents
- Create: Title + Content, POST to backend; on success, show confirmation and link to view.
- Read: Fetch and display a single document.
- List: Show recent documents; indicate when dataset is stale (cached) vs fresh.
- Search: Semantic search against backend; show title, similarity score, and open link.
- Requirements:
  - Client‑side validation (non‑empty title/content).
  - On create failure, keep local draft until user dismisses or succeeds.
  - Loading states for all fetches; empty states with gentle guidance.
  - Update/Delete are intentionally absent; UI hides or disables them.
- Edge cases:
  - Network loss during create/read/list/search.
  - Backend partial failure (e.g., vector store down) propagated as error.
  - Extremely long content; warn if content exceeds safe embedding size (configurable client threshold).

### 4.3 Configuration Panel
- Theme: Light/Dark toggle; persists; applies immediately.
- Model Prompt: Markdown system prompt editor with syntax highlighting and auto‑expanding text area.
- LLM Engine Choice: Fetch models from OpenRouter; allow selection; cache last successful list.
- OpenRouter API Key: Password field with visibility toggle (“eye” icon); locally stored.
- Requirements:
  - Persist settings locally (web: localStorage; native: AsyncStorage) under stable keys.
  - If model list fetch fails, fall back to cached list and mark as “stale”; if none cached, disable selection and show error.
  - Changes take effect for subsequent LLM calls without restart.
- Edge cases:
  - No connectivity; present offline banner and disable network actions.
  - Key accidentally pasted with whitespace; trim and validate basic format.

### 4.4 Global Offline & Error Handling
- Global offline indicator and per‑action inline errors.
- Always display the original error message text (client or server) with a brief human summary; never leak secrets.
- Provide a clear next step: retry, open configuration, or check connectivity.

## 5) Non‑Functional Requirements
- Performance: Visual feedback ≤100ms; progress indicators >300ms; avoid jank with large lists and long responses.
- Accessibility: Keyboard navigation, screen reader labels, adequate contrast, large touch targets.
- Internationalization‑ready: Strings externalizable; layouts tolerate longer text.
- Security/Privacy: API key stored locally; never logged; redact tokens in surfaced errors.

## 6) Technical Design

### 6.1 Stack & Libraries
- Framework: Expo + React Native + Expo Router (file‑based routing).
- UI: Tamagui (design system, theming, primitives) + NativeWind/Tailwind utilities where helpful.
- State: React state + lightweight Context; avoid global stores. Local drafts kept in component state.
- Data‑fetching: TanStack Query (React Query) for Web/RN for caching, retries (disabled by default), and stale data labeling.
- Storage: `@react-native-async-storage/async-storage` (native) and `localStorage` (web) behind a unified helper.
- Editor (Prompt):
  - Web: CodeMirror 6 with Markdown highlighting (`@codemirror/lang-markdown`), autogrow and soft wrap.
  - Native: Fallback to multiline `TextInput` with syntax‑colored preview optional; keep simple for reliability.
- Icons: Lucide (via Tamagui).
- Validation: `zod` for client input.
- Error boundaries: `react-error-boundary` for global catches with graceful UI.

### 6.2 Data Flows
- Client → API: JSON over HTTPS to Worker endpoints.
- Model List: `GET https://openrouter.ai/api/v1/models` with cache; on failure, show cached stale list.
- LLM Calls: Direct from client to OpenRouter using stored key; no server proxy required.

### 6.3 Error Surfacing
- Capture: Wrap fetch calls; parse JSON error payloads; include status, message, timestamp.
- Display: Inline near the action (chat input, document forms, list/search controls).
- Redaction: Mask anything resembling keys/tokens.
- Dev vs Prod: Verbose console in dev; concise UI in prod with original message intact.

### 6.4 Theming & Layout
- Tamagui Provider; default theme from system or last saved setting; instant switch.
- Respect “reduce motion” for animations and micro‑interactions.

### 6.5 Packaging & Builds
- Web: `expo export -p web` static site (deployed to any static host).
- iOS/Android: EAS local builds for distribution.
- Desktop: Electron packaging using `electron-builder` with web export bundled.

## 7) Usability & Edge Cases
- Protect user drafts on navigation or errors; warn before losing unsaved content.
- Large inputs: autosave to local draft every few seconds.
- Rate limiting: explain cause; suggest waiting; do not auto‑retry aggressively.
- Long lists: virtualize if needed; but limit to recent 50 per API contract.

## 8) Testing Strategy
- Unit: Helpers, storage adapters, error mappers, prompt editor behaviors.
- Component: Key screens with React Testing Library (web) and testing-library/native (RN).
- Integration: Mock API and OpenRouter responses; verify offline, stale cache flows, and error surfacing.
- Manual: Cross‑platform theming, keyboard navigation, and screen reader labels.

## 9) Acceptance Criteria (Samples)
- Home disabled until model + API key present; enabling happens immediately after configuration.
- Create document failure preserves user input and surfaces original server error.
- Model list fetch outage shows cached stale list and disables selection if none available.
- Errors appear inline, include original message and status, and never show secrets.


