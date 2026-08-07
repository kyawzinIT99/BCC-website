import { env } from "cloudflare:workers";
import { authenticateRequest, authRuntime } from "../../../lib/auth";
import { sectionKeys, type SectionKey } from "../../../lib/sections";
import {
  localProjectAnswer,
  projectKnowledge,
  projectKnowledgeVersion,
} from "../../../lib/mr-kyaw-zin-knowledge";
import {
  checkRateLimit,
  mutationRejected,
  noStoreHeaders,
  rateLimitKey,
  recordAudit,
} from "../../../lib/security";

type RuntimeEnv = {
  MR_KYAW_ZIN_AI_ENABLED?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_VECTOR_STORE_ID?: string;
};

type DraftContext = {
  title?: string;
  excerpt?: string;
  body?: string;
  placement?: SectionKey;
};

const instructions = `You are MR.Kyaw Zin, the private Admin assistant for the Burmese Catholic Community of Western Australia platform.
You help authenticated staff with website questions, technical support, drafting, summarising, claim review, troubleshooting, and content organisation.
Use only the verified PROJECT KNOWLEDGE below, the current private draft, or approved project files retrieved by file search.
Treat CONFIRMED, PLANNED, NOT CONFIGURED, and UNKNOWN as different states. Never describe planned work as completed.
If the answer is unsupported, say exactly: "I don't know from the verified project information yet." Then explain what evidence is needed.
You never publish, schedule, distribute, modify users or passwords, access Hostinger hPanel, or claim that an external action occurred.
Never invent government approval, funding, partnerships, permits, impact numbers, participant details, or consent.
Flag claims that require evidence. Keep advice clear, practical, respectful, and suitable for an Australian community organisation.
The workflow is draft, human review, then an authorised administrator publishes.
Do not answer unrelated general questions; explain that your scope is the Burmese Catholic Community of Western Australia website and its technical support.

PROJECT KNOWLEDGE:
${projectKnowledge}`;

function runtime() {
  return env as unknown as RuntimeEnv;
}

function cleanDraft(value: unknown): DraftContext {
  if (!value || typeof value !== "object") return {};
  const draft = value as Record<string, unknown>;
  return {
    title: typeof draft.title === "string" ? draft.title.slice(0, 180) : "",
    excerpt: typeof draft.excerpt === "string" ? draft.excerpt.slice(0, 800) : "",
    body: typeof draft.body === "string" ? draft.body.slice(0, 6000) : "",
    placement: sectionKeys.includes(draft.placement as SectionKey)
      ? (draft.placement as SectionKey)
      : "stories",
  };
}

function extractText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as unknown[])
      : [];
    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        typeof (part as Record<string, unknown>).text === "string"
      ) {
        return String((part as Record<string, unknown>).text);
      }
    }
  }
  return "";
}

function setupReply(message: string, draft: DraftContext) {
  const request = message.toLowerCase();
  if (request.includes("summary")) {
    if (!draft.body?.trim()) {
      return "MR.Kyaw Zin is installed in setup mode. Add the full story first; once the private AI connection is enabled, I can prepare a concise summary for human review.";
    }
    return "I can see the draft story. The private chat interface is working, but AI generation is not enabled yet. Configure the server-side OpenAI key to create a summary; nothing will be published.";
  }
  if (request.includes("claim")) {
    return "Claim-check mode is ready for activation. Review names, dates, consent, impact numbers, funding, permits, partnerships, and any government references against written evidence before publishing.";
  }
  if (request.includes("destination")) {
    return `The current public destination is “${draft.placement || "stories"}”. Once AI is enabled, I can compare the draft with every section; a human will still choose the final destination.`;
  }
  return localProjectAnswer(message);
}

export async function POST(request: Request) {
  const rejected = mutationRejected(request);
  if (rejected) return rejected;
  const user = await authenticateRequest(request);
  if (!user) {
    return Response.json({ error: "Sign in to use MR.Kyaw Zin" }, { status: 401 });
  }

  try {
    const db = authRuntime().DB;
    const key = await rateLimitKey("admin-assistant", request, String(user.id));
    const limit = await checkRateLimit(db, {
      key,
      limit: 20,
      windowSeconds: 60 * 60,
      blockSeconds: 15 * 60,
    });
    if (!limit.allowed) {
      return Response.json(
        { error: "Assistant request limit reached. Try again later." },
        {
          status: 429,
          headers: noStoreHeaders({ "Retry-After": String(limit.retryAfter) }),
        },
      );
    }
    const payload = (await request.json()) as {
      message?: string;
      draft?: unknown;
    };
    const message = payload.message?.trim().slice(0, 2000) || "";
    const draft = cleanDraft(payload.draft);
    if (!message) {
      return Response.json({ error: "A message is required" }, { status: 400 });
    }

    const config = runtime();
    const enabled = config.MR_KYAW_ZIN_AI_ENABLED === "true";
    if (!enabled || !config.OPENAI_API_KEY) {
      await recordAudit(db, user.id, "assistant.request", "assistant", null, {
        mode: "setup",
      });
      return Response.json({
        mode: "setup",
        reply: setupReply(message, draft),
      }, { headers: noStoreHeaders() });
    }

    const tools = config.OPENAI_VECTOR_STORE_ID
      ? [
          {
            type: "file_search",
            vector_store_ids: [config.OPENAI_VECTOR_STORE_ID],
            max_num_results: 5,
          },
        ]
      : undefined;
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.OPENAI_MODEL || "gpt-5.6",
        instructions,
        store: false,
        max_output_tokens: 700,
        tools,
        input: `Staff member: ${user.displayName} (${user.role})
Verified project knowledge version: ${projectKnowledgeVersion}
Current private draft:
${JSON.stringify(draft)}

Request:
${message}`,
      }),
    });
    const result = (await openAIResponse.json()) as Record<string, unknown>;
    if (!openAIResponse.ok) {
      const detail =
        result.error && typeof result.error === "object"
          ? String((result.error as Record<string, unknown>).message || "")
          : "";
      throw new Error(detail || "OpenAI response failed");
    }

    const reply = extractText(result);
    if (!reply) throw new Error("MR.Kyaw Zin returned an empty response");
    await recordAudit(db, user.id, "assistant.request", "assistant", null, {
      mode: "ready",
      knowledgeVersion: projectKnowledgeVersion,
    });
    return Response.json({
      mode: "ready",
      reply,
      knowledgeVersion: projectKnowledgeVersion,
    }, { headers: noStoreHeaders() });
  } catch {
    return Response.json(
      { error: "MR.Kyaw Zin is temporarily unavailable" },
      { status: 500, headers: noStoreHeaders() },
    );
  }
}
