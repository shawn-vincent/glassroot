import { z } from "zod";
import { DocumentCreateSchema, corsHeaders, errorResponse, embedText, jsonResponse } from "./utils";
import type { Env } from "./types.d.ts";

const LIMIT_LIST = 50;
const LIMIT_SEARCH_MAX = 20;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const correlationId = crypto.randomUUID();
    const origin = env.CORS_ORIGIN || "*";

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        const bindings = { DB: !!env.DB, VECTORS: !!env.VECTORS, AI: !!env.AI };
        return jsonResponse({ ok: true, timestamp: Date.now(), env: "runtime", bindings }, { status: 200 }, correlationId, origin);
      }

      if (url.pathname === "/api/documents" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const parsed = DocumentCreateSchema.safeParse(body);
        if (!parsed.success) {
          return errorResponse(parsed.error.message, 400, correlationId, origin);
        }
        const { title, content } = parsed.data;
        const id = crypto.randomUUID();

        // Embed content
        const values = await embedText(env as Env, content);
        // Defensive check
        if (!Array.isArray(values) || values.length < 8) {
          throw new Error("Embedding returned invalid vector");
        }
        // Upsert vector
        await env.VECTORS.upsert([{ id, values, metadata: { title } }]);
        // Insert row
        await env.DB.prepare(
          "INSERT INTO documents (id, title, content, vector_id) VALUES (?1, ?2, ?3, ?1)"
        ).bind(id, title, content).run();

        return jsonResponse({ id, title, content }, { status: 200 }, correlationId, origin);
      }

      if (url.pathname === "/api/documents" && request.method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT id, title, created FROM documents ORDER BY created DESC LIMIT ?1"
        ).bind(LIMIT_LIST).all();
        return jsonResponse({ documents: results ?? [] }, { status: 200 }, correlationId, origin);
      }

      if (url.pathname.startsWith("/api/documents/") && request.method === "GET") {
        const id = url.pathname.split("/").pop() || "";
        const row = await env.DB.prepare(
          "SELECT id, title, content, vector_id, created FROM documents WHERE id = ?1"
        ).bind(id).first();
        if (!row) return errorResponse("Not Found", 404, correlationId, origin);
        return jsonResponse(row, { status: 200 }, correlationId, origin);
      }

      if (url.pathname === "/api/search" && request.method === "GET") {
        const q = url.searchParams.get("q")?.trim() ?? "";
        const limitRaw = Number(url.searchParams.get("limit") ?? "10");
        const topK = Math.min(Number.isFinite(limitRaw) ? Math.max(1, limitRaw) : 10, LIMIT_SEARCH_MAX);
        if (!q) return errorResponse("Missing query parameter: q", 400, correlationId, origin);

        const queryVec = await embedText(env as Env, q);
        const result = await env.VECTORS.query(queryVec, { topK, returnValues: false, returnMetadata: true });
        const results = (result.matches || []).map((m) => ({
          id: m.id,
          title: (m.metadata?.title as string) || "",
          similarity: m.score,
        }));
        return jsonResponse({ query: q, results }, { status: 200 }, correlationId, origin);
      }

      return errorResponse("Not Found", 404, correlationId, origin);
    } catch (err) {
      return errorResponse(err, 500, correlationId, env.CORS_ORIGIN || "*");
    }
  },
} satisfies ExportedHandler<Env>;
