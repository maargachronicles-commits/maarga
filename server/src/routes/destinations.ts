import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
/* Loaded lazily so the API still boots when `prisma generate` has not run.
   JsonNull is only needed for the JSON columns of this legacy route. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any;
let JsonNull: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  JsonNull = require("../../generated/prisma/client").JsonNull;
} catch {
  /* file store / no generated client: plain null is fine */
}
import prisma from "../lib/prisma";


const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
});

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
};

const getCloudinaryPublicId = (imageUrl: string | null) => {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;

    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let publicId = pathname.substring(uploadIndex + 8);

    const parts = publicId.split("/");

    if (parts.length > 1 && /^v\d+$/.test(parts[0])) {
      parts.shift();
    }

    publicId = parts.join("/");

    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch {
    return null;
  }
};

const deleteFromCloudinary = async (imageUrl: string | null) => {
  const publicId = getCloudinaryPublicId(imageUrl);

  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
  }
};

// ============================================================
// GET PUBLIC DESTINATIONS
// ============================================================

router.get("/", async (_req, res) => {
  try {
    const destinations = await prisma.destination.findMany({
      where: {
        published: true,
      },
      orderBy: [
        {
          order: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    res.json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    console.error("========== DESTINATION FETCH ERROR ==========");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch destinations",
    });
  }
});

// ============================================================
// GET ALL DESTINATIONS FOR ADMIN
// ============================================================

router.get("/admin", async (_req, res) => {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    res.json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    console.error("========== ADMIN DESTINATION FETCH ERROR ==========");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch destinations",
    });
  }
});

// ============================================================
// UPLOAD DESTINATION IMAGE
// ============================================================

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      "maarga/destinations"
    );

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully!",
      url: uploaded.secure_url,
      data: {
        url: uploaded.secure_url,
      },
    });
  } catch (error) {
    console.error("========== DESTINATION IMAGE UPLOAD ERROR ==========");
    console.error(error);
    console.error("====================================================");

    return res.status(500).json({
      success: false,
      message: "Failed to upload destination image",
    });
  }
});

// ============================================================
// GET SINGLE DESTINATION
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);

    const destination = await prisma.destination.findUnique({
      where: {
        id,
      },
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.json({
      success: true,
      data: destination,
    });
  } catch (error) {
    console.error("========== SINGLE DESTINATION ERROR ==========");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch destination",
    });
  }
});

// ============================================================
// CREATE DESTINATION
// ============================================================

router.post(
  "/",
  upload.fields([
    { name: "heroImage", maxCount: 1 },
    { name: "scholarPortrait", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        subtitle,
        region,
        status,
        unescoStatus,
        heroImageAltText,
        overviewContent,
        whatYouWillUnderstand,
        scholarName,
        scholarCredentials,
        placesCovered,
        bestSeason,
        nearestAirport,
        recommendedDuration,
        groupSize,
        difficultyLevel,
        seasonNotes,
        mainFestival,
        festivalMonth,
          weatherOverview,
  itineraries,
  itineraryData,
  order,
  published,
} = req.body;

      if (!name || !region) {
        return res.status(400).json({
          success: false,
          message: "Destination name and region are required",
        });
      }

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      let heroImage: string | null = null;
      let scholarPortrait: string | null = null;

      if (files?.heroImage?.[0]) {
        const uploaded = await uploadToCloudinary(
          files.heroImage[0].buffer,
          "maarga/destinations"
        );

        heroImage = uploaded.secure_url;
      }

      if (files?.scholarPortrait?.[0]) {
        const uploaded = await uploadToCloudinary(
          files.scholarPortrait[0].buffer,
          "maarga/destinations/scholars"
        );

        scholarPortrait = uploaded.secure_url;
      }

      let parsedUnderstand:
  | JsonValue
  | JsonValue = JsonNull;

try {
  parsedUnderstand = whatYouWillUnderstand
    ? (JSON.parse(whatYouWillUnderstand) as JsonValue)
    : JsonNull;
} catch {
  parsedUnderstand = JsonNull;
}

let parsedPlaces: JsonValue = [];

try {
  parsedPlaces = placesCovered
    ? (JSON.parse(placesCovered) as JsonValue)
    : [];
} catch {
  parsedPlaces = [];
}

let parsedItinerary: JsonValue = [];

try {
  parsedItinerary = itineraryData
    ? (JSON.parse(itineraryData) as JsonValue)
    : [];
} catch {
  parsedItinerary = [];
}
      const destination = await prisma.destination.create({
        data: {
          name,
          subtitle: subtitle || null,
          region,
          status: status || "DRAFT",
          unescoStatus: unescoStatus || null,

          heroImage,
          heroImageAltText: heroImageAltText || null,

          overviewContent: overviewContent || null,
          whatYouWillUnderstand: parsedUnderstand,

          scholarName: scholarName || null,
          scholarCredentials: scholarCredentials || null,
          scholarPortrait,

          placesCovered: parsedPlaces,

          bestSeason: bestSeason || null,
          nearestAirport: nearestAirport || null,
          recommendedDuration: recommendedDuration || null,
          groupSize: groupSize || null,
          difficultyLevel: difficultyLevel || null,

          seasonNotes: seasonNotes || null,
          mainFestival: mainFestival || null,
          festivalMonth: festivalMonth || null,
          weatherOverview: weatherOverview || null,

          itineraries: itineraries ? Number(itineraries) : 0,
itineraryData: parsedItinerary,
order: order ? Number(order) : 0,

          published:
            published === "true" ||
            published === true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Destination created successfully!",
        data: destination,
      });
    } catch (error) {
      console.error("========== DESTINATION CREATE ERROR ==========");
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to create destination",
      });
    }
  }
);

