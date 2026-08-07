import { authRuntime, authenticateRequest } from "../../lib/auth";
import { notifyInquiryAutomation } from "../../lib/n8n";
import {
  checkRateLimit,
  mutationRejected,
  noStoreHeaders,
  rateLimitKey,
  recordAudit,
} from "../../lib/security";

async function ensureSchema(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS public_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL DEFAULT 'get-involved',
    kind TEXT NOT NULL DEFAULT 'contact',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organisation TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    consent INTEGER NOT NULL DEFAULT 0,
    follow_up_required INTEGER NOT NULL DEFAULT 1,
    assigned_to TEXT NOT NULL DEFAULT '',
    follow_up_by TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS public_inquiries_status_created_idx ON public_inquiries(status, created_at DESC)",
    )
    .run();
  for (const statement of [
    "ALTER TABLE public_inquiries ADD COLUMN organisation TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE public_inquiries ADD COLUMN location TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE public_inquiries ADD COLUMN source TEXT NOT NULL DEFAULT 'get-involved'",
    "ALTER TABLE public_inquiries ADD COLUMN follow_up_required INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE public_inquiries ADD COLUMN assigned_to TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE public_inquiries ADD COLUMN follow_up_by TEXT",
  ]) {
    try {
      await db.prepare(statement).run();
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.toLowerCase().includes("duplicate column")
      ) {
        throw error;
      }
    }
  }
}

export async function GET(request: Request) {
  const user = await authenticateRequest(request);
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  if (user.role === "editor") {
    return Response.json({ error: "Administrator access is required" }, { status: 403 });
  }
  const db = authRuntime().DB;
  await ensureSchema(db);
  const result = await db
    .prepare(`SELECT id, source, kind, name, email, organisation, location, message,
      consent, follow_up_required, assigned_to, follow_up_by, status, created_at
      FROM public_inquiries ORDER BY created_at DESC LIMIT 100`)
    .all();
  return Response.json({ inquiries: result.results }, { headers: noStoreHeaders() });
}

