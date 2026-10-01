import express from "express";
import db from "../lib/db";
import { withLinkDefaults } from "./settings";
import { renderable, resolvePlacements } from "../lib/placements";

/**
 * GET /api/about
 * Single aggregate request for the public About page:
 *   cards      — "A New Paradigm of Living Wisdom" manifesto cards (hover photo each)
 *   founders   — "The Founders"
 *   intellects — this page's scholar placements (CMS → About page → Intellects), resolved against the library
 *   settings   — aboutGallery* photo slots, aboutWhyCta*, navContact*, enquireCta*, ctaImage
 * Only status=PUBLISHED AND published=true rows.
 */
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const [cards, founders, placements, profiles, settingRows] = await Promise.all([
      db.aboutCard.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { order: "asc" } }),
      db.founder.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { order: "asc" } }),
      db.intellectPlacement.findMany({ where: { published: true, status: "PUBLISHED", page: "about" }, orderBy: { order: "asc" } }),
      db.intellect.findMany({ orderBy: { order: "asc" } }),
      db.siteSetting.findMany(),
    ]);
    const intellects = renderable(resolvePlacements(placements, profiles));
    res.json({
      success: true,
      data: {
        cards,
        founders,
        intellects,
        settings: withLinkDefaults(Object.fromEntries(settingRows.map((r) => [String(r.key), String(r.value)]))),
      },
    });
  } catch (error) {
    console.error("========== ABOUT FETCH ERROR ==========");
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch about page data" });
  }
});

export default router;
