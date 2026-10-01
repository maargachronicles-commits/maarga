/* Shapes returned by GET /api/homepage (server/src/routes/homepage.ts) */

export interface Intellect {
  id: string;
  name: string;
  designation: string;
  description: string;
  image: string;
  /** Optional per-card button (shown only when ctaText is set) — editable in the CMS. */
  ctaText?: string | null;
  ctaUrl?: string | null;
  order: number;
}

export interface Trip {
  id: string;
  image: string;
  category: string;
  heading: string;
  subtitle?: string | null;
  dates: string;
  duration: string;
  body: string;
  bookNowUrl: string;
  /** Button labels — editable in the CMS. Fallbacks are applied in Trips.tsx. */
  primaryCtaText?: string | null;
  secondaryCtaText?: string | null;
  secondaryCtaUrl?: string | null;
  order: number;
}

export interface Destination {
  id: string;
  name: string;
  subtitle?: string | null;
  region: string;
  heroImage?: string | null;
  heroImageAltText?: string | null;
  /** Optional label under the name + where the card links (default /destinations/[id]). */
  ctaText?: string | null;
  ctaUrl?: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  duration?: string | null;
  location?: string | null;
  image?: string | null;
  imageAltText?: string | null;
  meetingLink?: string | null;
  /** Button label + link — editable in the CMS. */
  ctaText?: string | null;
  ctaUrl?: string | null;
  format: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  travellerName: string;
  role?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  order: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string | null;
  /** Optional link the tile opens. */
  ctaUrl?: string | null;
  order: number;
}

/** A button/link whose label + destination the CMS controls. */
export interface LinkSetting {
  text: string;
  href: string;
}

/** Keys of `settings` that are button/link pairs (see server/src/lib/seedData.ts). */
export type LinkSettingKey = "navContact" | "sketchCta" | "whyMaargaCta" | "intellectsCta" | "enquireCta" | "aboutWhyCta";

export function linkSetting(
  settings: Partial<Record<string, string>>,
  key: LinkSettingKey,
  fallback: LinkSetting
): LinkSetting {
  return {
    text: settings[`${key}Text`]?.trim() || fallback.text,
    href: settings[`${key}Url`]?.trim() || fallback.href,
  };
}

/* ---------- About page (GET /api/about) ---------- */

/** "A New Paradigm of Living Wisdom" card; `image` is revealed behind the card on hover. */
export interface AboutCard {
  id: string;
  title: string;
  body: string;
  image: string;
  order: number;
}

export interface Founder {
  id: string;
  name: string;
  designation: string;
  description: string;
  image: string;
  order: number;
}

/** Seven photo slots of the "Not Archival. Alive." composition, left → right. */
export const ABOUT_GALLERY_KEYS = [
  "aboutGalleryEdgeLeft",
  "aboutGalleryLeftTop",
  "aboutGalleryLeftBottom",
  "aboutGalleryCentre",
  "aboutGalleryRightTop",
  "aboutGalleryRightBottom",
  "aboutGalleryEdgeRight",
] as const;
export type AboutGalleryKey = (typeof ABOUT_GALLERY_KEYS)[number];

/**
 * A scholar as placed on one page (About / Experience). Resolved by the API:
 * library profile + this page's overrides. `overrides` lists the fields the
 * client changed on this page only.
 */
export interface PlacedIntellect extends Intellect {
  intellectId?: string | null;
  overrides?: string[];
}

export interface AboutData {
  cards: AboutCard[];
  founders: Founder[];
  intellects: PlacedIntellect[];
  settings: Partial<Record<"ctaImage" | AboutGalleryKey | `${LinkSettingKey}Text` | `${LinkSettingKey}Url`, string>> & Partial<Record<string, string>>;
}

/* ---------- Experience page (GET /api/experience) ---------- */

export type ExperienceFigure = "boulders" | "pillars" | "tank" | "virupaksha";

/** One numbered site of "Two Lenses, One Place". */
export interface ExperienceSite {
  id: string;
  title: string;
  lensALabel?: string | null;
  lensAText?: string | null;
  lensBLabel?: string | null;
  lensBText?: string | null;
  image: string;
  figure?: ExperienceFigure | string | null;
  /** position of the sketched figure inside the sketch, in % of its width / height */
  figureLeft?: string | null;
  figureTop?: string | null;
  /** hint under the sketch + link the figure opens */
  ctaText?: string | null;
  ctaUrl?: string | null;
  order: number;
}

export interface TextItem {
  id: string;
  text: string;
  order: number;
}

export interface ExperienceData {
  sites: ExperienceSite[];
  fragments: TextItem[];
  questions: TextItem[];
  intellects: PlacedIntellect[];
  settings: Partial<Record<string, string>>;
}

