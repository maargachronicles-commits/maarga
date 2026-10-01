import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import cloudinary, { cloudinaryConfigured } from "./cloudinary";

/** Memory-storage multer instance shared by all upload routes (60 MB cap — hero video). */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
});

/** Where local uploads live (server/uploads, served at /uploads) and the public URL they get. */
export const UPLOAD_DIR = process.env.VERCEL ? "/tmp/maarga/uploads" : path.resolve(__dirname, "../../uploads");
export const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");

export const storageMode = cloudinaryConfigured ? "cloudinary" : "local";

/**
 * Store an uploaded file and resolve with its public URL.
 * Cloudinary when CLOUDINARY_* is configured, otherwise server/uploads/<folder>/.
 */
export function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<string> {
  if (!cloudinaryConfigured) return saveLocal(file, folder);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `maarga/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

async function saveLocal(file: Express.Multer.File, folder: string) {
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, "") || "misc";
  const ext = (path.extname(file.originalname || "").toLowerCase() || guessExt(file.mimetype)).slice(0, 8);
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const dir = path.join(UPLOAD_DIR, safeFolder);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, name), file.buffer);
  return `${PUBLIC_URL}/uploads/${safeFolder}/${name}`;
}

function guessExt(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg",
    "video/mp4": ".mp4", "video/webm": ".webm",
  };
  return map[mime] || "";
}

/** Extract the Cloudinary public id from a delivery URL (null for non-Cloudinary URLs). */
export function getCloudinaryPublicId(imageUrl: string): string | null {
  if (!imageUrl.includes("res.cloudinary.com")) return null;
  const uploadIndex = imageUrl.indexOf("/upload/");
  if (uploadIndex === -1) return null;
  const parts = imageUrl.substring(uploadIndex + "/upload/".length).split("/");
  if (parts[0].includes(",")) parts.shift();
  if (/^v\d+$/.test(parts[0])) parts.shift();
  return parts.join("/").replace(/\.[^/.]+$/, "");
}

/** Remove a previously uploaded asset (Cloudinary or local). Never throws. */
export async function destroyCloudinaryImage(imageUrl: string | null | undefined) {
  if (!imageUrl) return;
  const local = imageUrl.indexOf("/uploads/");
  if (local !== -1 && imageUrl.startsWith(PUBLIC_URL)) {
    const rel = imageUrl.slice(local + "/uploads/".length);
    if (rel && !rel.includes("..")) {
      await fs.promises.unlink(path.join(UPLOAD_DIR, rel)).catch(() => {});
    }
    return;
  }
  const publicId = getCloudinaryPublicId(imageUrl);
  if (!publicId || !cloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: /\.(mp4|webm|mov)$/i.test(imageUrl) ? "video" : "image" });
  } catch (err) {
    console.error("Cloudinary destroy failed", err);
  }
}
