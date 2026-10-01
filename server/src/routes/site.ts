import express from "express";
import db from "../lib/db";
import { withLinkDefaults } from "./settings";
import { renderable, resolvePlacements } from "../lib/placements";

/**
 * /api/site — public aggregates for the pages added in round 8. Only
 * status=PUBLISHED AND published=true rows are returned.
 *
 *   GET /destinations                          — index (published destinations + published itinerary counts)
 *   GET /destinations/:code                    — one destination + its published itineraries + gallery + settings
 *   GET /destinations/:code/itinerary/:itin    — the itinerary page (days, stays, icons, scholars) + the siblings for the dropdown
 *   GET /events                                — events overview (upcoming / past split on the server) + principles + settings
 *   GET /events/:id                            — one event (detail page) + scholars + gallery
 *   GET /gallery                               — Gallery Bank (inBank media) + location filters
 */
const router = express.Router();
const live = { published: true, status: "PUBLISHED" };
const param = (v: string | string[]) => (Array.isArray(v) ? v[0] : v);

async function settings() {
  const rows = await db.siteSetting.findMany();
  return withLinkDefaults(Object.fromEntries(rows.map((r) => [String(r.key), String(r.value)])));
}

async function scholars(page: string) {
  const [placements, profiles] = await Promise.all([
    db.intellectPlacement.findMany({ where: { ...live, page }, orderBy: { order: "asc" } }),
    db.intellect.findMany({ orderBy: { order: "asc" } }),
  ]);
  return renderable(resolvePlacements(placements, profiles));
}

