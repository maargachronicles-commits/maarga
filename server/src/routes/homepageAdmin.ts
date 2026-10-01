import express from "express";
import db from "../lib/db";
import { upload, uploadToCloudinary, destroyCloudinaryImage } from "../lib/upload";
import { SETTING_KEYS, isSettingKey, resourceTypeFor, withLinkDefaults } from "./settings";
import { nextDestinationCode, nextItineraryCode } from "../lib/codes";

/**
 * /api/homepage-admin — one consistent API for the homepage editor in admin/.
 *
 * Every homepage collection (intellects, trips, destinations, events,
 * testimonials, gallery) and About-page collection (about-cards, founders) supports:
 *   GET    /:collection              all items incl. drafts & hidden, ordered
 *   POST   /:collection              create   (multipart: fields + optional "image" file)
 *   PUT    /:collection/:id          update   (same body; only sent fields change)
 *   PATCH  /:collection/:id/visibility  { published: boolean }   "Show on homepage"
 *   PUT    /:collection/reorder      { ids: string[] }            new order
 *   DELETE /:collection/:id
 *   PUT    /settings/:key            multipart "image"/"video" file or { value }
 *
 * Body field `mode`:
 *   "draft"    → saved as-is (status DRAFT); incomplete data is fine
 *   "publish"  → every field in `required` must be present or the request is
 *                rejected with 422 + { missing: [...labels] }; status PUBLISHED
 *
 * The public homepage (/api/homepage) only returns status=PUBLISHED AND
 * published=true rows, so drafts never leak to the site.
 */
const router = express.Router();

type Field = { key: string; label: string; type?: "text" | "int" | "date" | "bool" | "json" };

interface CollectionConfig {
  model: any; // prisma delegate
  folder: string;
  /** field that stores the uploaded image URL */
  imageField?: string;
  fields: Field[];
  /** required (key list) when mode=publish */
  required: string[];
  /** extra `where` for the collection */
  where?: Record<string, unknown>;
  /** values applied on create */
  createDefaults?: Record<string, unknown>;
  /** scholar placements: the GET also returns the library `profiles`, and publishing
   *  requires either a chosen profile or a name typed on the page */
  placement?: boolean;
  /** placements whose page comes from `?page=` (itinerary:<id>, event:<id>) */
  dynamicPage?: boolean;
  /** query-string keys the GET may filter on (e.g. folder, destinationId) */
  filters?: string[];
  /** which placeholder / gallery folder uploads of this collection are filed under */
  mediaFolder?: string;
}

const placementCollection = (page: "about" | "experience" | "dynamic"): CollectionConfig => ({
  model: db.intellectPlacement,
  folder: "intellects",
  imageField: "image",
  fields: [
    { key: "intellectId", label: "Profile from the Intellects library" },
    { key: "name", label: "Name" },
    { key: "designation", label: "Designation" },
    { key: "description", label: "Description" },
    { key: "image", label: "Portrait image" },
    { key: "ctaText", label: "Button text" },
    { key: "ctaUrl", label: "Button link" },
  ],
  required: [],
  where: page === "dynamic" ? undefined : { page },
  createDefaults: page === "dynamic" ? undefined : { page },
  placement: true,
  dynamicPage: page === "dynamic",
});

const textCollection = (model: any, folder: string, label: string): CollectionConfig => ({
  model,
  folder,
  fields: [{ key: "text", label }],
  required: ["text"],
});