export async function POST(request: Request) {
  const rejected = mutationRejected(request);
  if (rejected) return rejected;
  const db = authRuntime().DB;
  await ensureSchema(db);
  const key = await rateLimitKey("public-inquiry", request);
  const limit = await checkRateLimit(db, {
    key,
    limit: 4,
    windowSeconds: 60 * 60,
    blockSeconds: 60 * 60,
  });
  if (!limit.allowed) {
    return Response.json(
      { error: "Please wait before sending another message." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  const payload = (await request.json()) as {
    source?: string;
    kind?: string;
    name?: string;
    email?: string;
    organisation?: string;
    location?: string;
    message?: string;
    consent?: boolean;
    website?: string;
  };
  if (payload.website) {
    return Response.json({ ok: true }, { status: 201 });
  }
  const name = payload.name?.trim() || "";
  const email = payload.email?.trim().toLowerCase() || "";
  const organisation = payload.organisation?.trim() || "";
  const location = payload.location?.trim() || "";
  const message = payload.message?.trim() || "";
  const allowedKinds = new Set([
    "contact",
    "volunteer",
    "partnership",
    "learning-referral",
    "donation-enquiry",
  ]);
  const source = payload.source === "quick-question" ? "quick-question" : "get-involved";
  const followUpRequired = source === "get-involved";
  const kind = allowedKinds.has(payload.kind || "") ? payload.kind! : "contact";
  const validEmail =
    (!followUpRequired && !email) ||
    (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254);
  if (
    name.length < 2 ||
    name.length > 100 ||
    !validEmail ||
    organisation.length > 140 ||
    location.length > 140 ||
    message.length < 10 ||
    message.length > 3000 ||
    payload.consent !== true
  ) {
    return Response.json(
      { error: "Complete all required fields and confirm consent." },
      { status: 400 },
    );
  }
  const followUpBy = followUpRequired
    ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : null;
  const row = await db
    .prepare(`INSERT INTO public_inquiries
      (source, kind, name, email, organisation, location, message, consent,
       follow_up_required, assigned_to, follow_up_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, '', ?)
      RETURNING id`)
    .bind(
      source,
      kind,
      name,
      email,
      organisation,
      location,
      message,
      followUpRequired ? 1 : 0,
      followUpBy,
    )
    .first();
  const reference = Number((row as Record<string, unknown>).id);
  const notification = await notifyInquiryAutomation({
    event: "community.inquiry.created",
    reference: `CK-${reference}`,
    source,
    kind,
    name,
    email,
    organisation,
    location,
    message,
    consent: true,
    followUpRequired,
    followUpBy,
    createdAt: new Date().toISOString(),
  });
  if (notification === "failed") {
    await recordAudit(db, null, "inquiry.webhook-failed", "public_inquiry", reference, {
      source,
      kind,
    });
  } else if (notification === "delivered") {
    await recordAudit(db, null, "inquiry.webhook-delivered", "public_inquiry", reference, {
      source,
      kind,
      automation: "n8n",
    });
  }
  return Response.json(
    { ok: true, reference },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const rejected = mutationRejected(request);
  if (rejected) return rejected;
  const user = await authenticateRequest(request);
  if (!user || user.role === "editor") {
    return Response.json({ error: "Administrator access is required" }, { status: 403 });
  }
  const payload = (await request.json()) as {
    id?: number;
    status?: string;
    followUpRequired?: boolean;
    assignedTo?: string;
    followUpBy?: string | null;
  };
  const id = Number(payload.id);
  const allowed = new Set(["new", "in-progress", "waiting", "closed"]);
  const hasStatus = typeof payload.status === "string";
  const hasFollowUp = typeof payload.followUpRequired === "boolean";
  const hasAssignee = typeof payload.assignedTo === "string";
  const hasDeadline = payload.followUpBy === null || typeof payload.followUpBy === "string";
  if (
    !Number.isSafeInteger(id) ||
    (!hasStatus && !hasFollowUp && !hasAssignee && !hasDeadline) ||
    (hasStatus && !allowed.has(payload.status || "")) ||
    (hasAssignee && payload.assignedTo!.trim().length > 100) ||
    (hasDeadline &&
      payload.followUpBy !== null &&
      payload.followUpBy !== "" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(payload.followUpBy || ""))
  ) {
    return Response.json({ error: "Valid inquiry update is required" }, { status: 400 });
  }
  const db = authRuntime().DB;
  await ensureSchema(db);
  if (hasStatus) {
    await db.prepare("UPDATE public_inquiries SET status = ? WHERE id = ?")
      .bind(payload.status, id)
      .run();
  }
  if (hasFollowUp) {
    await db.prepare(
      `UPDATE public_inquiries
       SET follow_up_required = ?,
           status = CASE WHEN ? = 1 AND status = 'closed' THEN 'new' ELSE status END,
           follow_up_by = CASE
             WHEN ? = 1 AND follow_up_by IS NULL THEN date('now', '+2 days')
             ELSE follow_up_by
           END
       WHERE id = ?`,
    )
      .bind(payload.followUpRequired ? 1 : 0, payload.followUpRequired ? 1 : 0, payload.followUpRequired ? 1 : 0, id)
      .run();
  }
  if (hasAssignee) {
    await db.prepare("UPDATE public_inquiries SET assigned_to = ? WHERE id = ?")
      .bind(payload.assignedTo!.trim(), id)
      .run();
  }
  if (hasDeadline) {
    await db.prepare("UPDATE public_inquiries SET follow_up_by = ? WHERE id = ?")
      .bind(payload.followUpBy || null, id)
      .run();
  }
  const auditAction = hasFollowUp
    ? "inquiry.follow-up"
    : hasAssignee
      ? "inquiry.assignment"
      : hasDeadline
        ? "inquiry.deadline"
        : "inquiry.status";
  await recordAudit(db, user.id, auditAction, "public_inquiry", id, {
    status: payload.status,
    followUpRequired: payload.followUpRequired,
    assignedTo: payload.assignedTo,
    followUpBy: payload.followUpBy,
  });
  return Response.json({ ok: true }, { headers: noStoreHeaders() });
}
