export const sectionKeys = [
  "about",
  "our-work",
  "stories",
  "approach",
  "get-involved",
] as const;

export type SectionKey = (typeof sectionKeys)[number];

export type SectionFeature = {
  number: string;
  title: string;
  description: string;
};

export type SectionDefinition = {
  key: SectionKey;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  statement: string;
  features: [SectionFeature, SectionFeature, SectionFeature];
};

export const sectionDefinitions: Record<SectionKey, SectionDefinition> = {
  about: {
    key: "about",
    label: "About",
    eyebrow: "Our story",
    title: "A shared faith. A spiritual home.",
    summary:
      "Formed in 1999 and incorporated in 2008, the Burmese Catholic Community of Western Australia brings faith, culture, friendship and service together across generations.",
    statement: "To serve and not to be served.",
    features: [
      { number: "01", title: "Faith", description: "A spiritual home for worship, prayer and Catholic formation." },
      { number: "02", title: "Culture", description: "Burmese traditions, language and fellowship shared in Western Australia." },
      { number: "03", title: "Service", description: "Volunteer care, welcome and outreach offered across generations." },
    ],
  },
  "our-work": {
    key: "our-work",
    label: "Our work",
    eyebrow: "Faith and community life",
    title: "Gathering in faith. Growing through community.",
    summary:
      "Our work brings Burmese Catholic families and friends together across Western Australia through faith, cultural celebrations, community gatherings, shared learning and practical connection.",
    statement: "Faith shared. Culture celebrated. Community strengthened.",
    features: [
      { number: "01", title: "Faith and fellowship", description: "Welcoming opportunities for prayer, worship and connection across the community." },
      { number: "02", title: "Culture and belonging", description: "Celebrating Burmese heritage while building a shared sense of belonging in Western Australia." },
      { number: "03", title: "Emergency relief and care", description: "Coordinating verified appeals, practical support and transparent follow-up when communities face urgent need." },
    ],
  },
  stories: {
    key: "stories",
    label: "News & stories",
    eyebrow: "Current community updates",
    title: "Recent news, photographs and community stories.",
    summary:
      "This is the changing community feed: announcements, activity photographs and recaps published with context, consent and administrator approval.",
    statement: "Current updates live here. Our Work explains what we do.",
    features: [
      { number: "01", title: "Community updates", description: "Approved news from activities and community conversations." },
      { number: "02", title: "Shared stories", description: "Photographs and reflections published with context and consent." },
      { number: "03", title: "Notices and recaps", description: "Clear information that helps people understand recent activity." },
    ],
  },
  approach: {
    key: "approach",
    label: "Our approach",
    eyebrow: "How we serve",
    title: "Faith-led. Community-shaped. Carefully shared.",
    summary:
      "We listen to community members, work with trusted church and community partners, protect dignity and consent, and communicate activities clearly.",
    statement: "Welcome people. Respect every story. Serve together.",
    features: [
      { number: "01", title: "Listen and welcome", description: "Make space for families, young people and elders to participate with respect." },
      { number: "02", title: "Serve together", description: "Coordinate volunteers and trusted partners through clear roles and shared responsibility." },
      { number: "03", title: "Share responsibly", description: "Publish community photos and stories only with context, consent and administrator review." },
    ],
  },
  "get-involved": {
    key: "get-involved",
    label: "Get involved",
    eyebrow: "Take part",
    title: "Bring your time, your knowledge and your care.",
    summary:
      "Find authorised English-learning pathways, explore responsible partnerships, or ask how future community support can be developed.",
    statement: "Reliable information first. Human support when it is needed.",
    features: [
      { number: "01", title: "Find English classes", description: "Go directly to authorised Adult Migrant English Program providers." },
      { number: "02", title: "Ask for navigation help", description: "Request private assistance finding reliable learning or settlement information." },
      { number: "03", title: "Support responsibly", description: "Discuss future volunteering, partnership or funding without sending payment details." },
    ],
  },
};

export const publicNavigation = [
  ...sectionKeys.map((key) => ({
    href: `/${key}`,
    label: sectionDefinitions[key].label,
  })),
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
];