// ============================================================
// UPDATE DESTINATION
// ============================================================

router.put(
  "/:id",
  upload.fields([
    { name: "heroImage", maxCount: 1 },
    { name: "scholarPortrait", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const id = String(req.params.id);

      const existingDestination =
        await prisma.destination.findUnique({
          where: {
            id,
          },
        });

      if (!existingDestination) {
        return res.status(404).json({
          success: false,
          message: "Destination not found",
        });
      }

      const {
        name,
        subtitle,
        region,
        status,
        unescoStatus,
        heroImageAltText,
        overviewContent,
        whatYouWillUnderstand,
        scholarName,
        scholarCredentials,
        placesCovered,
        bestSeason,
        nearestAirport,
        recommendedDuration,
        groupSize,
        difficultyLevel,
        seasonNotes,
        mainFestival,
        festivalMonth,
        weatherOverview,
itineraries,
itineraryData,
order,
published,
      } = req.body;

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      let heroImage = existingDestination.heroImage;
      let scholarPortrait = existingDestination.scholarPortrait;

      if (files?.heroImage?.[0]) {
        const uploaded = await uploadToCloudinary(
          files.heroImage[0].buffer,
          "maarga/destinations"
        );

        heroImage = uploaded.secure_url;

        if (existingDestination.heroImage) {
          await deleteFromCloudinary(
            existingDestination.heroImage
          );
        }
      }

      if (files?.scholarPortrait?.[0]) {
        const uploaded = await uploadToCloudinary(
          files.scholarPortrait[0].buffer,
          "maarga/destinations/scholars"
        );

        scholarPortrait = uploaded.secure_url;

        if (existingDestination.scholarPortrait) {
          await deleteFromCloudinary(
            existingDestination.scholarPortrait
          );
        }
      }

      let parsedUnderstand:
  | JsonValue
  | JsonValue =
  existingDestination.whatYouWillUnderstand
    ? (existingDestination.whatYouWillUnderstand as JsonValue)
    : JsonNull;

if (whatYouWillUnderstand !== undefined) {
  try {
    parsedUnderstand = whatYouWillUnderstand
      ? (JSON.parse(whatYouWillUnderstand) as JsonValue)
      : JsonNull;
  } catch {
    parsedUnderstand = existingDestination.whatYouWillUnderstand
      ? (existingDestination.whatYouWillUnderstand as JsonValue)
      : JsonNull;
  }
}

let parsedPlaces: JsonValue =
  existingDestination.placesCovered
    ? (existingDestination.placesCovered as JsonValue)
    : [];

if (placesCovered !== undefined) {
  try {
    parsedPlaces = placesCovered
      ? (JSON.parse(placesCovered) as JsonValue)
      : [];
  } catch {
    parsedPlaces = existingDestination.placesCovered
      ? (existingDestination.placesCovered as JsonValue)
      : [];
  }
}
let parsedItinerary: JsonValue =
  existingDestination.itineraryData
    ? (existingDestination.itineraryData as JsonValue)
    : [];

if (itineraryData !== undefined) {
  try {
    parsedItinerary = itineraryData
      ? (JSON.parse(itineraryData) as JsonValue)
      : [];
  } catch {
    parsedItinerary = existingDestination.itineraryData
      ? (existingDestination.itineraryData as JsonValue)
      : [];
  }
}

      const destination = await prisma.destination.update({
        where: {
          id,
        },
        data: {
          name: name ?? existingDestination.name,

          subtitle:
            subtitle !== undefined
              ? subtitle || null
              : existingDestination.subtitle,

          region:
            region ?? existingDestination.region,

          status:
            status ?? existingDestination.status,

          unescoStatus:
            unescoStatus !== undefined
              ? unescoStatus || null
              : existingDestination.unescoStatus,

          heroImage,

          heroImageAltText:
            heroImageAltText !== undefined
              ? heroImageAltText || null
              : existingDestination.heroImageAltText,

          overviewContent:
            overviewContent !== undefined
              ? overviewContent || null
              : existingDestination.overviewContent,

          whatYouWillUnderstand:
            parsedUnderstand,

          scholarName:
            scholarName !== undefined
              ? scholarName || null
              : existingDestination.scholarName,

          scholarCredentials:
            scholarCredentials !== undefined
              ? scholarCredentials || null
              : existingDestination.scholarCredentials,

          scholarPortrait,

          placesCovered:
            parsedPlaces,

          bestSeason:
            bestSeason !== undefined
              ? bestSeason || null
              : existingDestination.bestSeason,

          nearestAirport:
            nearestAirport !== undefined
              ? nearestAirport || null
              : existingDestination.nearestAirport,

          recommendedDuration:
            recommendedDuration !== undefined
              ? recommendedDuration || null
              : existingDestination.recommendedDuration,

          groupSize:
            groupSize !== undefined
              ? groupSize || null
              : existingDestination.groupSize,

          difficultyLevel:
            difficultyLevel !== undefined
              ? difficultyLevel || null
              : existingDestination.difficultyLevel,

          seasonNotes:
            seasonNotes !== undefined
              ? seasonNotes || null
              : existingDestination.seasonNotes,

          mainFestival:
            mainFestival !== undefined
              ? mainFestival || null
              : existingDestination.mainFestival,

          festivalMonth:
            festivalMonth !== undefined
              ? festivalMonth || null
              : existingDestination.festivalMonth,

          weatherOverview:
            weatherOverview !== undefined
              ? weatherOverview || null
              : existingDestination.weatherOverview,

          itineraries:
  itineraries !== undefined
    ? Number(itineraries)
    : existingDestination.itineraries,

itineraryData: parsedItinerary,

order:
            order !== undefined
              ? Number(order)
              : existingDestination.order,

          published:
            published !== undefined
              ? published === "true" ||
                published === true
              : existingDestination.published,
        },
      });

      res.json({
        success: true,
        message: "Destination updated successfully!",
        data: destination,
      });
    } catch (error) {
      console.error("========== DESTINATION UPDATE ERROR ==========");
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to update destination",
      });
    }
  }
);

// ============================================================
// DELETE DESTINATION
// ============================================================

router.delete("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);

    const destination =
      await prisma.destination.findUnique({
        where: {
          id,
        },
      });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    if (destination.heroImage) {
      await deleteFromCloudinary(
        destination.heroImage
      );
    }

    if (destination.scholarPortrait) {
      await deleteFromCloudinary(
        destination.scholarPortrait
      );
    }

    await prisma.destination.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Destination deleted successfully!",
    });
  } catch (error) {
    console.error("========== DESTINATION DELETE ERROR ==========");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete destination",
    });
  }
});

export default router;