const visual = (rows: Record<string, any>[]) => rows.filter((a) => a.kind === "image" || a.kind === "video");
const folderGallery = async (folder: string) => visual(await db.mediaAsset.findMany({ where: { ...live, folder, inFolderGallery: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }));

/** Apply an itinerary's own icon edits on top of the library. */
function iconsFor(itinerary: Record<string, any>, library: Record<string, any>[]) {
  const overrides = (itinerary.iconOverrides ?? {}) as Record<string, { name?: string; url?: string }>;
  const out: Record<string, { id: string; name: string; url: string }> = {};
  for (const ic of library) {
    const o = overrides[String(ic.id)] ?? {};
    out[String(ic.id)] = { id: String(ic.id), name: String(o.name || ic.name || ""), url: String(o.url || ic.url || "") };
  }
  // an override may exist for an icon that was deleted from the library — keep it renderable
  for (const [id, o] of Object.entries(overrides)) if (!out[id] && o.url) out[id] = { id, name: o.name || "", url: o.url };
  return out;
}

const pickDestination = (d: Record<string, any>) => ({
  id: d.id,
  code: d.code,
  name: d.name,
  region: d.region,
  subtitle: d.subtitle,
  heroImage: d.heroImage,
  heroLabel: d.heroLabel,
  heroTitle: d.heroTitle,
  experienceUrl: d.experienceUrl,
  enquireLabel: d.enquireLabel,
  enquireTitle: d.enquireTitle,
  enquireText: d.enquireText,
  enquireCtaText: d.enquireCtaText,
  enquireCtaUrl: d.enquireCtaUrl,
});

const pickItinerarySummary = (it: Record<string, any>) => ({ id: it.id, code: it.code, title: it.title, durationLabel: it.durationLabel, label: it.label, days: Array.isArray(it.days) ? it.days.length : 0 });

router.get("/destinations", async (_req, res) => {
  try {
    const [dests, itins, s] = await Promise.all([
      db.destination.findMany({ where: live, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
      db.itinerary.findMany({ where: live }),
      settings(),
    ]);
    res.json({
      success: true,
      data: {
        destinations: dests.map((d) => ({ ...pickDestination(d), itineraries: itins.filter((i) => i.destinationId === d.id).map(pickItinerarySummary) })),
        settings: s,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to load destinations" });
  }
});

async function findDestination(code: string) {
  return (await db.destination.findFirst({ where: { ...live, code } })) ?? (await db.destination.findFirst({ where: { ...live, id: code } }));
}

router.get("/destinations/:code", async (req, res) => {
  try {
    const d = await findDestination(param(req.params.code));
    if (!d) return res.status(404).json({ success: false, message: "Destination not found" });
    const [itins, gallery, s] = await Promise.all([
      db.itinerary.findMany({ where: { ...live, destinationId: d.id }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
      folderGallery(`destination:${d.id}`),
      settings(),
    ]);
    res.json({ success: true, data: { destination: pickDestination(d), itineraries: itins.map(pickItinerarySummary), gallery, settings: s } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to load destination" });
  }
});

router.get("/destinations/:code/itinerary/:itin", async (req, res) => {
  try {
    const d = await findDestination(param(req.params.code));
    if (!d) return res.status(404).json({ success: false, message: "Destination not found" });
    const itins = await db.itinerary.findMany({ where: { ...live, destinationId: d.id }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
    const wanted = param(req.params.itin);
    const it = wanted === "_first" ? itins[0] : itins.find((x) => x.code === wanted || x.id === wanted);
    if (!it) return res.status(404).json({ success: false, message: "Itinerary not found" });
    const [library, people, s] = await Promise.all([db.activityIcon.findMany({ orderBy: { order: "asc" } }), scholars(`itinerary:${it.id}`), settings()]);
    res.json({
      success: true,
      data: {
        destination: pickDestination(d),
        itinerary: { ...it, days: it.days ?? [], stays: it.stays ?? [] },
        icons: iconsFor(it, library),
        siblings: itins.map(pickItinerarySummary),
        intellects: people,
        settings: s,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to load itinerary" });
  }
});

/* ---------------- Events ---------------- */

const pickEvent = (e: Record<string, any>) => ({
  id: e.id,
  title: e.title,
  subtitle: e.subtitle,
  description: e.description,
  category: e.category,
  eventDate: e.eventDate,
  startTime: e.startTime,
  endTime: e.endTime,
  location: e.location,
  format: e.format,
  meetingLink: e.meetingLink,
  image: e.image,
  imageAltText: e.imageAltText,
  ctaText: e.ctaText,
  ctaUrl: e.ctaUrl,
  body: e.body,
  whoIsThisFor: e.whoIsThisFor,
  postEventText: e.postEventText,
  feedback: Array.isArray(e.feedback) ? e.feedback : [],
  bookUrl: e.bookUrl,
  bookCtaText: e.bookCtaText,
  standardTicketPrice: e.standardTicketPrice,
  earlyBirdEnabled: e.earlyBirdEnabled,
  earlyBirdPrice: e.earlyBirdPrice,
  earlyBirdNote: e.earlyBirdNote,
  earlyBirdDeadline: e.earlyBirdDeadline,
});

const isPast = (e: Record<string, any>) => {
  if (!e.eventDate) return false;
  const end = new Date(e.eventDate);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
};

router.get("/events", async (_req, res) => {
  try {
    const [events, principles, s] = await Promise.all([
      db.event.findMany({ where: { ...live, visibility: "PUBLIC" } }),
      db.eventPrinciple.findMany({ where: live, orderBy: { order: "asc" } }),
      settings(),
    ]);
    const byDate = (a: Record<string, any>, b: Record<string, any>) => new Date(a.eventDate || 0).getTime() - new Date(b.eventDate || 0).getTime();
    const upcoming = events.filter((e) => !isPast(e)).sort(byDate).map(pickEvent);
    const past = events.filter(isPast).sort((a, b) => byDate(b, a)).map(pickEvent);
    res.json({ success: true, data: { upcoming, past, principles, settings: s } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to load events" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const id = param(req.params.id);
    const e = await db.event.findFirst({ where: { ...live, id } });
    if (!e) return res.status(404).json({ success: false, message: "Event not found" });
    const [people, gallery, s] = await Promise.all([scholars(`event:${e.id}`), folderGallery(`event:${e.id}`), settings()]);
    res.json({ success: true, data: { event: { ...pickEvent(e), isPast: isPast(e) }, intellects: people, gallery, settings: s } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to load event" });
  }
});

/* ---------------- Gallery Bank ---------------- */

router.get("/gallery", async (_req, res) => {
  try {
    const [assets, dests, s] = await Promise.all([
      db.mediaAsset.findMany({ where: { ...live, inBank: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
      db.destination.findMany({ orderBy: { order: "asc" } }),
      settings(),
    ]);
    const names = new Map(dests.map((d) => [`destination:${d.id}`, String(d.name)]));
    const items = visual(assets).map((a) => ({ id: a.id, url: a.url, alt: a.alt, kind: a.kind, folder: a.folder, location: names.get(String(a.folder)) ?? null }));
    const locations = Array.from(new Set(items.map((i) => i.location).filter(Boolean) as string[]));
    res.json({ success: true, data: { items, locations, settings: s } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to load gallery" });
  }
});

export default router;
