import express from "express";
import db from "../lib/db";
import { withLinkDefaults } from "./settings";

/**
 * GET /api/homepage
 * Single aggregate request for the public homepage.
 * Only status=PUBLISHED rows with the "Show on homepage" toggle (published=true), ordered.
 */
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const [intellects, trips, destinations, events, testimonials, gallery, settingRows] =
      await Promise.all([
        db.intellect.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { order: "asc" } }),
        db.trip.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { order: "asc" } }),
        db.destination.findMany({
          where: { published: true, status: "PUBLISHED" },
          orderBy: { order: "asc" },
          select: { id: true, name: true, subtitle: true, region: true, heroImage: true, heroImageAltText: true, ctaText: true, ctaUrl: true },
        }),
        db.event.findMany({
          where: { published: true, status: "PUBLISHED", visibility: "PUBLIC" },
          orderBy: [{ order: "asc" }, { eventDate: "asc" }],
          select: {
            id: true, title: true, description: true, category: true, eventDate: true,
            startTime: true, endTime: true, duration: true, location: true, image: true,
            imageAltText: true, meetingLink: true, format: true, ctaText: true, ctaUrl: true, order: true,
          },
        }),
        db.testimonial.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { order: "asc" } }),
        db.galleryImage.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { order: "asc" } }),
        db.siteSetting.findMany(),
      ]);

    res.json({
      success: true,
      data: {
        intellects,
        trips,
        destinations,
        events,
        testimonials,
        gallery,
        settings: withLinkDefaults(Object.fromEntries(settingRows.map((r) => [String(r.key), String(r.value)]))),
      },
    });
  } catch (error) {
    console.error("========== HOMEPAGE FETCH ERROR ==========");
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch homepage data" });
  }
});

export default router;
