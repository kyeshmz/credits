import type { D1Database } from "@cloudflare/workers-types";

interface Env { DB: D1Database; }

interface Context { request: Request; env: Env; }
export const onRequest = async (context: Context): Promise<Response> => {
  if (context.request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body: unknown = await context.request.json().catch(() => null);
  if (!isRecord(body) || !isNonEmpty(body.provider, 120) || !isNonEmpty(body.program, 200) || !isUrl(body.url) || !isNonEmpty(body.category, 80) || !isNonEmpty(body.details, 4000)) {
    return Response.json({ error: "provider, program, URL, category, and details are required" }, { status: 400 });
  }
  await context.env.DB.prepare("INSERT INTO submissions (id, provider, program, url, category, details, submitter) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), body.provider.trim(), body.program.trim(), body.url.trim(), body.category.trim(), body.details.trim(), typeof body.submitter === "string" ? body.submitter.trim().slice(0, 200) : null).run();
  return Response.json({ ok: true }, { status: 201 });
};

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function isNonEmpty(value: unknown, max: number): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= max; }
function isUrl(value: unknown): value is string { if (!isNonEmpty(value, 500)) return false; try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }
