import express from "express";
import db from "../lib/db";
import { upload, uploadToCloudinary, destroyCloudinaryImage } from "../lib/upload";
import { ABOUT_GALLERY_KEYS, DEFAULT_LINK_SETTINGS, EXPERIENCE_MEDIA_KEYS, EXPERIENCE_TEXT_DEFAULTS, defaultAboutGallery, defaultExperienceMedia } from "../lib/seedData";
import { SITE_MEDIA_KEYS, SITE_TEXT_DEFAULTS, defaultSiteMedia } from "../lib/seedSite";

/**
 * Single-asset / single-copy settings used by the homepage:
 *   festivalImage  — Festivals section image
 *   ctaImage       — "Begin Your Maarga" / footer background image
 *   heroVideo      — hero background video URL (optional; falls back to /hero.mp4)
 *   tripsIntro     — paragraph under "What Trips Are We Organising Now"
 *   eventsIntro    — paragraph under "Knowledge Sessions"
 *
 * Section buttons & links (text + URL pairs, editable in the CMS "Buttons & links" tab):
 *   navContactText/Url, sketchCtaText/Url, whyMaargaCtaText/Url,
 *   intellectsCtaText/Url, enquireCtaText/Url, aboutWhyCtaText/Url
 *
 * About page photo composition ("Not Archival. Alive."): aboutGallery* — see seedData.ABOUT_GALLERY_KEYS.
 * festivalImage may hold a video URL (mp4/webm) — the site renders <video> for it.
 */
export const MEDIA_SETTING_KEYS = ["festivalImage", "ctaImage", "heroVideo", "tripsIntro", "eventsIntro", ...ABOUT_GALLERY_KEYS, ...EXPERIENCE_MEDIA_KEYS, ...SITE_MEDIA_KEYS] as const;
export const LINK_SETTING_KEYS = [...Object.keys(DEFAULT_LINK_SETTINGS), ...Object.keys(EXPERIENCE_TEXT_DEFAULTS), ...Object.keys(SITE_TEXT_DEFAULTS)];
export const SETTING_KEYS: readonly string[] = [...MEDIA_SETTING_KEYS, ...LINK_SETTING_KEYS];

export const isSettingKey = (k: string) => SETTING_KEYS.includes(k);

/** Fill in the default button texts/links for keys the client has not customised. */
export function withLinkDefaults(settings: Record<string, string>) {
  return { ...DEFAULT_LINK_SETTINGS, ...EXPERIENCE_TEXT_DEFAULTS, ...SITE_TEXT_DEFAULTS, ...defaultAboutGallery(), ...defaultExperienceMedia(), ...defaultSiteMedia(), ...settings };
}

/** Uploads: videos go to Cloudinary as `video`; the hero video always does. */
export function resourceTypeFor(key: string, mimetype?: string): "image" | "video" {
  if (key === "heroVideo") return "video";
  return mimetype?.startsWith("video/") ? "video" : "image";
}

const router = express.Router();
const param = (v: string | string[]) => (Array.isArray(v) ? v[0] : v);

router.get("/", async (_req, res) => {
  try {
    const rows = await db.siteSetting.findMany();
    res.json({ success: true, data: withLinkDefaults(Object.fromEntries(rows.map((r) => [String(r.key), String(r.value)]))) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
});

router.get("/:key", async (req, res) => {
  const key = param(req.params.key);
  const row = await db.siteSetting.findUnique({ where: { key } });
  if (!row) {
    if (key in DEFAULT_LINK_SETTINGS) return res.json({ success: true, data: { key, value: DEFAULT_LINK_SETTINGS[key] } });
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.json({ success: true, data: row });
});

/* PUT /:key — multipart "image" file, or JSON { value } */
router.put("/:key", upload.single("image"), async (req, res) => {
  try {
    const key = param(req.params.key);
    if (!isSettingKey(key)) {
      return res.status(400).json({ success: false, message: `Unknown setting key. Allowed: ${SETTING_KEYS.join(", ")}` });
    }
    const existing = await db.siteSetting.findUnique({ where: { key } });
    let value: string | undefined = req.body.value;
    if (req.file) {
      value = await uploadToCloudinary(req.file, "settings", resourceTypeFor(key, req.file.mimetype));
      if (existing) await destroyCloudinaryImage(existing.value);
    }
    if (!value) return res.status(400).json({ success: false, message: "value or image file is required" });
    const data = await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update setting" });
  }
});

export default router;
