export type CommitteeMember = {
  name: string;
  role: string;
  phone: string;
};

export type AboutFocus = {
  title: string;
  description: string;
};

export type AboutProfile = {
  historyEyebrow: string;
  historyTitle: string;
  historyBody: string;
  formed: string;
  incorporated: string;
  legalName: string;
  abn: string;
  focusEyebrow: string;
  focusTitle: string;
  focuses: [AboutFocus, AboutFocus, AboutFocus];
  committeeEyebrow: string;
  committeeTitle: string;
  committeeNote: string;
  committeeUpdated: string;
  address: string;
  phone: string;
  contactEyebrow: string;
  contactTitle: string;
  sourceNote: string;
  committee: CommitteeMember[];
};

const committee: CommitteeMember[] = [
  { name: "Rev. Fr. Ossie Lewis", role: "Spiritual Director / Founder", phone: "0439 041 142" },
  { name: "Philip Mellican", role: "President", phone: "0414 190 577" },
  { name: "Joseph Harry", role: "Vice-President", phone: "0424 283 842" },
  { name: "Marlene Marcus", role: "Secretary", phone: "0412 855 568" },
  { name: "Lionel Ure", role: "Joint Secretary", phone: "0409 876 750" },
  { name: "Monica Trutwein", role: "Treasurer", phone: "0452 588 297" },
  { name: "Noelene Anthony", role: "Coordinator", phone: "0426 826 643" },
  { name: "Maria Thwe Thwe Aye", role: "Joint Coordinator", phone: "0468 732 626" },
  { name: "Dr Agatha Gabriel", role: "Healthcare", phone: "0412 950 401" },
  { name: "Leo Gualnam", role: "Youth Leader", phone: "0469 311 562" },
  { name: "Charles Phyo", role: "Second Youth Leader", phone: "0451 137 604" },
  { name: "Josephine Mellican", role: "Executive Member", phone: "0425 860 459" },
  { name: "Noreen Clarke", role: "Executive Member", phone: "0433 994 749" },
  { name: "Elizabeth Aye", role: "Executive Member", phone: "0459 991 395" },
  { name: "Dr Bernadette Thazin Lin", role: "Executive Member", phone: "0405 832 516" },
  { name: "Stephen Aung Htun Paul", role: "Executive Member", phone: "0433 542 209" },
  { name: "Christopher Davidson", role: "Executive Member", phone: "0402 599 680" },
  { name: "Margaret Matthews", role: "Executive Member", phone: "0450 226 858" },
  { name: "Bobo Htun", role: "Executive Member", phone: "0430 280 923" },
  { name: "Anna Ure", role: "Executive Member", phone: "0425 408 544" },
  { name: "Loretta Yeo", role: "Executive Member", phone: "0433 770 517" },
  { name: "Geraldine Harry", role: "Executive Member", phone: "0404 509 295" },
  { name: "Jerome Eishaung", role: "Executive Member", phone: "0430 984 556" },
];

export const defaultAboutProfile: AboutProfile = {
  historyEyebrow: "Faith carried across oceans",
  historyTitle: "A community built through faith and service.",
  historyBody:
    "Over the final decades of the twentieth century, Burmese Catholic families from different regions and cultural backgrounds began making Western Australia their home. Although they brought different languages, customs and life experiences, their shared Catholic faith created a place of belonging. Families gathered for prayer, worship and friendship while preserving the traditions they hoped to pass to the next generation.\n\nWith pastoral encouragement and guidance from Rev. Fr. Ossie Lewis, these gatherings became an organised community on 7 February 1999. The community grew through the steady contribution of priests, parents, young people, elders and volunteers. On 15 June 2008, BCCWA was formally incorporated, providing a responsible foundation for its pastoral, cultural and community work.\n\nToday, the community continues to connect faith with everyday life through worship, sacraments, youth and music, cultural celebrations, fellowship, welcoming newcomers, charitable outreach and practical care. Its story is one of people building a spiritual home together—honouring Burmese heritage, supporting one another in Western Australia and serving the wider community with dignity, generosity and hope.",
  formed: "7 February 1999",
  incorporated: "15 June 2008",
  legalName: "The Burmese Catholic Community of Western Australia Inc.",
  abn: "93 671 779 607",
  focusEyebrow: "Community in action",
  focusTitle: "Faith, belonging and practical care.",
  focuses: [
    { title: "Worship and formation", description: "Holy Mass, sacraments, prayer, catechesis and pastoral support." },
    { title: "Culture and belonging", description: "Welcoming families, celebrating Burmese heritage and supporting youth and music." },
    { title: "Care and service", description: "Volunteer outreach, fellowship, health education and safe community participation." },
  ],
  committeeEyebrow: "People who serve",
  committeeTitle: "Management committee.",
  committeeNote: "Contact details are provided for genuine community enquiries.",
  committeeUpdated: "27 March 2026",
  address: "3 Bellew Way, Noranda WA 6062",
  phone: "0412 855 568",
  contactEyebrow: "Contact BCCWA",
  contactTitle: "Start with the community office.",
  sourceNote: "History and committee information adapted from documents supplied by the Burmese Catholic Community of Western Australia.",
  committee,
};

