import { z } from "zod";
import type { Env } from "./types.d.ts";

export const DocumentCreateSchema = z.object({
  title: z.string().trim().min(1).max(256),
  content: z.string().trim().min(1).max(32_000),
});

export function corsHeaders(origin: string | undefined) {
  const allowOrigin = origin && origin !== "" ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  } as Record<string, string>;
}

export function jsonResponse<T>(data: T, init: ResponseInit = {}, correlationId?: string, origin?: string) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (correlationId) headers.set("X-Correlation-Id", correlationId);
  const cors = corsHeaders(origin);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function redacted(text: string) {
  // Mask potential API keys or tokens (simple heuristic)
  return text.replace(/[A-Za-z0-9_\-]{20,}/g, "•••redacted•••");
}

export function errorResponse(error: unknown, status: number, correlationId: string, origin?: string) {
  const message = redacted(
    error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error)
  );
  const body = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
    correlationId,
  };
  return jsonResponse(body, { status }, correlationId, origin);
}

export async function embedText(env: Env, text: string): Promise<number[]> {
  // Workers AI embedding; normalize possible shapes
  const out = (await env.AI.run("@cf/baai/bge-base-en-v1.5", { text })) as unknown;
  const o = (out ?? {}) as Record<string, unknown>;
  let candidate: unknown = out;
  if ("data" in o) candidate = (o as { data: unknown }).data;
  else if ("embedding" in o) candidate = (o as { embedding: unknown }).embedding;
  else if ("embeddings" in o) candidate = (o as { embeddings: unknown }).embeddings;
  if (Array.isArray(candidate) && candidate.every((n) => typeof n === "number")) return candidate as number[];
  throw new Error("Embedding returned unexpected shape");
}
