import { env } from "cloudflare:workers";
import { authenticateRequest } from "../../lib/auth";
import { mutationRejected, noStoreHeaders, recordAudit } from "../../lib/security";

type RuntimeEnv = {
  DB: D1Database;
};

function runtime() {
  return env as unknown as RuntimeEnv;
}

async function ensureSchema(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS community_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'cultural',
    description TEXT NOT NULL DEFAULT '',
    recurring INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function normalize(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    time: row.event_time || "",
    location: row.location || "",
    category: row.category || "cultural",
    description: row.description || "",
    recurring: Boolean(row.recurring),
    status: row.status || "published",
    createdAt: row.created_at,
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
        .prepare("SELECT * FROM community_events ORDER BY event_date DESC, id DESC LIMIT 100")
        .all();
      return Response.json(
        { events: (result.results as Record<string, unknown>[]).map(normalize) },
        { headers: noStoreHeaders() }
      );
    }

    // Public: only published events
    const result = await db
      .prepare(
        "SELECT * FROM community_events WHERE status = 'published' ORDER BY event_date ASC, id ASC LIMIT 50"
      )
      .all();
    return Response.json({
      events: (result.results as Record<string, unknown>[]).map(normalize),
    });
  } catch {
    return Response.json({ error: "Unable to load events" }, { status: 500 });
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
    const payload = (await request.json()) as {
      title?: string;
      date?: string;
      time?: string;
      location?: string;
      category?: string;
      description?: string;
      recurring?: boolean;
      status?: string;
    };

    const title = payload.title?.trim() || "";
    if (!title || title.length > 160) {
      return Response.json({ error: "A valid title is required (max 160 characters)" }, { status: 400 });
    }
    if (!payload.date || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
      return Response.json({ error: "A valid date (YYYY-MM-DD) is required" }, { status: 400 });
    }

    const allowedCategories = new Set(["mass", "cultural", "service", "youth", "learning"]);
    const category = allowedCategories.has(payload.category || "") ? payload.category! : "cultural";
    const allowedStatuses = new Set(["draft", "published"]);
    const status = allowedStatuses.has(payload.status || "") ? payload.status! : "published";

    const db = runtime().DB;
    await ensureSchema(db);

    const row = await db
      .prepare(`INSERT INTO community_events
        (title, event_date, event_time, location, category, description, recurring, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *`)
      .bind(
        title,
        payload.date,
        (payload.time || "").trim().slice(0, 60),
        (payload.location || "").trim().slice(0, 200),
        category,
        (payload.description || "").trim().slice(0, 2000),
        payload.recurring ? 1 : 0,
        status,
        user.id,
      )
      .first();

    await recordAudit(db, user.id, "event.create", "community_event", Number((row as Record<string, unknown>).id));
    return Response.json(
      { event: normalize(row as Record<string, unknown>) },
      { status: 201, headers: noStoreHeaders() }
    );
  } catch {
    return Response.json({ error: "Unable to save event" }, { status: 500 });
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
    const payload = (await request.json()) as {
      id?: number;
      title?: string;
      date?: string;
      time?: string;
      location?: string;
      category?: string;
      description?: string;
      recurring?: boolean;
      status?: string;
    };

    const id = Number(payload.id);
    if (!Number.isSafeInteger(id)) {
      return Response.json({ error: "Valid event ID required" }, { status: 400 });
    }
    const title = payload.title?.trim() || "";
    if (!title || title.length > 160) {
      return Response.json({ error: "A valid title is required" }, { status: 400 });
    }
    if (!payload.date || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
      return Response.json({ error: "A valid date (YYYY-MM-DD) is required" }, { status: 400 });
    }

    const allowedCategories = new Set(["mass", "cultural", "service", "youth", "learning"]);
    const category = allowedCategories.has(payload.category || "") ? payload.category! : "cultural";
    const allowedStatuses = new Set(["draft", "published"]);
    const status = allowedStatuses.has(payload.status || "") ? payload.status! : "published";

    const db = runtime().DB;
    await ensureSchema(db);

    const row = await db
      .prepare(`UPDATE community_events SET
        title = ?, event_date = ?, event_time = ?, location = ?,
        category = ?, description = ?, recurring = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ? RETURNING *`)
      .bind(
        title,
        payload.date,
        (payload.time || "").trim().slice(0, 60),
        (payload.location || "").trim().slice(0, 200),
        category,
        (payload.description || "").trim().slice(0, 2000),
        payload.recurring ? 1 : 0,
        status,
        id,
      )
      .first();

    if (!row) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    await recordAudit(db, user.id, "event.update", "community_event", id);
    return Response.json(
      { event: normalize(row as Record<string, unknown>) },
      { headers: noStoreHeaders() }
    );
  } catch {
    return Response.json({ error: "Unable to update event" }, { status: 500 });
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
      return Response.json({ error: "Valid event ID required" }, { status: 400 });
    }

    const db = runtime().DB;
    await ensureSchema(db);
    await db.prepare("DELETE FROM community_events WHERE id = ?").bind(id).run();
    await recordAudit(db, user.id, "event.delete", "community_event", id);
    return Response.json({ ok: true }, { headers: noStoreHeaders() });
  } catch {
    return Response.json({ error: "Unable to delete event" }, { status: 500 });
  }
}
