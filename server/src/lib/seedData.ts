import type { Delegate, ModelName } from "./fileStore";

/**
 * Placeholder homepage content taken from the Figma. Used by
 *   - `npm run seed`   (Postgres, via prisma/seed.ts)
 *   - the file store   (automatically, the first time the API starts without a DB)
 * Image URLs point at the placeholder photos in server/public/images (served at /static).
 */
type Db = Record<ModelName, Delegate>;

/* Placeholder photos are served by the API itself (server/public/images → /static/images)
   so they work for the site AND the admin preview no matter which ports they run on. */
/* On Vercel everything shares one domain, so use relative paths served by the client (client/public/images). */
const ON_VERCEL = !!process.env.VERCEL && !process.env.CLIENT_PUBLIC_URL && !process.env.PUBLIC_URL;
const BASE = ON_VERCEL ? "" : (process.env.CLIENT_PUBLIC_URL || process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
export const img = (name: string) =>
  ON_VERCEL || process.env.CLIENT_PUBLIC_URL ? `${BASE}/images/${name}.jpg` : `${BASE}/static/images/${name}.jpg`;

export const LEAD =
  "Led by a historian who has spent over two decades excavating and publishing on Vijayanagara's water systems. You will not just see the Virupaksha Temple — you will understand the hydraulic engineering that let a desert capital sustain half a million people.";

/** Section buttons/links that the client can rename or repoint from the CMS. */
export const DEFAULT_LINK_SETTINGS: Record<string, string> = {
  navContactText: "Contact Us",
  navContactUrl: "/contact",
  sketchCtaText: "Learn more About us",
  sketchCtaUrl: "/about",
  whyMaargaCtaText: "Our experiences",
  whyMaargaCtaUrl: "/experience",
  intellectsCtaText: "Meet our intellectuals",
  intellectsCtaUrl: "/about",
  enquireCtaText: "Contact Us",
  enquireCtaUrl: "/contact",
  // About page
  aboutWhyCtaText: "View our destinations",
  aboutWhyCtaUrl: "/destinations",
  // Experience page
  expEnquireCtaText: "Book The Architecture of an Empire",
  expEnquireCtaUrl: "/contact",
  expTabExperienceText: "Experience",
  expTabExperienceUrl: "/experience",
  expTabItineraryText: "Itinerary",
  expTabItineraryUrl: "/experience#itinerary",
  expTabGalleryText: "Gallery",
  expTabGalleryUrl: "/gallery",
};

/**
 * Experience page copy (every heading / paragraph the client may want to change).
 * Stored as settings; keys listed here are accepted by PUT /settings/:key.
 */
export const EXPERIENCE_TEXT_DEFAULTS: Record<string, string> = {
  expHeroLabel: "HAMPI",
  expHeroTitle: "Experience the India in a never before pathway",
  expPlaceName: "Hampi,",
  expPlaceRegion: "Karnataka",
  expOverviewTitle: "Overview",
  expOverviewText:
    "Hampi sits on the southern bank of the Tungabhadra river, in Karnataka's Bellary district — the last capital of the Vijayanagara Empire, and, in far older memory, the forest kingdom the Ramayana calls Kishkindha. What survives today across these 4,100 hectares is not a single monument but an entire capital: temples, markets, aqueducts, and royal enclosures, still legible in stone five centuries after the city fell.\n\nMost visitors see a fraction of it in an afternoon. Maarga does not.",
  expToldLabel: "What You've Been Told",
  expToldText: "Vijayanagara Empire. 14th century. UNESCO World Heritage Site.\nCapital of one of the largest empires in Indian history, abandoned after 1565.",
  expLensesTitle: "Two Lenses, One Place",
  expLensesSub: "Read as Engineering / Read as Cosmology",
  expClickHint: "*Click here on the person to experience the sight digitally",
  expFragmentsLabel: "Fragments",
  expFragmentsHint: "Scroll down for next",
  expIntellectsLabel: "Intellects",
  expIntellectsTitle: "The Scholar Who Reads This Place",
  expIntellectsIntro:
    "Maarga's scholar network is not built on superficial accolades. Every intellectual we work with has spent decades fully integrated with their chosen field of inquiry — not adjacent to it.",
  expQuestionsTitle: "Questions Hampi Still Asks",
  expEnquireLabel: "Enquire",
  expEnquireTitle: "Begin Your Maarga",
  expEnquireText: "You've read the fragments. The rest of the story is told standing inside it.",
  // About page — intellects section copy
  aboutIntellectsLabel: "Intellects",
  aboutIntellectsTitle: "The Reason the Journey Becomes an Education",
  aboutIntellectsIntro:
    "Maarga's scholar network is not built on superficial accolades. Every intellectual we work with has spent decades fully integrated with their chosen field of inquiry not adjacent to it.",
};
/** Experience page media settings (uploads). */
export const EXPERIENCE_MEDIA_KEYS = ["expHeroImage", "expMapIcon"] as const;
export const defaultExperienceMedia = (): Record<string, string> => ({ expHeroImage: img("exp-hero-hampi") });

/**
 * About page → "Not Archival. Alive." photo composition. Seven slots, left to
 * right as the visitor sees them; each is a setting the client can replace.
 * Defaults mirror the Figma (same photo on the mirrored left/right tiles).
 */
export const ABOUT_GALLERY_KEYS = [
  "aboutGalleryEdgeLeft",
  "aboutGalleryLeftTop",
  "aboutGalleryLeftBottom",
  "aboutGalleryCentre",
  "aboutGalleryRightTop",
  "aboutGalleryRightBottom",
  "aboutGalleryEdgeRight",
] as const;
export const defaultAboutGallery = (): Record<string, string> => ({
  aboutGalleryEdgeLeft: img("elephant-gateway"),
  aboutGalleryLeftTop: img("hampi-chariot"),
  aboutGalleryLeftBottom: img("blue-windows"),
  aboutGalleryCentre: img("temple-gateway"),
  aboutGalleryRightTop: img("hampi-chariot"),
  aboutGalleryRightBottom: img("blue-windows"),
  aboutGalleryEdgeRight: img("elephant-gateway"),
});

/** Default hover photo behind the three manifesto cards (the client can change it per card). */
export const defaultManifestoImage = () => img("cta-temple");

export async function seedHomepage(db: Db, { force = false } = {}) {
  /* ---- Intellects ---- */
  if (force || (await db.intellect.count()) === 0) {
    await db.intellect.deleteMany();
    await db.intellect.createMany({
      data: [
        {
          name: "Mamtha Sridhar",
          designation: "HR Career at EY & Deloitte",
          description: "Translating her corporate legacy into structuring Maarga's academic frameworks, ensuring rigorous execution.",
          image: img("intellect-mamtha"),
          order: 0,
        },
        {
          name: "Karthikeyan Ram",
          designation: "Vedanta & Yajurveda Scholar",
          description: "Anchoring Maarga's philosophical depth, bridging the scriptural with physical landscapes.",
          image: img("intellect-karthikeyan"),
          order: 1,
        },
        {
          name: "Sridhar Rajagopal",
          designation: "30+ Years Social Impact",
          description: "Weaving community stewardship into Maarga's journeys, building local preservation loops.",
          image: img("intellect-sridhar"),
          order: 2,
        },
      ].map((d) => ({ ...d, status: "PUBLISHED", published: true })),
    });
  }

  /* ---- Trips ---- */
  if (force || (await db.trip.count()) === 0) {
    await db.trip.deleteMany();
    await db.trip.createMany({
      data: [0, 1, 2].map((i) => ({
        image: img("hampi-chariot"),
        category: "The Architecture of an Empire",
        heading: "Hampi, Karnataka",
        subtitle: "UNESCO World Heritage Site",
        dates: "14–21 Oct 2026",
        duration: "3 days 2 nights",
        body: LEAD,
        bookNowUrl: "/experience/hampi",
        primaryCtaText: "Experience Hampi with us",
        secondaryCtaText: "View Itinerary",
        secondaryCtaUrl: "/experience/hampi",
        status: "PUBLISHED",
        published: true,
        order: i,
      })),
    });
  }

  /* ---- Destinations ---- */
  if (force || (await db.destination.count()) === 0) {
    await db.destination.deleteMany();
    const names = ["Hampi", "Badami", "Pattadakal", "Aihole", "Belur"];
    const images = ["elephant-gateway", "hampi-chariot", "blue-windows", "temple-elephant", "heritage-5"];
    await db.destination.createMany({
      data: names.map((name, i) => ({
        name,
        region: "Karnataka",
        status: "PUBLISHED",
        published: true,
        heroImage: img(images[i]),
        order: i,
      })),
    });
  }

  /* ---- Events ---- */
  if (force || (await db.event.count()) === 0) {
    await db.event.deleteMany();
    await db.event.createMany({
      data: [
        { image: img("event-toscana"), order: 0 },
        { image: img("event-como"), order: 1 },
        { image: img("event-toscana"), order: 2 },
      ].map((e) => ({
        title: "Hampi, Karnataka",
        description: LEAD,
        category: "The Architecture of an Empire",
        location: "UNESCO World Heritage Site",
        eventDate: new Date("2026-10-14T00:00:00.000Z"),
        startTime: "10:00",
        endTime: "13:00",
        duration: "3 days 2 nights",
        format: "OFFLINE",
        status: "PUBLISHED",
        visibility: "PUBLIC",
        published: true,
        ctaText: "Know more",
        image: e.image,
        order: e.order,
      })),
    });
  }

  /* ---- Testimonials ---- */
  if (force || (await db.testimonial.count()) === 0) {
    await db.testimonial.deleteMany();
    await db.testimonial.createMany({
      data: [0, 1, 2, 3, 4].map((i) => ({
        quote: LEAD,
        travellerName: "Jane Doe",
        role: "Founder, Director Kmoay Tech",
        status: "PUBLISHED",
        published: true,
        order: i,
      })),
    });
  }

  /* ---- Gallery ---- */
  if (force || (await db.galleryImage.count()) === 0) {
    await db.galleryImage.deleteMany();
    const gallery = ["temple-elephant", "elephant-gateway", "blue-windows", "elephant-gateway", "blue-windows", "temple-elephant"];
    await db.galleryImage.createMany({
      data: gallery.map((g, i) => ({ url: img(g), alt: g.replace(/-/g, " "), status: "PUBLISHED", published: true, order: i })),
    });
  }

  await seedAbout(db, { force });
  await seedExperience(db, { force });

  /* ---- Settings (only fill keys that are empty) ---- */
  const wanted: Record<string, string> = {
    festivalImage: img("festival"),
    ctaImage: img("cta-temple"),
    ...DEFAULT_LINK_SETTINGS,
  };
  for (const [key, value] of Object.entries(wanted)) {
    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (!existing || force) await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}

/**
 * About page content only (manifesto cards, founders, photo slots). Also run
 * on an EXISTING file store at boot so a data file created before the About
 * page existed gets its new sections without touching homepage content.
 */
export async function seedAbout(db: Db, { force = false } = {}) {
  /* ---- Manifesto cards ---- */
  if (force || (await db.aboutCard.count()) === 0) {
    await db.aboutCard.deleteMany();
    await db.aboutCard.createMany({
      data: [
        {
          title: "We will not treat history as static monument.",
          body: "Every site we explore is approached as an ongoing living narrative, connecting raw geographical space to local classical philosophy.",
        },
        {
          title: "We will not rush to fit dynamic itineraries.",
          body: "An exploration is an act of deep attention. We choose to spend entire half days under the shade of a single mandapa to grasp its design.",
        },
        {
          title: "We will not deploy generalist curators.",
          body: "If we explore Vedic temple layouts, you are led by a scholar of Agamic liturgy. If we read temple carvings, you walk with an epigraphist.",
        },
      ].map((c, i) => ({ ...c, image: defaultManifestoImage(), status: "PUBLISHED", published: true, order: i })),
    });
  }

  /* ---- Founders ---- */
  if (force || (await db.founder.count()) === 0) {
    await db.founder.deleteMany();
    await db.founder.createMany({
      data: [
        {
          name: "Mamtha Sridhar",
          designation: "HR Career at EY & Deloitte",
          description: "Translating her corporate legacy into structuring Maarga's academic frameworks, ensuring rigorous execution.",
          image: img("intellect-mamtha"),
        },
        {
          name: "Karthikeyan Ram",
          designation: "Vedanta & Yajurveda Scholar",
          description: "Anchoring Maarga's philosophical depth, bridging the scriptural with physical landscapes.",
          image: img("intellect-karthikeyan"),
        },
        {
          name: "Sridhar Rajagopal",
          designation: "30+ Years Social Impact",
          description: "Weaving community stewardship into Maarga's journeys, building local preservation loops.",
          image: img("intellect-sridhar"),
        },
      ].map((f, i) => ({ ...f, status: "PUBLISHED", published: true, order: i })),
    });
  }

  for (const [key, value] of Object.entries(defaultAboutGallery())) {
    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (!existing || force) await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}

/**
 * Per-page scholar placements + Experience page content. Runs on every boot
 * (like seedAbout) so existing stores get the new sections without touching
 * anything else. Placements are created from the library profiles.
 */
export async function seedExperience(db: Db, { force = false } = {}) {
  const profiles = await db.intellect.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { order: "asc" } });

  for (const page of ["about", "experience"] as const) {
    if (force) await db.intellectPlacement.deleteMany({ where: { page } });
    if ((await db.intellectPlacement.count({ where: { page } })) === 0) {
      const chosen = page === "about" ? profiles : profiles.slice(0, 3);
      await db.intellectPlacement.createMany({
        data: chosen.map((p, i) => ({ page, intellectId: p.id, status: "PUBLISHED", published: true, order: i })),
      });
    }
  }

  if (force || (await db.experienceSite.count()) === 0) {
    await db.experienceSite.deleteMany();
    await db.experienceSite.createMany({
      data: [
        {
          title: "The Boulders",
          lensALabel: "Engineering",
          lensAText:
            "These granite formations are fragments of the Peninsular Gneiss, among the oldest exposed rock on Earth, shaped over millions of years by weathering that split solid stone along its natural fault lines. What looks like ruin is closer to geology than history.",
          lensBLabel: "Mythology",
          lensBText:
            "Long before empire, this land had a name: Kishkindha, the forest kingdom of the Ramayana. These same boulders are, in tradition, the terrain Hanuman crossed and Sugriva ruled. The stones were sacred before they were strategic.",
          image: img("exp-sketch-boulders"),
          figure: "boulders",
          figureLeft: "18.6",
          figureTop: "77",
          ctaText: "*Click here on the person to experience the sight digitally",
          ctaUrl: "",
        },
        {
          title: "The Musical Pillars, Vitthala Temple",
          lensALabel: "Engineering",
          lensAText:
            "Each of the fifty-six pillars in the temple's hall is carved from a single block of stone, and each produces a distinct note when struck — calibrated by density, dimension, and hollow space, not decoration. No one has fully reconstructed how the sculptors tuned stone with this precision.",
          lensBLabel: "Cosmology",
          lensBText:
            "The pillars were built to sound, not just to stand. In a temple dedicated to Vishnu as Vitthala, music was never separate from worship — the architecture itself was built to perform.",
          image: img("exp-sketch-pillars"),
          figure: "pillars",
          figureLeft: "24.4",
          figureTop: "80",
        },
        {
          title: "The Stepped Tank",
          lensALabel: "Engineering",
          lensAText:
            "Every stone in this tank interlocks without mortar, cut to a geometric symmetry precise enough that the structure has held its shape for five centuries through monsoon after monsoon.",
          lensBLabel: "Cosmology",
          lensBText:
            "Water here was never just infrastructure. The tank's descending steps mirror a ritual descent — the same geometry used to define sacred space in temple architecture across the empire. To bathe here was to enter a diagram.",
          image: img("exp-sketch-tank"),
          figure: "tank",
          figureLeft: "12.8",
          figureTop: "41.6",
        },
        {
          title: "Virupaksha Temple",
          lensALabel: "Engineering",
          lensAText: "The temple's main tower rises over fifty metres, built centuries before mechanised lifting existed, using ramps and calculation alone.",
          lensBLabel: "Cosmology",
          lensBText:
            "Virupaksha is a form of Shiva, married in local tradition to Pampa — the river goddess for whom this entire region is named. Hampi is Pampa, softened by language over centuries. The place and the goddess share one name because, in the old understanding, they were never separate.",
          image: img("exp-sketch-virupaksha"),
          figure: "virupaksha",
          figureLeft: "55.4",
          figureTop: "77.8",
        },
      ].map((x, i) => ({ ...x, status: "PUBLISHED", published: true, order: i })),
    });
  }

  if (force || (await db.experienceFragment.count()) === 0) {
    await db.experienceFragment.deleteMany();
    await db.experienceFragment.createMany({
      data: [
        "Hampi's bazaar street once ran wide enough for elephants and horse traders from Persia and Portugal to walk it side by side. Some of the stone platforms that lined it are still standing. No one has fully mapped what was sold where.",
        "The Vijayanagara kings watered a semi-arid plateau with a lattice of canals and aqueducts so precise that some still irrigate banana groves today. The engineering outlived the empire by five centuries.",
        "Coins, Persian chronicles and Portuguese travellers' diaries agree on one thing: at its height the city may have held half a million people — larger than any European capital of its day.",
      ].map((text, i) => ({ text, status: "PUBLISHED", published: true, order: i })),
    });
  }

  if (force || (await db.experienceQuestion.count()) === 0) {
    await db.experienceQuestion.deleteMany();
    await db.experienceQuestion.createMany({
      data: [
        "How did sculptors tune stone to produce music, five hundred years before the physics of acoustics was formally understood?",
        "Was the city truly abandoned in a single event in 1565, or did its decline happen more slowly than the story suggests?",
      ].map((text, i) => ({ text, status: "PUBLISHED", published: true, order: i })),
    });
  }

  for (const [key, value] of Object.entries(defaultExperienceMedia())) {
    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (!existing || force) await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}
