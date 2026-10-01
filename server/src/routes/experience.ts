import express from "express";
import db from "../lib/db";
import { withLinkDefaults } from "./settings";
import { renderable, resolvePlacements } from "../lib/placements";

/**
 * GET /api/experience — aggregate for the public Experience page:
 *   sites       — "Two Lenses, One Place" (sketch + engineering / cosmology copy + figure)
 *   fragments   — red "Fragments" carousel slides
 *   questions   — "Questions Hampi Still Asks"
 *   intellects  — scholar placements for this page, resolved against the library
 *   settings    — every heading / paragraph (exp*), hero image, buttons, shared nav/enquire links
 * Only status=PUBLISHED AND published=true rows.
 */
const router = express.Router();
const live = { published: true, status: "PUBLISHED" };

router.get("/", async (_req, res) => {
  try {
    const [sites, fragments, questions, placements, profiles, settingRows] = await Promise.all([
      db.experienceSite.findMany({ where: live, orderBy: { order: "asc" } }),
      db.experienceFragment.findMany({ where: live, orderBy: { order: "asc" } }),
      db.experienceQuestion.findMany({ where: live, orderBy: { order: "asc" } }),
      db.intellectPlacement.findMany({ where: { ...live, page: "experience" }, orderBy: { order: "asc" } }),
      db.intellect.findMany({ orderBy: { order: "asc" } }),
      db.siteSetting.findMany(),
    ]);
    res.json({
      success: true,
      data: {
        sites,
        fragments,
        questions,
        intellects: renderable(resolvePlacements(placements, profiles)),
        settings: withLinkDefaults(Object.fromEntries(settingRows.map((r) => [String(r.key), String(r.value)]))),
      },
    });
  } catch (error) {
    console.error("========== EXPERIENCE FETCH ERROR ==========");
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch experience page data" });
  }
});

export default router;
