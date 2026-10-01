import express from "express";
import db from "../lib/db";
import { upload, uploadToCloudinary, destroyCloudinaryImage } from "../lib/upload";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const data = await db.galleryImage.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch gallery" });
  }
});

router.get("/admin", async (_req, res) => {
  const data = await db.galleryImage.findMany({ orderBy: { order: "asc" } });
  res.json({ success: true, data });
});

/* POST / — one image (multipart "image") or { url, alt } */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let url: string | undefined = req.body.url;
    if (req.file) url = await uploadToCloudinary(req.file, "gallery");
    if (!url) return res.status(400).json({ success: false, message: "image file or url is required" });
    const { alt, order, published } = req.body;
    const data = await db.galleryImage.create({
      data: {
        url,
        alt: alt ?? null,
        order: order !== undefined ? Number(order) : 0,
        published: published === undefined ? true : String(published) === "true",
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add gallery image" });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const existing = await db.galleryImage.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    let url = existing.url;
    if (req.file) {
      url = await uploadToCloudinary(req.file, "gallery");
      await destroyCloudinaryImage(existing.url);
    } else if (req.body.url) url = req.body.url;
    const { alt, order, published } = req.body;
    const data = await db.galleryImage.update({
      where: { id: req.params.id },
      data: {
        url,
        alt: alt === undefined ? existing.alt : alt,
        order: order !== undefined ? Number(order) : existing.order,
        published: published !== undefined ? String(published) === "true" : existing.published,
      },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update gallery image" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await db.galleryImage.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    await destroyCloudinaryImage(existing.url);
    await db.galleryImage.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete gallery image" });
  }
});

export default router;