const COLLECTIONS: Record<string, CollectionConfig> = {
  intellects: {
    model: db.intellect,
    folder: "intellects",
    imageField: "image",
    fields: [
      { key: "name", label: "Name" },
      { key: "designation", label: "Designation" },
      { key: "description", label: "Description" },
      { key: "image", label: "Portrait image" },
      { key: "ctaText", label: "Button text" },
      { key: "ctaUrl", label: "Button link" },
    ],
    required: ["name", "designation", "description", "image"],
  },
  trips: {
    model: db.trip,
    folder: "trips",
    imageField: "image",
    fields: [
      { key: "category", label: "Category line" },
      { key: "heading", label: "Trip title" },
      { key: "subtitle", label: "Subtitle" },
      { key: "dates", label: "Dates" },
      { key: "duration", label: "Duration" },
      { key: "body", label: "Description" },
      { key: "bookNowUrl", label: "Primary button link" },
      { key: "primaryCtaText", label: "Primary button text" },
      { key: "secondaryCtaText", label: "Secondary button text" },
      { key: "secondaryCtaUrl", label: "Secondary button link" },
      { key: "image", label: "Trip image" },
    ],
    required: ["category", "heading", "dates", "duration", "body", "bookNowUrl", "primaryCtaText", "secondaryCtaText", "image"],
  },
  destinations: {
    model: db.destination,
    folder: "destinations",
    imageField: "heroImage",
    fields: [
      { key: "name", label: "Destination name" },
      { key: "region", label: "Region / state" },
      { key: "subtitle", label: "Subtitle" },
      { key: "heroImageAltText", label: "Image alt text" },
      { key: "heroImage", label: "Destination image" },
      { key: "ctaText", label: "Button text" },
      { key: "ctaUrl", label: "Card link" },
      // destination pages (round 8)
      { key: "heroLabel", label: "Hero label" },
      { key: "heroTitle", label: "Hero title" },
      { key: "experienceUrl", label: "Experience tab link" },
      { key: "enquireLabel", label: "Enquire label" },
      { key: "enquireTitle", label: "Enquire title" },
      { key: "enquireText", label: "Enquire text" },
      { key: "enquireCtaText", label: "Enquire button text" },
      { key: "enquireCtaUrl", label: "Enquire button link" },
    ],
    required: ["name", "heroImage"],
  },
  events: {
    model: db.event,
    folder: "events",
    imageField: "image",
    fields: [
      { key: "category", label: "Category line" },
      { key: "title", label: "Event title" },
      { key: "location", label: "Location" },
      { key: "eventDate", label: "Date", type: "date" },
      { key: "duration", label: "Duration" },
      { key: "description", label: "Description" },
      { key: "ctaText", label: "Button text" },
      { key: "ctaUrl", label: "Button link" },
      { key: "imageAltText", label: "Image alt text" },
      { key: "image", label: "Event image" },
      // events page (round 8)
      { key: "subtitle", label: "“Led by …” line" },
      { key: "startTime", label: "Start time" },
      { key: "endTime", label: "End time" },
      { key: "body", label: "Detail page paragraphs" },
      { key: "whoIsThisFor", label: "Who is this for" },
      { key: "postEventText", label: "Post-event text" },
      { key: "feedback", label: "Attendee feedback", type: "json" },
      { key: "bookUrl", label: "Book button link" },
      { key: "bookCtaText", label: "Book button text" },
      { key: "standardTicketPrice", label: "Ticket price", type: "int" },
      { key: "earlyBirdEnabled", label: "Early bird on", type: "bool" },
      { key: "earlyBirdPrice", label: "Early bird price", type: "int" },
      { key: "earlyBirdNote", label: "Early bird note" },
      { key: "format", label: "Format" },
      { key: "meetingLink", label: "Online meeting link" },
    ],
    required: ["title", "eventDate", "startTime", "endTime", "description", "image"],
    where: { visibility: "PUBLIC" },
    createDefaults: { format: "OFFLINE", visibility: "PUBLIC" },
  },
  testimonials: {
    model: db.testimonial,
    folder: "testimonials",
    fields: [
      { key: "quote", label: "Testimonial text" },
      { key: "travellerName", label: "Traveller name" },
      { key: "role", label: "Role / designation" },
      { key: "ctaText", label: "Button text" },
      { key: "ctaUrl", label: "Button link" },
    ],
    required: ["quote", "travellerName"],
  },
  gallery: {
    model: db.galleryImage,
    folder: "gallery",
    imageField: "url",
    fields: [
      { key: "alt", label: "Alt text" },
      { key: "url", label: "Image" },
      { key: "ctaUrl", label: "Image link" },
    ],
    required: ["url"],
  },
  /* ---- About page ---- */
  "about-cards": {
    model: db.aboutCard,
    folder: "about",
    imageField: "image",
    fields: [
      { key: "title", label: "Card heading" },
      { key: "body", label: "Card text" },
      { key: "image", label: "Hover photo" },
    ],
    required: ["title", "body", "image"],
  },
  founders: {
    model: db.founder,
    folder: "founders",
    imageField: "image",
    fields: [
      { key: "name", label: "Name" },
      { key: "designation", label: "Designation" },
      { key: "description", label: "Description" },
      { key: "image", label: "Portrait image" },
    ],
    required: ["name", "designation", "description", "image"],
  },
  /* ---- Scholar placements (per page) ---- */
  "about-intellects": placementCollection("about"),
  "experience-intellects": placementCollection("experience"),
  /* ---- Experience page ---- */
  "experience-sites": {
    model: db.experienceSite,
    folder: "experience",
    imageField: "image",
    fields: [
      { key: "title", label: "Site title" },
      { key: "lensALabel", label: "First lens label" },
      { key: "lensAText", label: "First lens text" },
      { key: "lensBLabel", label: "Second lens label" },
      { key: "lensBText", label: "Second lens text" },
      { key: "image", label: "Sketch image" },
      { key: "figure", label: "Sketched figure" },
      { key: "figureLeft", label: "Figure position (left %)" },
      { key: "figureTop", label: "Figure position (top %)" },
      { key: "ctaText", label: "Hint under the sketch" },
      { key: "ctaUrl", label: "Link the figure opens" },
    ],
    required: ["title", "lensALabel", "lensAText", "lensBLabel", "lensBText", "image"],
  },
  "experience-fragments": textCollection(db.experienceFragment, "experience", "Fragment text"),
  "experience-questions": textCollection(db.experienceQuestion, "experience", "Question"),
  /* ---- Destinations & itineraries (round 8) ---- */
  itineraries: {
    model: db.itinerary,
    folder: "itineraries",
    imageField: "heroImage",
    fields: [
      { key: "destinationId", label: "Destination" },
      { key: "label", label: "Small label" },
      { key: "title", label: "Itinerary title" },
      { key: "durationLabel", label: "Duration (e.g. 6 Days / 7 Nights)" },
      { key: "heroImage", label: "Hero photo" },
      { key: "heroLabel", label: "Hero label" },
      { key: "heroTitle", label: "Hero title" },
      { key: "heroCtaText", label: "Hero button text" },
      { key: "heroCtaUrl", label: "Hero button link" },
      { key: "staysTitle", label: "Stays heading" },
      { key: "intellectsLabel", label: "Intellects label" },
      { key: "intellectsTitle", label: "Intellects heading" },
      { key: "intellectsIntro", label: "Intellects intro" },
      { key: "enquireLabel", label: "Enquire label" },
      { key: "enquireTitle", label: "Enquire heading" },
      { key: "enquireText", label: "Enquire text" },
      { key: "enquireCtaText", label: "Enquire button text" },
      { key: "enquireCtaUrl", label: "Enquire button link" },
      { key: "pdfUrl", label: "Downloadable PDF" },
      { key: "days", label: "Days", type: "json" },
      { key: "stays", label: "Stays", type: "json" },
      { key: "iconOverrides", label: "Icon edits for this itinerary", type: "json" },
    ],
    required: ["destinationId", "title", "durationLabel", "days"],
    filters: ["destinationId"],
  },
  icons: {
    model: db.activityIcon,
    folder: "icons",
    imageField: "url",
    fields: [
      { key: "name", label: "Icon name" },
      { key: "url", label: "Icon image (SVG/PNG)" },
    ],
    required: ["name", "url"],
    mediaFolder: "icons",
  },
  media: {
    model: db.mediaAsset,
    folder: "gallery",
    imageField: "url",
    fields: [
      { key: "alt", label: "Caption / alt text" },
      { key: "url", label: "File" },
      { key: "folder", label: "Folder" },
      { key: "kind", label: "Kind" },
      { key: "inBank", label: "Show in Gallery Bank", type: "bool" },
      { key: "inFolderGallery", label: "Show in the folder's gallery", type: "bool" },
    ],
    required: ["url"],
    filters: ["folder", "inBank", "kind"],
    mediaFolder: "gallery",
  },
  "event-principles": {
    model: db.eventPrinciple,
    folder: "events",
    fields: [
      { key: "title", label: "Title" },
      { key: "body", label: "Text" },
    ],
    required: ["title", "body"],
  },
  "itinerary-intellects": placementCollection("dynamic"),
  "event-intellects": placementCollection("dynamic"),
};

