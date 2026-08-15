import { applicationRuntime } from "../../lib/hostinger-runtime";
import { authenticateRequest } from "../../lib/auth";
import {
  normalizeLiveStream,
  parseLiveUrl,
  type LivePlatform,
  type LiveStatus,
} from "../../lib/live-stream";
import { mutationRejected, noStoreHeaders, recordAudit } from "../../lib/security";

type RuntimeEnv = {
  DB: D1Database;
};

function runtime() {
  return applicationRuntime() as unknown as RuntimeEnv;
}

const liveSchemaSql = `CREATE TABLE IF NOT EXISTS community_live_streams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

async function ensureSchema(db: D1Database) {
  await db.prepare(liveSchemaSql).run();
}

async function endOtherLiveStreams(db: D1Database, keepId?: number) {
  if (keepId) {
    await db
      .prepare(
        `UPDATE community_live_streams SET status = 'ended', updated_at = CURRENT_TIMESTAMP
         WHERE status = 'live' AND id != ?`,
      )
      .bind(keepId)
      .run();
    return;
  }
  await db
    .prepare(
      `UPDATE community_live_streams SET status = 'ended', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'live'`,
    )
    .run();
}

function parsePayload(payload: {
  title?: string;
  platform?: string;
  sourceUrl?: string;
  description?: string;
  status?: string;
}) {
  const title = (payload.title || "").trim();
  if (!title || title.length > 160) {
    return { error: "A valid title is required (max 160 characters)" };
  }
  const platform = payload.platform === "facebook" ? "facebook" : payload.platform === "youtube" ? "youtube" : "";
  const parsed = parseLiveUrl(payload.sourceUrl || "", platform as LivePlatform | "");
  if ("error" in parsed) return { error: parsed.error };
  const status: LiveStatus =
    payload.status === "live" || payload.status === "ended" || payload.status === "draft"
      ? payload.status
      : "draft";
  return {
    title,
    platform: parsed.platform,
    sourceUrl: parsed.sourceUrl,
    embedUrl: parsed.embedUrl,
    description: (payload.description || "").trim().slice(0, 800),
    status,
  };
}

export async function GET(request: Request) {
  try {
    const db = runtime().DB;
    if (!db) throw new Error("D1 binding DB is unavailable");
    await ensureSchema(db);

    const url = new URL(request.url);
    const adminScope = url.searchParams.get("scope") === "admin";

    if (adminScope) {
      const user = await authenticateRequest(request);
      if (!user) {
        return Response.json({ error: "Sign in required" }, { status: 401 });
      }
      const result = await db
        .prepare("SELECT * FROM community_live_streams ORDER BY id DESC LIMIT 50")
        .all();
      const streams = (result.results as Record<string, unknown>[]).map(normalizeLiveStream);
      return Response.json(
        { streams, current: streams.find((item) => item.status === "live") || null },
        { headers: noStoreHeaders() },
      );
    }

    const result = await db
      .prepare(
        `SELECT * FROM community_live_streams
         WHERE status IN ('live', 'ended')
         ORDER BY CASE status WHEN 'live' THEN 0 ELSE 1 END, id DESC
         LIMIT 20`,
      )
      .all();
    const streams = (result.results as Record<string, unknown>[]).map(normalizeLiveStream);
    return Response.json({
      current: streams.find((item) => item.status === "live") || null,
      streams,
    });
  } catch {
    return Response.json({ error: "Unable to load live streams" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const rejected = mutationRejected(request);
  if (rejected) return rejected;
  const user = await authenticateRequest(request);
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const parsed = parsePayload((await request.json()) as Record<string, string>);
    if ("error" in parsed) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const db = runtime().DB;
    await ensureSchema(db);
    if (parsed.status === "live") await endOtherLiveStreams(db);

    const row = await db
      .prepare(
        `INSERT INTO community_live_streams
          (title, platform, source_url, embed_url, description, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         RETURNING *`,
      )
      .bind(
        parsed.title,
        parsed.platform,
        parsed.sourceUrl,
        parsed.embedUrl,
        parsed.description,
        parsed.status,
        user.id,
      )
      .first();

    const stream = normalizeLiveStream(row as Record<string, unknown>);
    await recordAudit(db, user.id, "live.create", "community_live_stream", Number(stream.id));
    return Response.json({ stream }, { status: 201, headers: noStoreHeaders() });
  } catch {
    return Response.json({ error: "Unable to save live stream" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const rejected = mutationRejected(request);
  if (rejected) return rejected;
  const user = await authenticateRequest(request);
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as Record<string, string> & { id?: number };
    const id = Number(payload.id);
    if (!Number.isSafeInteger(id)) {
      return Response.json({ error: "Valid live stream ID required" }, { status: 400 });
    }
    const parsed = parsePayload(payload);
    if ("error" in parsed) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const db = runtime().DB;
    await ensureSchema(db);
    const existing = await db
      .prepare("SELECT id FROM community_live_streams WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) {
      return Response.json({ error: "Live stream not found" }, { status: 404 });
    }

    if (parsed.status === "live") await endOtherLiveStreams(db, id);

    const row = await db
      .prepare(
        `UPDATE community_live_streams SET
          title = ?, platform = ?, source_url = ?, embed_url = ?,
          description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? RETURNING *`,
      )
      .bind(
        parsed.title,
        parsed.platform,
        parsed.sourceUrl,
        parsed.embedUrl,
        parsed.description,
        parsed.status,
        id,
      )
      .first();

    const stream = normalizeLiveStream(row as Record<string, unknown>);
    await recordAudit(db, user.id, "live.update", "community_live_stream", id);
    return Response.json({ stream }, { headers: noStoreHeaders() });
  } catch {
    return Response.json({ error: "Unable to update live stream" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const rejected = mutationRejected(request);
  if (rejected) return rejected;
  const user = await authenticateRequest(request);
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get("id"));
    if (!Number.isSafeInteger(id)) {
      return Response.json({ error: "Valid live stream ID required" }, { status: 400 });
    }

    const db = runtime().DB;
    await ensureSchema(db);
    await db.prepare("DELETE FROM community_live_streams WHERE id = ?").bind(id).run();
    await recordAudit(db, user.id, "live.delete", "community_live_stream", id);
    return Response.json({ ok: true }, { headers: noStoreHeaders() });
  } catch {
    return Response.json({ error: "Unable to delete live stream" }, { status: 500 });
  }
}
