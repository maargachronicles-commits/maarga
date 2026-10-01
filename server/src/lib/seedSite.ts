import type { Delegate, ModelName } from "./fileStore";
import { ensureDestinationCodes, nextItineraryCode } from "./codes";
import { img } from "./seedData";

/**
 * Round 8 placeholder content (from the Figma frames Itinerary, Gallery,
 * Gallery-Bank, Events overview / information / after the event):
 *   - codes for every destination (HAM0001…)
 *   - one Hampi itinerary (HAM00001) with the Figma days, activities, icons and stays
 *   - the activity-icon library
 *   - the media library (existing placeholder photos → folders), Gallery Bank flags
 *   - events page copy, "How These Sessions Work", detail-page fields on the seeded events
 * Runs on every boot like seedAbout/seedExperience: only fills what does not exist yet.
 */
type Db = Record<ModelName, Delegate>;

const ON_VERCEL = !!process.env.VERCEL && !process.env.PUBLIC_URL;
const BASE = (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
/* On Vercel the icons are served by the client from client/public/icons. */
export const iconUrl = (name: string) => (ON_VERCEL ? `/icons/${name}.svg` : `${BASE}/static/icons/${name}.svg`);

export const SITE_TEXT_DEFAULTS: Record<string, string> = {
  // Events page
  eventsHeroLabel: "EVENTS",
  eventsHeroTitle: "Not every question needs a journey to answer it.",
  eventsUpcomingTitle: "Upcoming Events",
  eventsCalendarText: "Open Calendar",
  eventsCalendarUrl: "",
  eventsHowLabel: "Events",
  eventsHowTitle: "How These Sessions Work",
  eventsPastTitle: "Past Events",
  eventsEnquireLabel: "Enquire",
  eventsEnquireTitle: "Begin Your Maarga",
  eventsEnquireText: "You've read the fragments. The rest of the story is told standing inside it.",
  eventsEnquireCtaText: "Enquire Now",
  eventsEnquireCtaUrl: "/contact",
  eventsLedByTitle: "Led by our Intellects",
  eventsWhoTitle: "Who is this for",
  eventsPostTitle: "Post event",
  eventsGalleryTitle: "Gallery",
  eventsNoUpcoming: "No sessions are scheduled right now — the next ones are announced here first.",
  // Gallery Bank
  bankLabel: "Gallery",
  bankTitle: "Places do not speak for themselves. These do.",
  bankLocationLabel: "Location",
  bankEnquireLabel: "Enquire",
  bankEnquireTitle: "Begin Your Maarga",
  bankEnquireText: "You've read the fragments. The rest of the story is told standing inside it.",
  bankEnquireCtaText: "Book The Architecture of an Empire",
  bankEnquireCtaUrl: "/contact",
  // Destinations index
  destinationsLabel: "Destinations",
  destinationsTitle: "Every place, read the way it was built to be read.",
  destinationsIntro: "Choose a destination to see its itineraries, its gallery and the scholars who read it.",
};
export const SITE_MEDIA_KEYS = ["eventsHeroImage"] as const;
export const defaultSiteMedia = (): Record<string, string> => ({ eventsHeroImage: img("events-hero") });

const HAMPI_DAYS = [
  {
    title: "Arrival",
    image: img("itin-day1"),
    activities: [
      {
        title: "Sunset at Hemakuta hill",
        description:
          "A fifteen-minute climb on stone steps — the gentlest introduction Hampi offers, and still enough to leave you disoriented. From the top, boulders and ruins take the light together, indistinguishable from here.",
        icons: ["temple", "hiking", "sunset"],
      },
    ],
  },
  {
    title: "The empire at prayer",
    image: img("itin-day2"),
    activities: [
      {
        title: "Virupaksha Temple",
        description:
          "Still functioning, uninterrupted, since before the empire that surrounds it existed. Inside, an inverted image of the main gopuram appears on an interior wall — a pinhole effect, achieved without glass.",
        icons: ["temple", "hiking"],
      },
      {
        title: "Hampi Bazaar & Chakratirtha, by coracle",
        description: "A traditional coracle, spun rather than steered, carrying you to riverside carvings no road reaches.",
        icons: ["boat", "hiking"],
      },
      { title: "Achyutaraya Shrine", description: "A quieter valley, largely bypassed. Yali figures guard pillars carved with Krishna at his flute.", icons: ["temple", "hiking"] },
      { title: "Evening — Jugalbandi", description: "A private dialogue between two master musicians, in a setting built for exactly this kind of listening.", icons: ["music"] },
    ],
  },
  {
    title: "Stone made to speak",
    image: img("itin-day3"),
    activities: [
      {
        title: "Vijaya Vittala Temple & the stone chariot",
        description:
          "Musical pillars, each carved from a single block, each tuned to a distinct note. Colonial-era engineers cut several open looking for the mechanism. They found only stone. The pillars still sound.",
        icons: ["temple", "music", "cycling"],
      },
      { title: "Hazara Rama Temple", description: "Over a thousand carved panels, running the Ramayana in sequence from birth to the war against Ravana.", icons: ["temple", "hiking"] },
      {
        title: "Mahanavami Dibba & the stepped tank",
        description: "A platform built for a king to watch nine days of Navaratri, beside a tank whose descending steps mirror a ritual descent used across the empire's sacred architecture.",
        icons: ["temple", "hiking"],
      },
    ],
  },
  {
    title: "What the empire made permanent",
    image: img("itin-day4"),
    activities: [
      { title: "Ugra Narasimha & Kadalekalu Ganesha", description: "Two monolithic sculptures — one severe, one placed with a deliberate sightline across the bazaar toward Matanga Hill.", icons: ["temple"] },
      { title: "Badavilinga", description: "A linga kept permanently wet by a channel engineered from the Tungabhadra reservoir, fifteen kilometres away. Devotion, solved as a hydraulics problem.", icons: ["temple"] },
      {
        title: "Krishna Temple & Krishna Bazaar",
        description: "A textbook example of Dravidian-style Vijayanagara architecture, beside a street where contemporary accounts describe gold and diamonds traded in the open.",
        icons: ["temple", "hiking"],
      },
    ],
  },
  {
    title: "Beyond the ruins",
    image: img("itin-day5"),
    activities: [
      { title: "Lotus Mahal & Anantashayana Temple", description: "Indo-Islamic arches beside a temple left unfinished — two ideas of beauty, a short walk apart.", icons: ["temple", "cycling"] },
      { title: "Kishkindha", description: "The forest kingdom of the Ramayana — in tradition, the ground beneath your feet for most of this trip.", icons: ["hiking"] },
      { title: "Anegundi chai with the royal family", description: "The direct descendants of the Vijayanagara line still live here, in a mansion roughly 250 years old.", icons: ["coffee"] },
    ],
  },
  {
    title: "What outlived the empire",
    image: img("itin-day3"),
    activities: [
      { title: "Tungabhadra Dam", description: "India's largest stone masonry dam, built with sudha mortar and granite set without modern binding.", icons: ["hiking"] },
      {
        title: "Jaggery making & banana fibre weaving",
        description: "A working unit, not a demonstration — the full cycle of a circular local economy, alongside artisans turning discarded bark into textile.",
        icons: ["craft"],
      },
      { title: "Farewell dinner", description: "Stories and flavour from the week, and a small object to carry home.", icons: ["dining"] },
    ],
  },
  {
    title: "Departure",
    image: img("itin-day1"),
    activities: [{ title: "One last look at the boulders", description: "Filter coffee in hand. The empire doesn't conclude here. It just stops being in front of you.", icons: ["coffee", "sunset"] }],
  },
];

const STAY_TEXT =
  "Set inside the boulder landscape a short drive from the ruins, with mornings that start on the river and evenings that end under an unusually dark sky. Rooms are quiet, food is regional, and nothing about the day is hurried.";

export const ICONS: { key: string; name: string }[] = [
  { key: "temple", name: "Temple visit" },
  { key: "hiking", name: "Walk / climb" },
  { key: "cycling", name: "Cycling" },
  { key: "boat", name: "Coracle / boat" },
  { key: "music", name: "Music" },
  { key: "dining", name: "Meal" },
  { key: "craft", name: "Craft workshop" },
  { key: "sunset", name: "Sunset" },
  { key: "coffee", name: "Chai / coffee" },
];

export const EVENT_PRINCIPLES = [
  {
    title: "Live Scholar Sessions",
    body: "Held online, in small groups, with a scholar speaking on a subject they have spent decades inside — a temple's iconography, a manuscript tradition, the mathematics behind a water system. Conversation, not lecture. Questions are expected, not merely permitted.",
  },
  {
    title: "Knowledge Gatherings",
    body: "In-person, city-based, deliberately small. A scholar, a room, an evening. These are built for people who want the proximity a journey offers, without the travel a journey requires.",
  },
  {
    title: "Festival Sessions",
    body: "Tied to specific festivals and their calendar dates, led by a scholar who can explain what is actually being enacted — the philosophy inside the ritual, not a description of the ritual itself.",
  },
];

const FEEDBACK_QUOTE =
  "Led by a historian who has spent over two decades excavating and publishing on Vijayanagara's water systems. You will not just see the Virupaksha Temple — you will understand the hydraulic engineering that let a desert capital sustain half a million people.";

export async function seedSite(db: Db, { force = false } = {}) {
  /* ---- Destination codes + Hampi details ---- */
  await ensureDestinationCodes(db.destination);
  const hampi = await db.destination.findFirst({ where: { name: "Hampi" } });
  if (hampi && !hampi.heroTitle) {
    await db.destination.update({
      where: { id: hampi.id },
      data: {
        heroLabel: "HAMPI",
        heroTitle: "Experience the India in a never before pathway",
        heroImage: hampi.heroImage || img("exp-hero-hampi"),
        experienceUrl: "/experience",
        enquireLabel: "Enquire",
        enquireTitle: "Begin Your Maarga",
        enquireText: "Seven days. One empire, read the way it was built to be read.",
        enquireCtaText: "Enquire about this journey",
        enquireCtaUrl: "/contact",
      },
    });
  }

  /* ---- Icons ---- */
  if (force || (await db.activityIcon.count()) === 0) {
    await db.activityIcon.deleteMany();
    await db.activityIcon.createMany({
      data: ICONS.map((ic, i) => ({ id: `icon-${ic.key}`, name: ic.name, url: iconUrl(ic.key), status: "PUBLISHED", published: true, order: i })),
    });
  }

  /* ---- Itinerary (Hampi) ---- */
  if (hampi && (force || (await db.itinerary.count()) === 0)) {
    await db.itinerary.deleteMany();
    const code = await nextItineraryCode(db.itinerary, hampi.code || "HAM0001");
    await db.itinerary.create({
      data: {
        code,
        destinationId: hampi.id,
        label: "Journey Path",
        title: "The Temple Architects of the Deccan",
        durationLabel: "6 Days / 7 Nights",
        heroLabel: "HAMPI",
        heroTitle: "Experience the India in a never before pathway",
        heroCtaText: "Enquire about this journey",
        heroCtaUrl: "/contact",
        staysTitle: "Where you'll stay",
        intellectsLabel: "Intellects",
        intellectsTitle: "The Scholar Who Reads This Place",
        intellectsIntro:
          "Maarga's scholar network is not built on superficial accolades. Every intellectual we work with has spent decades fully integrated with their chosen field of inquiry — not adjacent to it.",
        enquireLabel: "Enquire",
        enquireTitle: "Begin Your Maarga",
        enquireText: "Seven days. One empire, read the way it was built to be read.",
        enquireCtaText: "Enquire about this journey",
        enquireCtaUrl: "/contact",
        days: HAMPI_DAYS.map((d) => ({ ...d, activities: d.activities.map((a) => ({ ...a, icons: a.icons.map((k) => `icon-${k}`) })) })),
        stays: [
          { name: "Evolve Back", description: STAY_TEXT, image: img("itin-stay1") },
          { name: "Shiva Vilas Palace", description: STAY_TEXT, image: img("itin-stay2") },
        ],
        iconOverrides: {},
        status: "PUBLISHED",
        published: true,
        order: 0,
      },
    });
    await db.destination.update({ where: { id: hampi.id }, data: { itineraries: 1 } });
  }

  /* ---- Scholar placements for the itinerary + events ---- */
  const profiles = await db.intellect.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { order: "asc" } });
  const itins = await db.itinerary.findMany();
  for (const it of itins) {
    const page = `itinerary:${it.id}`;
    if ((await db.intellectPlacement.count({ where: { page } })) === 0) {
      await db.intellectPlacement.createMany({
        data: profiles.slice(0, 3).map((p, i) => ({ page, intellectId: p.id, status: "PUBLISHED", published: true, order: i })),
      });
    }
  }

  /* ---- Events: overview + detail copy on the seeded events ---- */
  const events = await db.event.findMany({ orderBy: { order: "asc" } });
  const past = new Date();
  past.setMonth(past.getMonth() - 2);
  const future = new Date();
  future.setMonth(future.getMonth() + 2);
  for (const [i, ev] of events.entries()) {
    if (ev.subtitle) continue;
    const isPast = i >= 2; // the third seeded event becomes a past event so the "Past Events" row has content
    await db.event.update({
      where: { id: ev.id },
      data: {
        title: "The Water Beneath the Empire",
        subtitle: "Led by Karthikeyan Ram, on Vijayanagara's hydraulic engineering",
        description: "How a desert capital sustained half a million people — read through the channels, tanks, and aqueducts still standing at Hampi.",
        eventDate: isPast ? past : new Date(future.getTime() + i * 7 * 86400000),
        startTime: "10:00",
        endTime: "14:00",
        location: "Suchitra",
        image: ev.image || img("event-detail-hero"),
        body:
          "Half a million people lived here at the empire's height — on a semi-arid plateau, with a river that floods for three months and runs low for nine. This session reads the city through what made that possible: the canals cut into granite, the aqueducts that still carry water to banana groves, the stepped tanks whose geometry was as much ritual as reservoir.\n\nWe will look at the surviving structures one by one, place them on the map of the city, and ask what each tells us about the people who planned them.",
        whoIsThisFor:
          "For anyone who has stood in front of a monument and wondered how it worked, not just what it was. No prior knowledge is needed — only curiosity and the patience to look closely.",
        postEventText: isPast
          ? "Forty people spent a Saturday morning following water through a dead city. Below is some of what they said afterwards, and a few photographs from the day."
          : null,
        feedback: isPast
          ? [0, 1, 2].map(() => ({ quote: FEEDBACK_QUOTE, name: "Jane Doe", role: "Founder, Director Kmoay Tech" }))
          : [],
        bookUrl: "/contact",
        bookCtaText: "Book now",
        standardTicketPrice: 2400,
        earlyBirdEnabled: !isPast,
        earlyBirdPrice: 1800,
        earlyBirdNote: "*offer till 24th July",
        ctaText: "Know more",
        status: "PUBLISHED",
        published: true,
      },
    });
  }
  for (const ev of await db.event.findMany()) {
    const page = `event:${ev.id}`;
    if ((await db.intellectPlacement.count({ where: { page } })) === 0) {
      await db.intellectPlacement.createMany({
        data: profiles.slice(0, 3).map((p, i) => ({ page, intellectId: p.id, status: "PUBLISHED", published: true, order: i })),
      });
    }
  }

  if (force || (await db.eventPrinciple.count()) === 0) {
    await db.eventPrinciple.deleteMany();
    await db.eventPrinciple.createMany({ data: EVENT_PRINCIPLES.map((p, i) => ({ ...p, status: "PUBLISHED", published: true, order: i })) });
  }

  /* ---- Media library ---- */
  if (force || (await db.mediaAsset.count()) === 0) {
    await db.mediaAsset.deleteMany();
    const general = ["temple-elephant", "elephant-gateway", "blue-windows", "hampi-chariot", "gallery-1", "gallery-2", "gallery-3", "gallery-4", "heritage-5", "festival", "cta-temple", "temple-gateway"];
    const hampiFolder = hampi ? `destination:${hampi.id}` : "general";
    const hampiPics = ["hampi-chariot", "temple-elephant", "blue-windows", "elephant-gateway", "itin-day1", "itin-day2", "itin-day3", "itin-day4", "itin-day5", "exp-hero-hampi"];
    const pastEvent = events[2];
    const eventPics = pastEvent ? ["gallery-1", "gallery-2", "gallery-3", "gallery-4", "blue-windows"].map((g) => ({ g, folder: `event:${pastEvent.id}` })) : [];
    const rows = [
      ...general.map((g, i) => ({ url: img(g), alt: g.replace(/-/g, " "), folder: "general", inBank: i < 9, inFolderGallery: true, order: i })),
      ...hampiPics.map((g, i) => ({ url: img(g), alt: g.replace(/-/g, " "), folder: hampiFolder, inBank: i < 6, inFolderGallery: true, order: i })),
      ...eventPics.map(({ g, folder }, i) => ({ url: img(g), alt: g.replace(/-/g, " "), folder, inBank: false, inFolderGallery: true, order: i })),
    ];
    await db.mediaAsset.createMany({ data: rows.map((r) => ({ ...r, kind: "image", status: "PUBLISHED", published: true })) });
  }

  /* ---- Settings ---- */
  for (const [key, value] of Object.entries({ ...defaultSiteMedia() })) {
    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (!existing || force) await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  // the Experience page tabs now point at Hampi's itinerary & gallery
  if (hampi?.code) {
    for (const [key, value] of [
      ["expTabItineraryUrl", `/destinations/${hampi.code}/itinerary`],
      ["expTabGalleryUrl", `/destinations/${hampi.code}/gallery`],
    ] as const) {
      const existing = await db.siteSetting.findUnique({ where: { key } });
      if (!existing || existing.value === "/experience#itinerary" || existing.value === "/gallery") {
        await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
      }
    }
  }
}