/** Express 5 types params as string | string[]; we always want the first. */
const param = (v: string | string[]) => (Array.isArray(v) ? v[0] : v);

function getConfig(res: express.Response, name: string | string[]): CollectionConfig | null {
  name = param(name);
  const cfg = COLLECTIONS[name];
  if (!cfg) {
    res.status(404).json({ success: false, message: `Unknown collection "${name}"` });
    return null;
  }
  return cfg;
}

function isBlank(v: unknown) {
  return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
}

/** Convert the multipart/JSON body into a prisma `data` object for the known fields. */
function pickFields(cfg: CollectionConfig, body: Record<string, any>, existing?: Record<string, any>) {
  const data: Record<string, unknown> = {};
  for (const f of cfg.fields) {
    if (f.key === cfg.imageField) continue; // handled by upload logic
    if (!(f.key in body)) continue;
    const raw = body[f.key];
    if (f.type === "date") {
      data[f.key] = isBlank(raw) ? null : new Date(raw);
      if (data[f.key] instanceof Date && Number.isNaN((data[f.key] as Date).getTime())) data[f.key] = null;
    } else if (f.type === "int") {
      data[f.key] = isBlank(raw) ? null : Number(raw);
    } else if (f.type === "bool") {
      data[f.key] = String(raw) === "true";
    } else if (f.type === "json") {
      if (isBlank(raw)) data[f.key] = null;
      else {
        try {
          data[f.key] = typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          data[f.key] = null;
        }
      }
    } else {
      data[f.key] = isBlank(raw) ? null : String(raw);
    }
  }
  if ("order" in body && !isBlank(body.order)) data.order = Number(body.order) || 0;
  if ("published" in body) data.published = String(body.published) === "true";
  void existing;
  return data;
}