/** True when a CMS media URL points at a video (Cloudinary /video/ path or a video file extension). */
export function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\/video\/upload\//.test(url) || /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);
}

export interface HomepageData {
  intellects: Intellect[];
  trips: Trip[];
  destinations: Destination[];
  events: EventItem[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
  settings: Partial<Record<"festivalImage" | "ctaImage" | "heroVideo" | "tripsIntro" | "eventsIntro" | `${LinkSettingKey}Text` | `${LinkSettingKey}Url`, string>>;
}

/* ---------- Destinations, itineraries, events, gallery (GET /api/site/*) ---------- */

export interface DestinationPage {
  id: string;
  code: string;
  name: string;
  region?: string | null;
  subtitle?: string | null;
  heroImage?: string | null;
  heroLabel?: string | null;
  heroTitle?: string | null;
  experienceUrl?: string | null;
  enquireLabel?: string | null;
  enquireTitle?: string | null;
  enquireText?: string | null;
  enquireCtaText?: string | null;
  enquireCtaUrl?: string | null;
}

export interface ItinerarySummary {
  id: string;
  code: string;
  title: string;
  durationLabel?: string | null;
  label?: string | null;
  days: number;
}

export interface ItineraryActivity {
  title: string;
  description?: string;
  /** ids into `icons` */
  icons?: string[];
}
export interface ItineraryDay {
  title: string;
  image?: string;
  activities: ItineraryActivity[];
}
export interface ItineraryStay {
  name: string;
  description?: string;
  image?: string;
}
export interface ActivityIcon {
  id: string;
  name: string;
  url: string;
}

export interface Itinerary {
  id: string;
  code: string;
  destinationId: string;
  label?: string | null;
  title: string;
  durationLabel?: string | null;
  heroImage?: string | null;
  heroLabel?: string | null;
  heroTitle?: string | null;
  heroCtaText?: string | null;
  heroCtaUrl?: string | null;
  staysTitle?: string | null;
  intellectsLabel?: string | null;
  intellectsTitle?: string | null;
  intellectsIntro?: string | null;
  enquireLabel?: string | null;
  enquireTitle?: string | null;
  enquireText?: string | null;
  enquireCtaText?: string | null;
  enquireCtaUrl?: string | null;
  pdfUrl?: string | null;
  days: ItineraryDay[];
  stays: ItineraryStay[];
}

export interface MediaItem {
  id: string;
  url: string;
  alt?: string | null;
  kind: "image" | "video" | string;
  folder?: string;
  location?: string | null;
}

export interface DestinationsIndexData {
  destinations: (DestinationPage & { itineraries: ItinerarySummary[] })[];
  settings: Partial<Record<string, string>>;
}
export interface DestinationData {
  destination: DestinationPage;
  itineraries: ItinerarySummary[];
  gallery: MediaItem[];
  settings: Partial<Record<string, string>>;
}
export interface ItineraryData {
  destination: DestinationPage;
  itinerary: Itinerary;
  icons: Record<string, ActivityIcon>;
  siblings: ItinerarySummary[];
  intellects: PlacedIntellect[];
  settings: Partial<Record<string, string>>;
}

export interface EventFeedback {
  quote: string;
  name?: string;
  role?: string;
}
export interface SiteEvent {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  eventDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  format?: string | null;
  meetingLink?: string | null;
  image?: string | null;
  imageAltText?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  body?: string | null;
  whoIsThisFor?: string | null;
  postEventText?: string | null;
  feedback: EventFeedback[];
  bookUrl?: string | null;
  bookCtaText?: string | null;
  standardTicketPrice?: number | null;
  earlyBirdEnabled?: boolean;
  earlyBirdPrice?: number | null;
  earlyBirdNote?: string | null;
  isPast?: boolean;
}
export interface EventPrinciple {
  id: string;
  title: string;
  body: string;
}
export interface EventsData {
  upcoming: SiteEvent[];
  past: SiteEvent[];
  principles: EventPrinciple[];
  settings: Partial<Record<string, string>>;
}
export interface EventDetailData {
  event: SiteEvent;
  intellects: PlacedIntellect[];
  gallery: MediaItem[];
  settings: Partial<Record<string, string>>;
}
export interface GalleryBankData {
  items: MediaItem[];
  locations: string[];
  settings: Partial<Record<string, string>>;
}

/** "20th Aug 2026" — the date format used on the Events page. */
export function formatLongDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const day = d.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${day}${suffix} ${d.toLocaleDateString("en-GB", { month: "short" })} ${d.getFullYear()}`;
}

/** "10:00" → "10am", "14:30" → "2:30pm" */
export function formatClock(t?: string | null) {
  if (!t) return "";
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  let h = Number(m[1]);
  const min = m[2];
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}${min === "00" ? "" : `:${min}`}${ampm}`;
}
