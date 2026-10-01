import type { AboutData, ExperienceData, HomepageData } from "./types";

/**
 * Figma placeholder content. Used ONLY when the API is unreachable (dev
 * convenience) so the page still renders; production content comes from
 * server/ via /api/homepage. Mirrors server/prisma/seed.ts.
 */
const LEAD =
  "Led by a historian who has spent over two decades excavating and publishing on Vijayanagara's water systems. You will not just see the Virupaksha Temple — you will understand the hydraulic engineering that let a desert capital sustain half a million people.";

export const placeholderHomepage: HomepageData = {
  intellects: [
    {
      id: "p1",
      name: "Mamtha Sridhar",
      designation: "HR Career at EY & Deloitte",
      description:
        "Translating her corporate legacy into structuring Maarga's academic frameworks, ensuring rigorous execution.",
      image: "/images/intellect-mamtha.jpg",
      order: 0,
    },
    {
      id: "p2",
      name: "Karthikeyan Ram",
      designation: "Vedanta & Yajurveda Scholar",
      description:
        "Anchoring Maarga's philosophical depth, bridging the scriptural with physical landscapes.",
      image: "/images/intellect-karthikeyan.jpg",
      order: 1,
    },
    {
      id: "p3",
      name: "Sridhar Rajagopal",
      designation: "30+ Years Social Impact",
      description:
        "Weaving community stewardship into Maarga's journeys, building local preservation loops.",
      image: "/images/intellect-sridhar.jpg",
      order: 2,
    },
  ],
  trips: [0, 1, 2].map((i) => ({
    id: `t${i}`,
    image: "/images/hampi-chariot.jpg",
    category: "The Architecture of an Empire",
    heading: "Hampi, Karnataka",
    subtitle: "UNESCO World Heritage Site",
    dates: "14–21 Oct 2026",
    duration: "3 days 2 nights",
    body: LEAD,
    bookNowUrl: "/experience/hampi",
    order: i,
  })),
  destinations: [
    { id: "d0", name: "Hampi", region: "Karnataka", heroImage: "/images/elephant-gateway.jpg" },
    { id: "d1", name: "Loren Ipsum", region: "", heroImage: "/images/hampi-chariot.jpg" },
    { id: "d2", name: "Loren Ipsum", region: "", heroImage: "/images/blue-windows.jpg" },
    { id: "d3", name: "Loren Ipsum", region: "", heroImage: "/images/temple-elephant.jpg" },
    { id: "d4", name: "Hampi", region: "Karnataka", heroImage: "/images/heritage-5.jpg" },
  ],
  events: ["/images/event-toscana.jpg", "/images/event-como.jpg", "/images/event-toscana.jpg"].map(
    (image, i) => ({
      id: `e${i}`,
      title: "Hampi, Karnataka",
      description: LEAD,
      category: "The Architecture of an Empire",
      eventDate: "2026-10-14T00:00:00.000Z",
      startTime: "10:00",
      endTime: "13:00",
      duration: "3 days 2 nights",
      location: "UNESCO World Heritage Site",
      image,
      format: "OFFLINE",
    })
  ),
  testimonials: [0, 1, 2, 3, 4].map((i) => ({
    id: `s${i}`,
    quote: LEAD,
    travellerName: "Jane Doe",
    role: "Founder, Director Kmoay Tech",
    order: i,
  })),
  gallery: [
    "temple-elephant",
    "elephant-gateway",
    "blue-windows",
    "elephant-gateway",
    "blue-windows",
    "temple-elephant",
  ].map((n, i) => ({ id: `g${i}`, url: `/images/${n}.jpg`, alt: n.replace(/-/g, " "), order: i })),
  settings: {
    festivalImage: "/images/festival.jpg",
    ctaImage: "/images/cta-temple.jpg",
  },
};

/** About page placeholder (mirrors server/src/lib/seedData.ts seedAbout). */
export const placeholderAbout: AboutData = {
  cards: [
    {
      id: "c1",
      title: "We will not treat history as static monument.",
      body: "Every site we explore is approached as an ongoing living narrative, connecting raw geographical space to local classical philosophy.",
      image: "/images/cta-temple.jpg",
      order: 0,
    },
    {
      id: "c2",
      title: "We will not rush to fit dynamic itineraries.",
      body: "An exploration is an act of deep attention. We choose to spend entire half days under the shade of a single mandapa to grasp its design.",
      image: "/images/cta-temple.jpg",
      order: 1,
    },
    {
      id: "c3",
      title: "We will not deploy generalist curators.",
      body: "If we explore Vedic temple layouts, you are led by a scholar of Agamic liturgy. If we read temple carvings, you walk with an epigraphist.",
      image: "/images/cta-temple.jpg",
      order: 2,
    },
  ],
  founders: placeholderHomepage.intellects.map((p) => ({
    id: `f-${p.id}`,
    name: p.name,
    designation: p.designation,
    description: p.description,
    image: p.image,
    order: p.order,
  })),
  intellects: [...placeholderHomepage.intellects, ...placeholderHomepage.intellects.map((p) => ({ ...p, id: `${p.id}-b`, order: p.order + 3 }))],
  settings: {
    ctaImage: "/images/cta-temple.jpg",
    aboutGalleryEdgeLeft: "/images/elephant-gateway.jpg",
    aboutGalleryLeftTop: "/images/hampi-chariot.jpg",
    aboutGalleryLeftBottom: "/images/blue-windows.jpg",
    aboutGalleryCentre: "/images/temple-gateway.jpg",
    aboutGalleryRightTop: "/images/hampi-chariot.jpg",
    aboutGalleryRightBottom: "/images/blue-windows.jpg",
    aboutGalleryEdgeRight: "/images/elephant-gateway.jpg",
  },
};

