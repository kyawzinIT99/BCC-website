export type HomePathway = {
  title: string;
  description: string;
  href: string;
  visible: boolean;
};

export type HomePageSettings = {
  announcement: string;
  eyebrow: string;
  title: string;
  intro: string;
  heroImageUrl: string;
  heroImageAlt: string;
  helpTitle: string;
  helpIntro: string;
  pathways: [HomePathway, HomePathway, HomePathway, HomePathway];
};

export const defaultHomePage: HomePageSettings = {
  announcement: "Community-led action across Australia",
  eyebrow: "Faith • Culture • Community",
  title: "Together in faith. Stronger in community.",
  intro:
    "Celebrating Burmese Catholic life in Western Australia through faith, cultural gatherings, family connection and community stories.",
  heroImageUrl: "/community-hero-group.jpg",
  heroImageAlt:
    "Members of the Burmese Catholic community gathering outdoors in Western Australia.",
  helpTitle: "What can we help you with?",
  helpIntro: "Choose one path. We will show the safest next step.",
  pathways: [
    {
      title: "Learn English",
      description:
        "Visit the official Australian Government AMEP provider finder. Burmese Catholic Community of Western Australia is independent and is not an AMEP provider.",
      href: "https://immi.homeaffairs.gov.au/settling-in-australia/amep/find-a-class/providers-and-locations",
      visible: true,
    },
    {
      title: "Find community support",
      description: "Ask for help locating reliable community information.",
      href: "/get-involved#community-contact",
      visible: true,
    },
    {
      title: "Support our work",
      description: "Volunteer, partner or discuss responsible future support.",
      href: "/get-involved",
      visible: true,
    },
    {
      title: "Learn AI, networking & cloud",
      description:
        "Explore an experimental Telegram learning bot for AI, networking and cloud topics. Opens Telegram.",
      href: "https://t.me/AIkzautomation_bot",
      visible: true,
    },
  ],
};