const legacyShortHistory =
  "Burmese Catholics from diverse cultural backgrounds formed a spiritual home in Western Australia on 7 February 1999. With pastoral guidance from Rev. Fr. Ossie Lewis and the commitment of volunteers, the community was incorporated in 2008 and continues to bring generations together through worship, culture, friendship and care.";

export function cloneAboutProfile(profile: AboutProfile = defaultAboutProfile): AboutProfile {
  return {
    ...profile,
    focuses: profile.focuses.map((focus) => ({ ...focus })) as AboutProfile["focuses"],
    committee: profile.committee.map((member) => ({ ...member })),
  };
}

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function normalizeAboutProfile(value: unknown): AboutProfile {
  if (!value || typeof value !== "object") return cloneAboutProfile();
  const candidate = value as Partial<AboutProfile>;
  const text = (input: unknown, fallback: string) =>
    typeof input === "string" && input.trim() ? input.trim() : fallback;
  const focuses = Array.isArray(candidate.focuses) && candidate.focuses.length === 3
    ? candidate.focuses.map((focus, index) => ({
        title: text(focus?.title, defaultAboutProfile.focuses[index].title),
        description: text(focus?.description, defaultAboutProfile.focuses[index].description),
      })) as AboutProfile["focuses"]
    : cloneAboutProfile().focuses;
  const suppliedCommittee = Array.isArray(candidate.committee) && candidate.committee.length === committee.length
    ? candidate.committee.map((member, index) => ({
        name: text(member?.name, committee[index].name),
        role: text(member?.role, committee[index].role),
        phone: text(member?.phone, committee[index].phone),
      }))
    : committee.map((member) => ({ ...member }));

  return {
    historyEyebrow: text(candidate.historyEyebrow, defaultAboutProfile.historyEyebrow),
    historyTitle: text(candidate.historyTitle, defaultAboutProfile.historyTitle),
    historyBody: text(candidate.historyBody, defaultAboutProfile.historyBody) === legacyShortHistory
      ? defaultAboutProfile.historyBody
      : text(candidate.historyBody, defaultAboutProfile.historyBody),
    formed: text(candidate.formed, defaultAboutProfile.formed),
    incorporated: text(candidate.incorporated, defaultAboutProfile.incorporated),
    legalName: text(candidate.legalName, defaultAboutProfile.legalName),
    abn: text(candidate.abn, defaultAboutProfile.abn),
    focusEyebrow: text(candidate.focusEyebrow, defaultAboutProfile.focusEyebrow),
    focusTitle: text(candidate.focusTitle, defaultAboutProfile.focusTitle),
    focuses,
    committeeEyebrow: text(candidate.committeeEyebrow, defaultAboutProfile.committeeEyebrow),
    committeeTitle: text(candidate.committeeTitle, defaultAboutProfile.committeeTitle),
    committeeNote: text(candidate.committeeNote, defaultAboutProfile.committeeNote),
    committeeUpdated: text(candidate.committeeUpdated, defaultAboutProfile.committeeUpdated),
    address: text(candidate.address, defaultAboutProfile.address),
    phone: text(candidate.phone, defaultAboutProfile.phone),
    contactEyebrow: text(candidate.contactEyebrow, defaultAboutProfile.contactEyebrow),
    contactTitle: text(candidate.contactTitle, defaultAboutProfile.contactTitle),
    sourceNote: text(candidate.sourceNote, defaultAboutProfile.sourceNote),
    committee: suppliedCommittee,
  };
}
