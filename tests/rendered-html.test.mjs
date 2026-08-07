import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines the Burmese Catholic Community of Western Australia public website", async () => {
  const [page, homeModel, homeApi, header, sectionPage, contactForm, questionWidget, layout, styles] = await Promise.all([
    readFile(new URL("../app/components/PublicSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/home.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/home/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PublicHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SectionPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/CommunityContactForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PublicQuestionWidget.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /Burmese Catholic Community of Western Australia/);
  assert.match(header, /BURMESE CATHOLIC/);
  assert.match(header, /COMMUNITY WA/);
  assert.match(header, /aria-current/);
  assert.match(header, /English/);
  assert.match(header, /Arabic/);
  assert.match(header, /Dari/);
  assert.match(header, /Karen/);
  assert.match(header, /Vietnamese/);
  assert.doesNotMatch(header, /label: "Burmese"|label: "Myanmar"/);
  assert.match(page, /<PublicHeader language=/);
  assert.match(sectionPage, /<PublicHeader[\s\S]*activeHref=/);
  assert.match(sectionPage, /<PublicQuestionWidget language=/);
  assert.match(sectionPage, /Official community channel/);
  assert.match(sectionPage, /https:\/\/web\.facebook\.com\/groups\/115394412003293/);
  assert.match(sectionPage, /Facebook may require visitors to sign in/);
  assert.match(sectionPage, /about-community-australia\.webp/);
  assert.match(sectionPage, /Original concept image/);
  assert.match(sectionPage, /section-page-hero.*has-work-photo/);
  assert.match(sectionPage, /our-work-community\.jpg/);
  assert.match(sectionPage, /work-updates-route/);
  assert.match(sectionPage, /Our Work explains what we do\. News &amp; Stories shows what is happening now\./);
  assert.match(sectionPage, /Payment details appear only after organisation approval\./);
  assert.match(sectionPage, /This is the changing news and stories feed\./);
  assert.match(sectionPage, /Recent approved updates/);
  assert.match(sectionPage, /News &amp; Stories feed/);
  assert.match(sectionPage, /sectionKey === "stories"/);
  assert.doesNotMatch(sectionPage, /placement=\$\{encodeURIComponent\(sectionKey\)\}/);
  assert.match(sectionPage, /aboutProfile\.historyTitle/);
  assert.match(sectionPage, /aboutProfile\.committee/);
  assert.match(sectionPage, /personal contact details are not published/);
  assert.match(sectionPage, /\/get-involved#community-contact/);
  assert.doesNotMatch(sectionPage, /phoneHref\(aboutProfile\.phone\)/);
  assert.doesNotMatch(sectionPage, /bcc-timeline/);
  assert.match(sectionPage, /post\.mediaType\?\.startsWith\("image\/"\)/);
  assert.match(sectionPage, /alt=\{post\.mediaAlt \|\| post\.title\}/);
  assert.match(styles, /repeat\(auto-fit, minmax\(min\(100%, 280px\), 1fr\)\)/);
  assert.match(styles, /aspect-ratio: 4 \/ 3/);
  assert.match(styles, /object-fit: cover/);
  assert.match(page, /rel="noreferrer"/);
  assert.match(homeModel, /Together in faith\. Stronger in community\./);
  assert.match(homeModel, /Celebrating Burmese Catholic life in Western Australia/);
  assert.match(sectionPage, /sectionDefinitions/);
  assert.match(homeModel, /community-hero-group\.jpg/);
  assert.match(page, /Independent community organisation/);
  assert.match(page, /Not a government or/);
  assert.match(homeModel, /official Australian Government AMEP provider finder/);
  assert.match(homeModel, /Burmese Catholic Community of Western Australia is independent and is not an AMEP provider/);
  assert.match(page, /TIS National language services/);
  assert.match(homeModel, /Learn AI, networking & cloud/);
  assert.match(homeModel, /https:\/\/t\.me\/AIkzautomation_bot/);
  assert.match(homeModel, /experimental Telegram learning bot/);
  assert.doesNotMatch(homeModel, /n8n-al8a|Ws9rQBR7ZMvmJIdt/);
  assert.match(page, /fetch\("\/api\/home"\)/);
  assert.match(page, /fetch\("\/api\/posts"\)/);
  assert.match(page, /community-in-action/);
  assert.match(page, /localizedHome\.heroImageUrl/);
  assert.doesNotMatch(page, /const categories =/);
  assert.doesNotMatch(page, /category-tabs|People, place and possibility\./);
  assert.doesNotMatch(page, /post\.category/);
  assert.match(page, /pathway\.visible/);
  assert.match(homeApi, /Administrator access is required/);
  assert.match(homeApi, /home\.update/);
  assert.match(homeApi, /isSafeHref/);
  assert.match(questionWidget, /Safe, private and not public/);
  assert.match(questionWidget, /\/api\/inquiries/);
  assert.match(questionWidget, /source: "quick-question"/);
  assert.match(questionWidget, /Need a staff reply\? Use Get involved/);
  assert.match(questionWidget, /Send privately/);
  assert.doesNotMatch(page, /Staff portal|Admin Panel|hPanel|n8n/);
  assert.doesNotMatch(page, /codex-preview|Your site is taking shape/i);
  assert.match(contactForm, /authorised AMEP provider/i);
  assert.match(contactForm, /\/api\/inquiries/);
  assert.match(contactForm, /source: "get-involved"/);
  assert.match(contactForm, /administrator follow-up queue/);
  assert.match(contactForm, /ACNC Charity Register/);
  assert.match(contactForm, /does not currently accept money/i);
  assert.doesNotMatch(contactForm, /type="password"|type="number"/);
});

test("aligns Our Work and Our Approach with the community group", async () => {
  const sections = await readFile(
    new URL("../app/lib/sections.ts", import.meta.url),
    "utf8",
  );

  assert.match(sections, /Gathering in faith\. Growing through community\./);
  assert.match(sections, /Faith shared\. Culture celebrated\. Community strengthened\./);
  assert.match(sections, /Emergency relief and care/);
  assert.match(sections, /transparent follow-up/);
  assert.match(sections, /Faith-led\. Community-shaped\. Carefully shared\./);
  assert.match(sections, /context, consent and administrator review/);
});

test("publishes the supplied BCCWA history and committee directory clearly", async () => {
  const [profile, sections, styles] = await Promise.all([
    readFile(new URL("../app/lib/bcc-profile.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/sections.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(profile, /7 February 1999/);
  assert.match(profile, /15 June 2008/);
  assert.match(profile, /93 671 779 607/);
  assert.match(profile, /27 March 2026/);
  assert.match(profile, /Rev\. Fr\. Ossie Lewis/);
  assert.match(profile, /Jerome Eishaung/);
  assert.equal((profile.match(/\{ name:/g) || []).length, 23);
  assert.match(profile, /Faith, belonging and practical care/);
  assert.match(profile, /building a spiritual home together/);
  assert.match(sections, /To serve and not to be served/);
  assert.match(styles, /\.committee-grid/);
  assert.match(styles, /@media \(max-width: 560px\)/);
});

test("defines the separate staff Admin Panel", async () => {
  const [admin, pageManager, pagesApi, login, team, assistant, assistantApi, knowledge, auth, usersApi, inquiryAlert, operations, inquiriesApi, mediaApi] = await Promise.all([
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/PageManager.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/pages/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminLogin.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/TeamAccess.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/MrKyawZinAssistant.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/ai/mr-kyaw-zin/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/mr-kyaw-zin-knowledge.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/users/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/InquiryAlert.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminOperations.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/inquiries/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/media/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(pageManager, /Hero image URL/);
  assert.match(pageManager, /Hero image description/);

  assert.match(admin, /STAFF WORKSPACE/);
  assert.match(admin, /TeamAccess/);
  assert.match(pageManager, /Home page/);
  assert.match(pageManager, /Homepage pathways/);
  assert.match(pageManager, /Show on home page/);
  assert.match(pageManager, /fetch\(key === "home" \? "\/api\/home"/);
  assert.match(admin, /Production actions are locked/);
  assert.match(admin, /New community update/);
  assert.match(admin, /Post appears on page/);
  assert.match(admin, /type="file"/);
  assert.match(admin, /accept="image\/jpeg,image\/png,image\/gif,image\/webp,application\/pdf"/);
  assert.match(admin, /fetch\("\/api\/media"/);
  assert.match(admin, /mediaId/);
  assert.match(admin, /Photo description/);
  assert.match(admin, /post\.mediaUrl/);
  assert.match(mediaApi, /INNER JOIN posts p ON p\.media_id = m\.id/);
  assert.match(mediaApi, /p\.status = 'published'/);
  assert.match(mediaApi, /X-Content-Type-Options/);
  assert.match(login, /Secure sign in/);
  assert.match(team, /Hostinger hPanel is separate/);
  assert.match(admin, /MrKyawZinAssistant/);
  assert.match(assistant, /MR\.Kyaw Zin/);
  assert.match(assistant, /Private · Setup mode/);
  assert.match(assistant, /assistant-launcher/);
  assert.match(assistant, /Apply to draft/);
  assert.match(assistantApi, /authenticateRequest/);
  assert.match(assistantApi, /MR_KYAW_ZIN_AI_ENABLED/);
  assert.match(assistantApi, /OPENAI_VECTOR_STORE_ID/);
  assert.match(assistantApi, /store: false/);
  assert.match(assistantApi, /never publish, schedule, distribute/i);
  assert.match(knowledge, /CONFIRMED CURRENT IMPLEMENTATION/);
  assert.match(knowledge, /I don't know from the verified project information yet/);
  assert.match(knowledge, /Production Hostinger deployment has not yet been completed/);
  assert.match(auth, /PBKDF2/);
  assert.match(auth, /HttpOnly; SameSite=Lax/);
  assert.match(usersApi, /Owner access is required/);
  assert.match(admin, /<InquiryAlert currentUser=/);
  assert.match(admin, /Enquiries/);
  assert.match(inquiryAlert, /New public questions need review/);
  assert.match(inquiryAlert, /60_000/);
  assert.match(operations, /Community follow-up queue/);
  assert.match(operations, /in-progress/);
  assert.match(operations, /waiting/);
  assert.match(operations, /Assigned to/);
  assert.match(operations, /Follow up by/);
  assert.match(operations, /Follow-up overdue/);
  assert.match(operations, /Promote to follow-up/);
  assert.match(operations, /No reply needed/);
  assert.match(operations, /Inquiry CK-/);
  assert.match(inquiriesApi, /follow_up_required/);
  assert.match(inquiriesApi, /assigned_to/);
  assert.match(inquiriesApi, /follow_up_by/);
  assert.match(inquiriesApi, /community\.inquiry\.created/);
  assert.match(inquiriesApi, /N8N_INQUIRY_ALERT_WEBHOOK/);
  assert.match(inquiriesApi, /X-Common-Kind-Secret/);
  assert.match(pageManager, /Page feature cards/);
  assert.match(pageManager, /Edit website page/);
  assert.match(pageManager, /useState<PageSelection>\("about"\)/);
  assert.match(pageManager, /permanent page wording and framework/);
  assert.match(pageManager, /AboutProfileEditor/);
  assert.match(pageManager, /features: payload\.page\.features/);
  assert.match(pagesApi, /features_json/);
  assert.match(pagesApi, /about_json/);
  assert.match(pagesApi, /Administrator access is required/);
});

test("keeps production resources and deployment metadata aligned", async () => {
  const [hosting, environment, packageJson, workflow] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
  ]);

  assert.deepEqual(JSON.parse(hosting), { d1: "DB", r2: "MEDIA" });
  assert.match(environment, /ADMIN_WRITE_TOKEN=/);
  assert.match(environment, /N8N_PUBLISH_WEBHOOK=/);
  assert.match(environment, /MR_KYAW_ZIN_AI_ENABLED=false/);
  assert.match(environment, /OPENAI_API_KEY=/);
  assert.match(environment, /OPENAI_VECTOR_STORE_ID=/);
  assert.match(environment, /CRM_ALERTS_ENABLED=false/);
  assert.match(environment, /CRM_ALERT_EMAIL=/);
  assert.match(environment, /CRM_TELEGRAM_CHAT_ID=/);
  assert.match(environment, /N8N_INQUIRY_ALERT_WEBHOOK=/);
  assert.match(environment, /N8N_INQUIRY_WEBHOOK_SECRET=/);
  assert.equal(JSON.parse(packageJson).name, "common-kind-community-platform");
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm audit --omit=dev/);
  assert.match(workflow, /npm run build/);
});
