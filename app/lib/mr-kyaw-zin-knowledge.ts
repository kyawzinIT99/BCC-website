export const projectKnowledgeVersion = "2026-07-28.1";

export const projectKnowledge = `
PROJECT: Burmese Catholic Community of Western Australia dynamic community platform.
KNOWLEDGE VERSION: ${projectKnowledgeVersion}.

CONFIRMED CURRENT IMPLEMENTATION
- A responsive public website exists with Home, About, Our Work, News & Stories, Our Approach, and Get Involved pages.
- The public website and private staff Admin Panel are separate.
- The Admin Panel uses password sign-in, expiring HttpOnly sessions, and Owner, Administrator, and Editor roles.
- The Owner can create, update, disable, and reset passwords for application staff accounts in Team Access.
- Staff can create posts, select a public destination and distribution channels, upload approved images or PDFs, save drafts, and send content for review.
- Public pages read published content from the database. Draft and review content remains private.
- The backend includes protected posts, media, authentication, staff-user, and MR.Kyaw Zin API routes.
- The application architecture uses a D1-compatible relational database and R2-compatible media storage.
- MR.Kyaw Zin appears only inside the authenticated Admin Dashboard as a small floating chat icon.
- The repository is connected to GitHub. Production Hostinger deployment has not yet been completed.

CONFIRMED EDITORIAL RULES
- Workflow: draft, human review, authorised publication, then optional n8n distribution.
- Never publish or distribute a draft or review copy.
- Every public claim needs evidence. Government approval, permits, funding, partnerships, impact numbers, consent, and personal details must not be invented.
- Historical Facebook content may be imported only with account authorisation and ownership review, and must enter as draft or review content.

SYSTEM BOUNDARIES
- Hostinger hPanel is infrastructure administration for the website owner: hosting, domain, email, billing, SSL, backups, and security.
- The application Admin Panel is for staff content and account workflows. It does not provide hPanel access.
- n8n is a supporting automation service, not the primary website backend.
- Full Linux root access, unrestricted Docker Compose, and self-hosted n8n require a VPS or separate suitable host. Managed Hostinger Cloud plan capabilities must be verified before purchase or deployment.
- MR.Kyaw Zin may explain the website and provide technical support, drafting help, claim checks, and troubleshooting steps.
- MR.Kyaw Zin cannot publish, schedule, distribute, change staff users or passwords, access hPanel, purchase services, or claim that an external action succeeded.

PLANNED OR NOT YET CONFIGURED
- Production Hostinger deployment, production domain, mailboxes, final SSL and backup configuration.
- Live Facebook, Telegram, email, and n8n credentials and end-to-end distribution.
- Final organisation content, verified government or permit statements, donations, and other legal or financial flows.
- OpenAI-powered responses remain disabled until the protected server API key and feature flag are configured.

ANSWER POLICY
- Answer website and technical-support questions only from this project knowledge, the current private draft supplied with the request, or retrieved approved project files.
- Clearly label confirmed, planned, not configured, or unknown status.
- If the answer is not supported, say: "I don't know from the verified project information yet." Then state what evidence or configuration is needed.
- Never use general assumptions to fill a missing project fact.
`.trim();

export function localProjectAnswer(message: string) {
  const request = message.toLowerCase();

  if (/(what|which).*(complete|done|progress|built|finish)|current progress/.test(request)) {
    return "Confirmed: the public pages, protected Admin Panel, staff roles and sessions, post workflow, media upload, database-backed content routes, and the MR.Kyaw Zin chat interface are implemented. Planned or not configured: production Hostinger deployment and live n8n, Facebook, Telegram, email, domain, SSL, and backup credentials.";
  }
  if (request.includes("hpanel") || request.includes("hostinger")) {
    return "Confirmed boundary: hPanel belongs to the website owner for hosting, domain, email, billing, SSL, backups, and infrastructure security. The staff Admin Panel does not access hPanel. Production Hostinger deployment is not completed yet, and current plan capabilities must be verified before deployment.";
  }
  if (request.includes("admin") || request.includes("login") || request.includes("password")) {
    return "Confirmed: the private Admin Panel has password sign-in, expiring HttpOnly sessions, and Owner, Administrator, and Editor roles. The Owner manages application staff accounts in Team Access. MR.Kyaw Zin cannot view or change passwords and cannot access hPanel.";
  }
  if (request.includes("n8n") || request.includes("facebook") || request.includes("telegram")) {
    return "Confirmed architecture: an authorised publication can later trigger n8n for selected channels. Live n8n, Facebook, and Telegram credentials and end-to-end distribution are not configured yet. Drafts and review copies must never be distributed.";
  }
  if (request.includes("upload") || request.includes("photo") || request.includes("media")) {
    return "Confirmed: authenticated staff can upload approved images or PDFs, attach them to a post, save a draft, and send it for review. Media rights and consent must be verified before publication.";
  }
  if (request.includes("publish") || request.includes("post") || request.includes("content")) {
    return "Confirmed workflow: staff create a draft, a human verifies the copy, claims, consent, and media rights, then an authorised user publishes it. Only a published event may be handed to n8n for selected channels.";
  }
  if (request.includes("government") || request.includes("permit") || request.includes("funding")) {
    return "No government approval, permit, funding, or partnership should be claimed without written evidence and exact authorised wording. I don't know from the verified project information whether any such approval currently exists.";
  }
  if (request.includes("deploy") || request.includes("production") || request.includes("domain")) {
    return "Confirmed: the project is developed locally and connected to GitHub. Production Hostinger deployment, the final domain, mailboxes, SSL, and backup configuration are not completed yet.";
  }
  if (request.includes("architecture") || request.includes("database") || request.includes("backend")) {
    return "Confirmed architecture: a dynamic full-stack website with public React pages, protected backend APIs, a D1-compatible relational database, R2-compatible media storage, role-based Admin access, and optional n8n distribution after authorised publication.";
  }

  return "I don't know from the verified project information yet. Ask about the website, Admin Panel, content workflow, media, database, Hostinger boundary, deployment, n8n, Facebook, Telegram, or provide the missing project evidence.";
}
