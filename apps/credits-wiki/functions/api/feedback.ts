import type { D1Database } from "@cloudflare/workers-types";

interface Env { DB: D1Database; }
type FeedbackKind = "relevant" | "outdated" | "incorrect";

interface Context { request: Request; env: Env; }
export const onRequest = async (context: Context): Promise<Response> => {
  if (context.request.method === "GET") {
    const slug = new URL(context.request.url).searchParams.get("slug");
    if (!slug) return Response.json({ error: "slug is required" }, { status: 400 });
    const result = await context.env.DB.prepare("SELECT relevant_yes, relevant_no FROM credits WHERE slug = ?").bind(slug).first<{ relevant_yes: number; relevant_no: number }>();
    return result ? Response.json({ relevant: result.relevant_yes, outdated: result.relevant_no }) : Response.json({ error: "credit not found" }, { status: 404 });
  }
  if (context.request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body: unknown = await context.request.json().catch(() => null);
  if (!isRecord(body) || typeof body.slug !== "string" || !isKind(body.kind)) return Response.json({ error: "slug and a valid kind are required" }, { status: 400 });
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : null;
  const id = crypto.randomUUID();
  const column = body.kind === "relevant" ? "relevant_yes" : "relevant_no";
  const result = await context.env.DB.batch([
    context.env.DB.prepare("INSERT INTO feedback (id, slug, kind, message) VALUES (?, ?, ?, ?)").bind(id, body.slug, body.kind, message),
    context.env.DB.prepare(`UPDATE credits SET ${column} = ${column} + 1 WHERE slug = ?`).bind(body.slug)
  ]);
  if (result[1].meta.changes === 0) return Response.json({ error: "credit not found" }, { status: 404 });
  return Response.json({ ok: true }, { status: 201 });
};

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function isKind(value: unknown): value is FeedbackKind { return value === "relevant" || value === "outdated" || value === "incorrect"; }
