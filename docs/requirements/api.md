# Zhenren API — Requirements & Technical Design

## 1) Overview
- Purpose: Provide minimal, reliable endpoints for document storage and semantic search.
- Hosting: Cloudflare Workers + Cloudflare D1 (SQL) + Cloudflare Vectorize + Cloudflare AI embeddings.
- Priorities: Simplicity > elegance > normality > robustness > performance > functionality.

## 2) API Surface (v1)
Base: `/api`

### 2.1 Create Document
- Method/Path: `POST /api/documents`
- Request: JSON `{ title: string, content: string }`
- Behavior:
  1) Validate input (non-empty title/content; size sane per limits).
  2) Generate embedding with Cloudflare AI `@cf/baai/bge-base-en-v1.5`.
  3) Upsert vector to Vectorize with id = document id and metadata `{ title }`.
  4) Insert into D1: `{ id, title, content, vector_id, created }`.
- Response: `200` `{ id, title, content }`.
- Errors:
  - `400` invalid payload.
  - `500` embedding/vector/DB failure (return original message string in JSON `error`).

### 2.2 Get Document
- Method/Path: `GET /api/documents/{id}`
- Response: `200` full row `{ id, title, content, vector_id, created }` or `404`.

### 2.3 List Documents
- Method/Path: `GET /api/documents`
- Query: optional pagination (future); current: fixed `LIMIT 50`.
- Response: `200` `{ documents: Array<{ id, title, created }> }` sorted by `created` DESC.

### 2.4 Search Documents
- Method/Path: `GET /api/search`
- Query: `q` (required), `limit` (optional; default 10; max 20).
- Behavior:
  1) Validate `q` non-empty.
  2) Embed `q` with the same model.
  3) Query Vectorize `topK = min(limit, 20)` returning matches with metadata.
- Response: `200` `{ query, results: Array<{ id, title, similarity }> }`.
- Errors:
  - `400` missing `q`.
  - `500` embedding/vector errors (return original message string in JSON `error`).

## 3) Schemas & Limits
- D1 Table `documents`:
  - `id TEXT PRIMARY KEY`
  - `title TEXT NOT NULL`
  - `content TEXT NOT NULL`
  - `vector_id TEXT`
  - `created INTEGER DEFAULT unixepoch()`
- Vectorize:
  - Keyed by document `id`. Metadata includes `{ title }`.
- Embedding Model: `@cf/baai/bge-base-en-v1.5` (dimension managed by platform).
- Limits:
  - Title length: <= 256 chars.
  - Content length: soft max 32k chars (configurable); reject with `400` if exceeded.
  - List returns up to 50.
  - Search `limit` default 10, max 20.

## 4) Error Handling & Surfacing (Contract)
- All errors return JSON.
- Include original error message text in `error` (after redacting secrets).
- Include `status`, `timestamp`, and optional `correlationId` (UUID per request).
- Examples:
  - `400 { error: "Missing query parameter: q", status: 400, timestamp, correlationId }`
  - `500 { error: "Vectorize upsert failed: <provider message>", status: 500, timestamp, correlationId }`
- CORS: Enabled; in production, restrict `Access-Control-Allow-Origin` to trusted origins.

## 5) Security
- No auth in v1; consider service keys/JWT in v1.1.
- Never echo request bodies or secrets in logs.
- Redact anything that looks like an API key/token in error surfaces.
- Consider rate limiting (per IP) at Worker level to deter abuse.

## 6) Observability
- Structured logs with JSON objects for errors and notable events.
- Include `correlationId` and route on each log entry.
- Minimal by default; avoid noisy logs.

## 7) Validation
- Use `zod` schemas for request validation.
- Sanitize strings (trim) and reject empty/oversized inputs with `400`.

## 8) Robustness & Recovery
- Partial failure handling:
  - If vector upsert succeeds but DB insert fails (or vice versa), return `500` and log both sides; no automatic rollback in v1.
  - Provide a maintenance script (future) to reconcile orphaned vectors or rows.
- Timeouts:
  - Set reasonable timeouts for embedding and vector queries; surface original messages on timeout.

## 9) Performance Targets
- P50 endpoint latency (local region):
  - Create: < 800ms (embedding dominated)
  - Get/List: < 150ms
  - Search: < 400ms (embed + vector query)
- Payload sizes:
  - Responses are compact JSON; no content blobs in search.

## 10) Technical Design
- Runtime: Cloudflare Workers (TypeScript).
- Bindings:
  - `DB`: Cloudflare D1
  - `VECTORS`: Cloudflare Vectorize index
  - `AI`: Cloudflare AI binding
- Routing: Simple pathname switch; CORS middleware applied to all responses and OPTIONS preflight.
- Data Access: Raw SQL via D1 `prepare()`; keep schema minimal.
- Embeddings: One‑shot embedding per document content and per query.
- Search: `VECTORS.query(values, { topK, returnMetadata: true })`.
- Error Shape: Centralized helper to wrap errors with `status`, `timestamp`, `correlationId`, and redaction.
- Input Validation: `zod` parsing for POST and query params.

## 11) Testing Strategy
- Unit: Validators, error wrappers, query param parsing.
- Integration: Miniflare/Wrangler dev tests for each route with success/failure paths.
- Contract: Example error payloads verified; CORS headers present for all responses (incl. errors).

## 12) Deployment & Environments
- Dev: `wrangler dev` with local D1; bind Vectorize to prod for testing if needed (flagged).
- Prod: `wrangler deploy` with configured D1/Vectorize/AI bindings.
- Migrations: `wrangler d1 execute` to apply `schema.sql` on first deploy.

## 13) Versioning & Changes
- Prefix breaking API changes under `/api/v2`.
- Document changes in `CHANGELOG.md` with migration notes.

## 14) Edge Cases (Checklist)
- Empty `q` or whitespace → `400`.
- `limit` non‑numeric or > 20 → clamp to 20.
- Embedding returns empty/invalid vector → `500` with provider message.
- Vectorize returns zero matches → `200` with empty `results`.
- Nonexistent document id → `404`.
- Oversized content/title → `400` with size advice.

## 15) Future Enhancements (Non‑Goals in v1)
- Update/Delete endpoints with cascade to Vectorize.
- Pagination and total counts for list and search.
- AuthN/Z, quotas, and per‑tenant isolation.
- Background jobs for re‑embedding or model migration.

