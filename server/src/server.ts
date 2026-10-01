import "dotenv/config";
import path from "node:path";
import express from "express";
import cors from "cors";
import tripsRouter from "./routes/trips";
import eventsRouter from "./routes/events";
import destinationsRouter from "./routes/destinations";
import intellectsRouter from "./routes/intellects";
import testimonialsRouter from "./routes/testimonials";
import galleryRouter from "./routes/gallery";
import settingsRouter from "./routes/settings";
import homepageRouter from "./routes/homepage";
import homepageAdminRouter from "./routes/homepageAdmin";
import aboutRouter from "./routes/about";
import experienceRouter from "./routes/experience";
import siteRouter from "./routes/site";
import { getDb } from "./lib/db";
import { UPLOAD_DIR, storageMode } from "./lib/upload";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

/* Uploaded files when Cloudinary is not configured (server/uploads) */
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d", fallthrough: true }));
/* Placeholder photos used by the seed content */
app.use("/static", express.static(path.resolve(__dirname, "../public"), { maxAge: "7d" }));

app.use("/api/trips", tripsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/destinations", destinationsRouter);
app.use("/api/intellects", intellectsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/homepage", homepageRouter);
app.use("/api/homepage-admin", homepageAdminRouter);
app.use("/api/about", aboutRouter);
app.use("/api/experience", experienceRouter);
app.use("/api/site", siteRouter);

app.get("/api/health", async (_req, res) => {
  try {
    const db = await getDb();
    res.json({ success: true, message: "Maarga API is running", store: db.mode, storeDetail: db.detail, uploads: storageMode });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

const PORT = Number(process.env.PORT) || 5000;

/* Resolve the data backend once at boot so the console shows which one is in use. */
getDb()
  .then((db) => {
    app.listen(PORT, () => {
      console.log(`Maarga API running on http://localhost:${PORT}`);
      console.log(`  data:    ${db.detail}`);
      console.log(`  uploads: ${storageMode === "cloudinary" ? "Cloudinary" : `local (${UPLOAD_DIR}, served at /uploads)`}`);
    });
  })
  .catch((e) => {
    console.error("[maarga] Could not initialise the data store:", e);
    process.exit(1);
  });
