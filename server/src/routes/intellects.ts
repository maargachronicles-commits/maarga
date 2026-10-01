import express from "express";
import db from "../lib/db";
import { upload, uploadToCloudinary, destroyCloudinaryImage } from "../lib/upload";

const router = express.Router();

/* GET / — published, ordered (public) */
router.get("/", async (_req, res) => {
  try {
    const data = await db.intellect.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch intellects" });
  }
});

/* GET /admin — everything */
router.get("/admin", async (_req, res) => {
  try {
    const data = await db.intellect.findMany({ orderBy: { order: "asc" } });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch intellects" });
  }
});

router.get("/:id", async (req, res) => {
  const item = await db.intellect.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: item });
});

/* POST / — multipart: image file OR image url */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, designation, description, order, published, image } = req.body;
    if (!name || !designation || !description) {
      return res.status(400).json({ success: false, message: "name, designation and description are required" });
    }
    let imageUrl: string | undefined = image;
    if (req.file) imageUrl = await uploadToCloudinary(req.file, "intellects");
    if (!imageUrl) return res.status(400).json({ success: false, message: "image is required" });

    const data = await db.intellect.create({
      data: {
        name,
        designation,
        description,
        image: imageUrl,
        order: order !== undefined ? Number(order) : 0,
        published: published === undefined ? true : String(published) === "true",
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create intellect" });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const existing = await db.intellect.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });

    let imageUrl = existing.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file, "intellects");
      await destroyCloudinaryImage(existing.image);
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const { name, designation, description, order, published } = req.body;
    const data = await db.intellect.update({
      where: { id: req.params.id },
      data: {
        name: name ?? existing.name,
        designation: designation ?? existing.designation,
        description: description ?? existing.description,
        image: imageUrl,
        order: order !== undefined ? Number(order) : existing.order,
        published: published !== undefined ? String(published) === "true" : existing.published,
      },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update intellect" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await db.intellect.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    await destroyCloudinaryImage(existing.image);
    await db.intellect.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete intellect" });
  }
});

export default router;
