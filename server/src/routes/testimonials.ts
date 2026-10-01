import express from "express";
import db from "../lib/db";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const data = await db.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch testimonials" });
  }
});

router.get("/admin", async (_req, res) => {
  const data = await db.testimonial.findMany({ orderBy: { order: "asc" } });
  res.json({ success: true, data });
});

router.get("/:id", async (req, res) => {
  const item = await db.testimonial.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: item });
});

router.post("/", async (req, res) => {
  try {
    const { quote, travellerName, role, order, published } = req.body;
    if (!quote || !travellerName) {
      return res.status(400).json({ success: false, message: "quote and travellerName are required" });
    }
    const data = await db.testimonial.create({
      data: {
        quote,
        travellerName,
        role: role ?? null,
        order: order !== undefined ? Number(order) : 0,
        published: published === undefined ? true : Boolean(published),
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create testimonial" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await db.testimonial.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    const { quote, travellerName, role, order, published } = req.body;
    const data = await db.testimonial.update({
      where: { id: req.params.id },
      data: {
        quote: quote ?? existing.quote,
        travellerName: travellerName ?? existing.travellerName,
        role: role === undefined ? existing.role : role,
        order: order !== undefined ? Number(order) : existing.order,
        published: published !== undefined ? Boolean(published) : existing.published,
      },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update testimonial" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete testimonial" });
  }
});

export default router;