/** Which required fields are missing from the merged record? */
function missingForPublish(cfg: CollectionConfig, merged: Record<string, unknown>) {
  if (cfg.placement && isBlank(merged.intellectId) && isBlank(merged.name)) return ["a profile from the library (or a name)"];
  return cfg.required
    .filter((k) => isBlank(merged[k]) || (Array.isArray(merged[k]) && (merged[k] as unknown[]).length === 0))
    .map((k) => cfg.fields.find((f) => f.key === k)?.label ?? k);
}

/** `where` for a request: the collection's fixed filter + whitelisted query params. */
function scopeFor(cfg: CollectionConfig, query: Record<string, unknown>) {
  const where: Record<string, unknown> = { ...(cfg.where ?? {}) };
  if (cfg.dynamicPage && typeof query.page === "string" && query.page) where.page = query.page;
  for (const f of cfg.filters ?? []) {
    const v = query[f];
    if (typeof v !== "string" || v === "") continue;
    where[f] = v === "true" ? true : v === "false" ? false : v;
  }
  return where;
}

const isVideo = (mime?: string, url?: string) => !!(mime?.startsWith("video/") || (url && /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url)));
/** image | video | file (PDFs etc. — kept in the library but never shown in public galleries) */
const kindOf = (mime?: string, url?: string) => (isVideo(mime, url) ? "video" : mime && !mime.startsWith("image/") ? "file" : url && /\.(pdf|docx?|zip)(\?|#|$)/i.test(url) ? "file" : "image");

/**
 * Every file uploaded anywhere in the CMS is also filed in the media library
 * (CMS → Gallery) so it can be re-used from the "Choose from gallery" picker.
 * Library rows themselves (collection `media`) are created by the normal flow.
 */
async function registerInLibrary(url: string, folder: string, mime?: string, alt?: string) {
  if (await db.mediaAsset.findFirst({ where: { url } })) return;
  const count = await db.mediaAsset.count({ where: { folder } });
  await db.mediaAsset.create({
    data: { url, alt: alt || null, folder, kind: kindOf(mime, url), inBank: false, inFolderGallery: false, status: "PUBLISHED", published: true, order: count },
  });
}

/** Remove a file only when nothing else (media library) still references it. */
async function destroyIfUnused(url: string | null | undefined) {
  if (!url) return;
  if (await db.mediaAsset.findFirst({ where: { url } })) return;
  await destroyCloudinaryImage(url);
}

/** Uploads of a collection go to a folder the library understands (destination:<id> etc.). */
function libraryFolderFor(name: string, body: Record<string, any>, existing?: Record<string, any>) {
  if (name === "media" && body.folder) return String(body.folder);
  if (name === "icons") return "icons";
  if (name === "itineraries") {
    const d = body.destinationId || existing?.destinationId;
    return d ? `destination:${d}` : "general";
  }
  if (name === "destinations") return existing?.id ? `destination:${existing.id}` : "general";
  if (name === "events") return existing?.id ? `event:${existing.id}` : "events";
  if (name === "event-intellects" || name === "itinerary-intellects" || name === "intellects" || name === "about-intellects" || name === "experience-intellects") return "intellects";
  return "general";
}

/* ---------------- Settings (single assets / copy) ---------------- */

router.put("/settings/:key", upload.single("file"), async (req, res) => {
  try {
    const key = param(req.params.key);
    if (!isSettingKey(key)) {
      return res.status(400).json({ success: false, message: `Unknown setting key. Allowed: ${SETTING_KEYS.join(", ")}` });
    }
    const existing = await db.siteSetting.findUnique({ where: { key } });
    let value: string | undefined = req.body.value;
    if (req.file) {
      value = await uploadToCloudinary(req.file, "settings", resourceTypeFor(key, req.file.mimetype));
      await registerInLibrary(value, "general", req.file.mimetype);
      if (existing && existing.value !== value) await destroyIfUnused(existing.value);
    }
    if (value === undefined) return res.status(400).json({ success: false, message: "value or file is required" });
    if (value === "") {
      if (existing) await db.siteSetting.delete({ where: { key } });
      return res.json({ success: true, data: { key, value: "" } });
    }
    const data = await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update setting" });
  }
});

router.get("/settings", async (_req, res) => {
  try {
    const rows = await db.siteSetting.findMany();
    res.json({ success: true, data: withLinkDefaults(Object.fromEntries(rows.map((r) => [String(r.key), String(r.value)]))) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
});

/* ---------------- Collections ---------------- */

router.get("/:collection", async (req, res) => {
  const cfg = getConfig(res, req.params.collection);
  if (!cfg) return;
  try {
    const where = scopeFor(cfg, req.query as Record<string, unknown>);
    if (cfg.dynamicPage && !where.page) return res.status(400).json({ success: false, message: "?page= is required for this collection" });
    const data = await cfg.model.findMany({ where, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
    const profiles = cfg.placement ? await db.intellect.findMany({ orderBy: { order: "asc" } }) : undefined;
    res.json({ success: true, data, fields: cfg.fields, required: cfg.required, profiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
});

router.put("/:collection/reorder", async (req, res) => {
  const cfg = getConfig(res, req.params.collection);
  if (!cfg) return;
  const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (!ids.length) return res.status(400).json({ success: false, message: "ids[] is required" });
  try {
    await Promise.all(ids.map((id, i) => cfg.model.update({ where: { id }, data: { order: i } })));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to reorder" });
  }
});

router.post("/:collection", upload.single("image"), async (req, res) => {
  const cfg = getConfig(res, req.params.collection);
  if (!cfg) return;
  try {
    const name = param(req.params.collection);
    const mode = req.body.mode === "publish" ? "publish" : "draft";
    const data = pickFields(cfg, req.body);
    const scope = scopeFor(cfg, { ...(req.query as Record<string, unknown>), ...req.body });
    if (cfg.dynamicPage) {
      if (!scope.page) return res.status(400).json({ success: false, message: "page is required" });
      data.page = scope.page;
    }
    if (cfg.imageField) {
      if (req.file) {
        data[cfg.imageField] = await uploadToCloudinary(req.file, cfg.folder, isVideo(req.file.mimetype) ? "video" : "image");
        if (name === "media") data.kind = kindOf(req.file.mimetype);
        else await registerInLibrary(String(data[cfg.imageField]), libraryFolderFor(name, req.body), req.file.mimetype);
      } else if (!isBlank(req.body[cfg.imageField])) data[cfg.imageField] = String(req.body[cfg.imageField]);
    }
    if (mode === "publish") {
      const missing = missingForPublish(cfg, data);
      if (missing.length) return res.status(422).json({ success: false, message: "Fill every required field to publish", missing });
    }
    if (data.order === undefined) {
      const count = await cfg.model.count({ where: scope });
      data.order = count;
    }
    /* public codes */
    if (name === "destinations") data.code = await nextDestinationCode(db.destination, String(data.name || "New"));
    if (name === "itineraries") {
      if (isBlank(data.destinationId)) return res.status(400).json({ success: false, message: "destinationId is required" });
      const dest = await db.destination.findUnique({ where: { id: String(data.destinationId) } });
      if (!dest) return res.status(404).json({ success: false, message: "Destination not found" });
      if (!dest.code) await db.destination.update({ where: { id: dest.id }, data: { code: await nextDestinationCode(db.destination, dest.name) } });
      data.code = await nextItineraryCode(db.itinerary, dest.code || (await db.destination.findUnique({ where: { id: dest.id } }))?.code);
      if (data.days === undefined || data.days === null) data.days = [];
      if (data.stays === undefined || data.stays === null) data.stays = [];
    }
    const created = await cfg.model.create({
      data: { ...(cfg.createDefaults ?? {}), ...data, status: mode === "publish" ? "PUBLISHED" : "DRAFT", published: data.published ?? true },
    });
    if (name === "itineraries") await syncItineraryCount(String(created.destinationId));
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create" });
  }
});

router.put("/:collection/:id", upload.single("image"), async (req, res) => {
  const cfg = getConfig(res, req.params.collection);
  if (!cfg) return;
  try {
    const id = param(req.params.id);
    const existing = await cfg.model.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    const mode = req.body.mode === "publish" ? "publish" : req.body.mode === "draft" ? "draft" : null;
    const name = param(req.params.collection);
    const data = pickFields(cfg, req.body, existing);
    if (cfg.imageField) {
      if (req.file) {
        data[cfg.imageField] = await uploadToCloudinary(req.file, cfg.folder, isVideo(req.file.mimetype) ? "video" : "image");
        if (name === "media") data.kind = kindOf(req.file.mimetype);
        else await registerInLibrary(String(data[cfg.imageField]), libraryFolderFor(name, req.body, existing), req.file.mimetype);
        if (existing[cfg.imageField] !== data[cfg.imageField]) await destroyIfUnused(existing[cfg.imageField]);
      } else if (cfg.imageField in req.body) {
        data[cfg.imageField] = isBlank(req.body[cfg.imageField]) ? null : String(req.body[cfg.imageField]);
      }
    }
    if (name === "media" && typeof data.url === "string" && !req.file) data.kind = data.kind ?? kindOf(undefined, data.url);
    // codes never change from the editor
    delete data.code;
    const merged = { ...existing, ...data };
    if (mode === "publish") {
      const missing = missingForPublish(cfg, merged);
      if (missing.length) return res.status(422).json({ success: false, message: "Fill every required field to publish", missing });
      data.status = "PUBLISHED";
    } else if (mode === "draft") {
      data.status = "DRAFT";
    }
    const updated = await cfg.model.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
});

router.patch("/:collection/:id/visibility", async (req, res) => {
  const cfg = getConfig(res, req.params.collection);
  if (!cfg) return;
  try {
    const published = req.body?.published === true || req.body?.published === "true";
    const updated = await cfg.model.update({ where: { id: param(req.params.id) }, data: { published } });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update visibility" });
  }
});

router.delete("/:collection/:id", async (req, res) => {
  const cfg = getConfig(res, req.params.collection);
  if (!cfg) return;
  try {
    const id = param(req.params.id);
    const existing = await cfg.model.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    const name = param(req.params.collection);
    await cfg.model.delete({ where: { id } });
    if (name === "media") await destroyCloudinaryImage(existing.url);
    else if (cfg.imageField) await destroyIfUnused(existing[cfg.imageField]);
    if (name === "itineraries") {
      await db.intellectPlacement.deleteMany({ where: { page: `itinerary:${id}` } });
      await syncItineraryCount(String(existing.destinationId));
    }
    if (name === "events") await db.intellectPlacement.deleteMany({ where: { page: `event:${id}` } });
    if (name === "destinations") {
      const its = await db.itinerary.findMany({ where: { destinationId: id } });
      for (const it of its) {
        await db.intellectPlacement.deleteMany({ where: { page: `itinerary:${it.id}` } });
        await db.itinerary.delete({ where: { id: it.id } });
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
});

/** Keep Destination.itineraries (shown in the CMS list) in step. */
async function syncItineraryCount(destinationId: string) {
  if (!destinationId) return;
  const n = await db.itinerary.count({ where: { destinationId } });
  await db.destination.update({ where: { id: destinationId }, data: { itineraries: n } }).catch(() => {});
}

/* POST /itineraries/:id/duplicate — copy an itinerary (new code, draft, "(copy)" in the title) incl. its scholars */
router.post("/itineraries/:id/duplicate", async (req, res) => {
  try {
    const id = param(req.params.id);
    const src = await db.itinerary.findUnique({ where: { id } });
    if (!src) return res.status(404).json({ success: false, message: "Not found" });
    const dest = await db.destination.findUnique({ where: { id: String(src.destinationId) } });
    const { id: _id, code: _code, createdAt: _c, updatedAt: _u, ...rest } = src;
    void _id; void _code; void _c; void _u;
    const count = await db.itinerary.count({ where: { destinationId: src.destinationId } });
    const created = await db.itinerary.create({
      data: { ...rest, title: `${src.title || "Itinerary"} (copy)`, code: await nextItineraryCode(db.itinerary, dest?.code), status: "DRAFT", order: count },
    });
    const placements = await db.intellectPlacement.findMany({ where: { page: `itinerary:${id}` }, orderBy: { order: "asc" } });
    for (const p of placements) {
      const { id: _pid, createdAt: _pc, updatedAt: _pu, ...pl } = p;
      void _pid; void _pc; void _pu;
      await db.intellectPlacement.create({ data: { ...pl, page: `itinerary:${created.id}` } });
    }
    await syncItineraryCount(String(src.destinationId));
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to duplicate" });
  }
});

/* GET /media/summary — folders with counts (for the Gallery page in the CMS) */
router.get("/media/summary", async (_req, res) => {
  try {
    const [assets, destinations, events] = await Promise.all([db.mediaAsset.findMany(), db.destination.findMany(), db.event.findMany()]);
    const byFolder = new Map<string, { total: number; inBank: number; inFolderGallery: number }>();
    for (const a of assets) {
      const f = String(a.folder || "general");
      const s = byFolder.get(f) ?? { total: 0, inBank: 0, inFolderGallery: 0 };
      s.total++;
      if (a.inBank) s.inBank++;
      if (a.inFolderGallery) s.inFolderGallery++;
      byFolder.set(f, s);
    }
    const folders = [
      { key: "general", label: "General", kind: "general", ...(byFolder.get("general") ?? { total: 0, inBank: 0, inFolderGallery: 0 }) },
      ...destinations.map((d) => ({ key: `destination:${d.id}`, label: `${d.name}${d.code ? ` · ${d.code}` : ""}`, kind: "destination", ...(byFolder.get(`destination:${d.id}`) ?? { total: 0, inBank: 0, inFolderGallery: 0 }) })),
      ...events.map((e) => ({ key: `event:${e.id}`, label: `Event · ${e.title || "untitled"}`, kind: "event", ...(byFolder.get(`event:${e.id}`) ?? { total: 0, inBank: 0, inFolderGallery: 0 }) })),
    ];
    const known = new Set(folders.map((f) => f.key));
    for (const [k, v] of byFolder) if (!known.has(k)) folders.push({ key: k, label: k, kind: "custom", ...v });
    res.json({ success: true, data: { folders, totals: { total: assets.length, inBank: assets.filter((a) => a.inBank).length } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to summarise media" });
  }
});

export default router;
