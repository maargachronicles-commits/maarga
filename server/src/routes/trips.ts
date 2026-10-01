import express from "express";
import multer from "multer";
import prisma from "../lib/prisma";
import cloudinary from "../lib/cloudinary";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/* =========================================================
   HELPER
   Extract Cloudinary public ID from a Cloudinary URL
========================================================= */

function getCloudinaryPublicId(imageUrl: string) {
  if (!imageUrl.includes("res.cloudinary.com")) {
    return null;
  }

  try {
    const uploadIndex = imageUrl.indexOf("/upload/");

    if (uploadIndex === -1) {
      return null;
    }

    let path = imageUrl.substring(uploadIndex + "/upload/".length);

    // Remove transformations such as:
    // f_auto,q_auto/
    const parts = path.split("/");

    if (parts[0].includes(",")) {
      parts.shift();
    }

    path = parts.join("/");

    // Remove file extension
    path = path.replace(/\.[^/.]+$/, "");

    return path;
  } catch {
    return null;
  }
}

/* =========================================================
   GET ALL PUBLISHED TRIPS
========================================================= */

router.get("/", async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        published: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    res.json({
      success: true,
      data: trips,
    });
  } catch (error) {
    console.error("========== TRIP FETCH ERROR ==========");
    console.error(error);
    console.error("======================================");

    res.status(500).json({
      success: false,
      message: "Failed to fetch trips",
    });
  }
});

/* =========================================================
   GET ALL TRIPS FOR ADMIN
   Includes published + unpublished
========================================================= */

router.get("/admin", async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: {
        order: "asc",
      },
    });

    res.json({
      success: true,
      data: trips,
    });
  } catch (error) {
    console.error("========== ADMIN TRIP FETCH ERROR ==========");
    console.error(error);
    console.error("============================================");

    res.status(500).json({
      success: false,
      message: "Failed to fetch trips",
    });
  }
});

/* =========================================================
   CREATE TRIP
========================================================= */

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Trip image is required",
      });
    }

    const {
      category,
      heading,
      subtitle,
      dates,
      duration,
      body,
      bookNowUrl,
      order,
      published,
    } = req.body;

    // Upload image to Cloudinary
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "maarga/trips",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result?.secure_url) {
            reject(new Error("Cloudinary did not return an image URL"));
            return;
          }

          resolve(result.secure_url);
        }
      );

      uploadStream.end(req.file!.buffer);
    });

    const trip = await prisma.trip.create({
      data: {
        image: imageUrl,
        category,
        heading,
        subtitle: subtitle || null,
        dates,
        duration,
        body,
        bookNowUrl,
        order: Number(order) || 0,
        published: published === "true",
      },
    });

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: trip,
    });
  } catch (error) {
    console.error("========== TRIP CREATE ERROR ==========");
    console.error(error);
    console.error("=======================================");

    res.status(500).json({
      success: false,
      message: "Failed to create trip",
    });
  }
});

/* =========================================================
   UPDATE TRIP
   Image is optional.
   If a new image is selected:
   - Upload new image to Cloudinary
   - Delete old Cloudinary image
========================================================= */

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const existingTrip = await prisma.trip.findUnique({
      where: {
        id,
      },
    });

    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const {
      category,
      heading,
      subtitle,
      dates,
      duration,
      body,
      bookNowUrl,
      order,
      published,
    } = req.body;

    let imageUrl = existingTrip.image;

    /*
     * If a new image was selected,
     * upload it to Cloudinary.
     */
    if (req.file) {
      imageUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "maarga/trips",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result?.secure_url) {
              reject(new Error("Cloudinary did not return an image URL"));
              return;
            }

            resolve(result.secure_url);
          }
        );

        uploadStream.end(req.file!.buffer);
      });

      /*
       * Delete old Cloudinary image.
       * If the old image was an external URL,
       * nothing happens.
       */
      const oldPublicId = getCloudinaryPublicId(existingTrip.image);

      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId, {
            resource_type: "image",
          });
        } catch (error) {
          console.error("Failed to delete old Cloudinary image:", error);
        }
      }
    }

    const updatedTrip = await prisma.trip.update({
      where: {
        id,
      },
      data: {
        image: imageUrl,
        category,
        heading,
        subtitle: subtitle || null,
        dates,
        duration,
        body,
        bookNowUrl,
        order: Number(order) || 0,
        published: published === "true",
      },
    });

    res.json({
      success: true,
      message: "Trip updated successfully",
      data: updatedTrip,
    });
  } catch (error) {
    console.error("========== TRIP UPDATE ERROR ==========");
    console.error(error);
    console.error("=======================================");

    res.status(500).json({
      success: false,
      message: "Failed to update trip",
    });
  }
});

/* =========================================================
   DELETE TRIP
   Also deletes the Cloudinary image if applicable.
========================================================= */

router.delete("/:id", async (req, res) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const existingTrip = await prisma.trip.findUnique({
      where: {
        id,
      },
    });

    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    /*
     * Delete image from Cloudinary first.
     * Old external images are simply ignored.
     */
    const publicId = getCloudinaryPublicId(existingTrip.image);

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Failed to delete Cloudinary image:", error);
      }
    }

    await prisma.trip.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("========== TRIP DELETE ERROR ==========");
    console.error(error);
    console.error("=======================================");

    res.status(500).json({
      success: false,
      message: "Failed to delete trip",
    });
  }
});

export default router;