/** Experience page placeholder (mirrors server/src/lib/seedData.ts seedExperience). */
export const placeholderExperience: ExperienceData = {
  sites: [
    {
      id: "s1",
      title: "The Boulders",
      lensALabel: "Engineering",
      lensAText:
        "These granite formations are fragments of the Peninsular Gneiss, among the oldest exposed rock on Earth, shaped over millions of years by weathering that split solid stone along its natural fault lines. What looks like ruin is closer to geology than history.",
      lensBLabel: "Mythology",
      lensBText:
        "Long before empire, this land had a name: Kishkindha, the forest kingdom of the Ramayana. These same boulders are, in tradition, the terrain Hanuman crossed and Sugriva ruled. The stones were sacred before they were strategic.",
      image: "/images/exp-sketch-boulders.jpg",
      figure: "boulders",
      figureLeft: "18.6",
      figureTop: "77",
      ctaText: "*Click here on the person to experience the sight digitally",
      order: 0,
    },
    {
      id: "s2",
      title: "The Musical Pillars, Vitthala Temple",
      lensALabel: "Engineering",
      lensAText:
        "Each of the fifty-six pillars in the temple's hall is carved from a single block of stone, and each produces a distinct note when struck — calibrated by density, dimension, and hollow space, not decoration. No one has fully reconstructed how the sculptors tuned stone with this precision.",
      lensBLabel: "Cosmology",
      lensBText:
        "The pillars were built to sound, not just to stand. In a temple dedicated to Vishnu as Vitthala, music was never separate from worship — the architecture itself was built to perform.",
      image: "/images/exp-sketch-pillars.jpg",
      figure: "pillars",
      figureLeft: "24.4",
      figureTop: "80",
      order: 1,
    },
    {
      id: "s3",
      title: "The Stepped Tank",
      lensALabel: "Engineering",
      lensAText:
        "Every stone in this tank interlocks without mortar, cut to a geometric symmetry precise enough that the structure has held its shape for five centuries through monsoon after monsoon.",
      lensBLabel: "Cosmology",
      lensBText:
        "Water here was never just infrastructure. The tank's descending steps mirror a ritual descent — the same geometry used to define sacred space in temple architecture across the empire. To bathe here was to enter a diagram.",
      image: "/images/exp-sketch-tank.jpg",
      figure: "tank",
      figureLeft: "12.8",
      figureTop: "41.6",
      order: 2,
    },
    {
      id: "s4",
      title: "Virupaksha Temple",
      lensALabel: "Engineering",
      lensAText: "The temple's main tower rises over fifty metres, built centuries before mechanised lifting existed, using ramps and calculation alone.",
      lensBLabel: "Cosmology",
      lensBText:
        "Virupaksha is a form of Shiva, married in local tradition to Pampa — the river goddess for whom this entire region is named. Hampi is Pampa, softened by language over centuries. The place and the goddess share one name because, in the old understanding, they were never separate.",
      image: "/images/exp-sketch-virupaksha.jpg",
      figure: "virupaksha",
      figureLeft: "55.4",
      figureTop: "77.8",
      order: 3,
    },
  ],
  fragments: [
    "Hampi's bazaar street once ran wide enough for elephants and horse traders from Persia and Portugal to walk it side by side. Some of the stone platforms that lined it are still standing. No one has fully mapped what was sold where.",
    "The Vijayanagara kings watered a semi-arid plateau with a lattice of canals and aqueducts so precise that some still irrigate banana groves today. The engineering outlived the empire by five centuries.",
    "Coins, Persian chronicles and Portuguese travellers' diaries agree on one thing: at its height the city may have held half a million people — larger than any European capital of its day.",
  ].map((text, i) => ({ id: `fr${i}`, text, order: i })),
  questions: [
    "How did sculptors tune stone to produce music, five hundred years before the physics of acoustics was formally understood?",
    "Was the city truly abandoned in a single event in 1565, or did its decline happen more slowly than the story suggests?",
  ].map((text, i) => ({ id: `q${i}`, text, order: i })),
  intellects: placeholderHomepage.intellects,
  settings: {
    ctaImage: "/images/cta-temple.jpg",
    expHeroImage: "/images/exp-hero-hampi.jpg",
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
    expEnquireCtaText: "Book The Architecture of an Empire",
    expEnquireCtaUrl: "/contact",
    expTabExperienceText: "Experience",
    expTabExperienceUrl: "/experience",
    expTabItineraryText: "Itinerary",
    expTabItineraryUrl: "/experience#itinerary",
    expTabGalleryText: "Gallery",
    expTabGalleryUrl: "/gallery",
  },
};
