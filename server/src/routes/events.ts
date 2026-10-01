import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../lib/prisma";

const router = express.Router();

// ============================================================
// CLOUDINARY
// ============================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================================
// MULTER
// ============================================================

const upload = multer({
  storage: multer.memoryStorage(),
});

// ============================================================
// HELPERS
// ============================================================

const uploadToCloudinary = (
  buffer: Buffer
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "maarga/events",
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

    // Remove transformation path if present
    const parts = publicId.split("/");

    if (
      parts.length > 1 &&
      /^v\d+$/.test(parts[0])
    ) {
      parts.shift();
    }

    publicId = parts.join("/");

    // Remove extension
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
// GET PUBLIC EVENTS
// ============================================================

router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        published: true,
      },
      orderBy: [
        {
          eventDate: "asc",
        },
        {
          order: "asc",
        },
      ],
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("========== EVENT FETCH ERROR ==========");
    console.error(error);
    console.error("======================================");

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
});

// ============================================================
// GET ALL EVENTS FOR ADMIN
// ============================================================

router.get("/admin", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: [
        {
          eventDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("========== ADMIN EVENT FETCH ERROR ==========");
    console.error(error);
    console.error("=============================================");

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
});

// ============================================================
// GET SINGLE EVENT
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("========== SINGLE EVENT FETCH ERROR ==========");
    console.error(error);
    console.error("================================================");

    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
});

// ============================================================
// CREATE EVENT
// ============================================================

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      duration,

      format,
      meetingPlatform,
      meetingLink,
      location,
      capacity,

      scholar,
      scholarBio,
      sessionOutline,
      preReadingMaterials,

      imageAltText,

      openRegistration,
      standardTicketPrice,
      earlyBirdEnabled,
      earlyBirdPrice,
      earlyBirdDeadline,

      confirmationEmailTemplate,
      reminderOneWeek,
      reminderOneDay,
      reminderOneHour,

      status,
      visibility,
      published,
      order,
    } = req.body;

    if (!title || !eventDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, event date, start time and end time are required",
      });
    }

    let image: string | null = null;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer);
      image = uploaded.secure_url;
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,

        eventDate: new Date(eventDate),
        startTime,
        endTime,
        duration: duration || null,

        format: format || "ONLINE",
        meetingPlatform: meetingPlatform || null,
        meetingLink: meetingLink || null,
        location: location || null,
        capacity: capacity
          ? Number(capacity)
          : null,

        scholar: scholar || null,
        scholarBio: scholarBio || null,
        sessionOutline: sessionOutline || null,
        preReadingMaterials:
          preReadingMaterials || null,

        image,
        imageAltText: imageAltText || null,

        openRegistration:
          openRegistration !== undefined
            ? openRegistration === "true" ||
              openRegistration === true
            : true,

        standardTicketPrice:
          standardTicketPrice
            ? Number(standardTicketPrice)
            : null,

        earlyBirdEnabled:
          earlyBirdEnabled === "true" ||
          earlyBirdEnabled === true,

        earlyBirdPrice:
          earlyBirdPrice
            ? Number(earlyBirdPrice)
            : null,

        earlyBirdDeadline:
          earlyBirdDeadline
            ? new Date(earlyBirdDeadline)
            : null,

        confirmationEmailTemplate:
          confirmationEmailTemplate || null,

        reminderOneWeek:
          reminderOneWeek !== undefined
            ? reminderOneWeek === "true" ||
              reminderOneWeek === true
            : true,

        reminderOneDay:
          reminderOneDay !== undefined
            ? reminderOneDay === "true" ||
              reminderOneDay === true
            : true,

        reminderOneHour:
          reminderOneHour !== undefined
            ? reminderOneHour === "true" ||
              reminderOneHour === true
            : false,

        status: status || "DRAFT",
        visibility: visibility || "PUBLIC",

        published:
          published === "true" ||
          published === true,

        order: order ? Number(order) : 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      data: event,
    });
  } catch (error) {
    console.error("========== EVENT CREATE ERROR ==========");
    console.error(error);
    console.error("========================================");

    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
});

// ============================================================
// UPDATE EVENT
// ============================================================

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const id = String(req.params.id);

    const existingEvent = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      duration,

      format,
      meetingPlatform,
      meetingLink,
      location,
      capacity,

      scholar,
      scholarBio,
      sessionOutline,
      preReadingMaterials,

      imageAltText,

      openRegistration,
      standardTicketPrice,
      earlyBirdEnabled,
      earlyBirdPrice,
      earlyBirdDeadline,

      confirmationEmailTemplate,
      reminderOneWeek,
      reminderOneDay,
      reminderOneHour,

      status,
      visibility,
      published,
      order,
    } = req.body;

    let image = existingEvent.image;

    // --------------------------------------------------------
    // Replace image if a new one was uploaded
    // --------------------------------------------------------

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer);

      image = uploaded.secure_url;

      if (existingEvent.image) {
        await deleteFromCloudinary(existingEvent.image);
      }
    }

    const event = await prisma.event.update({
  where: {
    id,
  },
      data: {
        title,
        description:
          description !== undefined
            ? description || null
            : existingEvent.description,

        eventDate:
          eventDate
            ? new Date(eventDate)
            : existingEvent.eventDate,

        startTime:
          startTime ?? existingEvent.startTime,

        endTime:
          endTime ?? existingEvent.endTime,

        duration:
          duration !== undefined
            ? duration || null
            : existingEvent.duration,

        format:
          format ?? existingEvent.format,

        meetingPlatform:
          meetingPlatform !== undefined
            ? meetingPlatform || null
            : existingEvent.meetingPlatform,

        meetingLink:
          meetingLink !== undefined
            ? meetingLink || null
            : existingEvent.meetingLink,

        location:
          location !== undefined
            ? location || null
            : existingEvent.location,

        capacity:
          capacity !== undefined
            ? capacity
              ? Number(capacity)
              : null
            : existingEvent.capacity,

        scholar:
          scholar !== undefined
            ? scholar || null
            : existingEvent.scholar,

        scholarBio:
          scholarBio !== undefined
            ? scholarBio || null
            : existingEvent.scholarBio,

        sessionOutline:
          sessionOutline !== undefined
            ? sessionOutline || null
            : existingEvent.sessionOutline,

        preReadingMaterials:
          preReadingMaterials !== undefined
            ? preReadingMaterials || null
            : existingEvent.preReadingMaterials,

        image,

        imageAltText:
          imageAltText !== undefined
            ? imageAltText || null
            : existingEvent.imageAltText,

        openRegistration:
          openRegistration !== undefined
            ? openRegistration === "true" ||
              openRegistration === true
            : existingEvent.openRegistration,

        standardTicketPrice:
          standardTicketPrice !== undefined
            ? standardTicketPrice
              ? Number(standardTicketPrice)
              : null
            : existingEvent.standardTicketPrice,

        earlyBirdEnabled:
          earlyBirdEnabled !== undefined
            ? earlyBirdEnabled === "true" ||
              earlyBirdEnabled === true
            : existingEvent.earlyBirdEnabled,

        earlyBirdPrice:
          earlyBirdPrice !== undefined
            ? earlyBirdPrice
              ? Number(earlyBirdPrice)
              : null
            : existingEvent.earlyBirdPrice,

        earlyBirdDeadline:
          earlyBirdDeadline !== undefined
            ? earlyBirdDeadline
              ? new Date(earlyBirdDeadline)
              : null
            : existingEvent.earlyBirdDeadline,

        confirmationEmailTemplate:
          confirmationEmailTemplate !== undefined
            ? confirmationEmailTemplate || null
            : existingEvent.confirmationEmailTemplate,

        reminderOneWeek:
          reminderOneWeek !== undefined
            ? reminderOneWeek === "true" ||
              reminderOneWeek === true
            : existingEvent.reminderOneWeek,

        reminderOneDay:
          reminderOneDay !== undefined
            ? reminderOneDay === "true" ||
              reminderOneDay === true
            : existingEvent.reminderOneDay,

        reminderOneHour:
          reminderOneHour !== undefined
            ? reminderOneHour === "true" ||
              reminderOneHour === true
            : existingEvent.reminderOneHour,

        status:
          status ?? existingEvent.status,

        visibility:
          visibility ?? existingEvent.visibility,

        published:
          published !== undefined
            ? published === "true" ||
              published === true
            : existingEvent.published,

        order:
          order !== undefined
            ? Number(order)
            : existingEvent.order,
      },
    });

    res.json({
      success: true,
      message: "Event updated successfully!",
      data: event,
    });
  } catch (error) {
    console.error("========== EVENT UPDATE ERROR ==========");
    console.error(error);
    console.error("========================================");

    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
});

// ============================================================
// DELETE EVENT
// ============================================================

router.delete("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.image) {
      await deleteFromCloudinary(event.image);
    }

    await prisma.event.delete({
  where: {
    id,
  },
});

    res.json({
      success: true,
      message: "Event deleted successfully!",
    });
  } catch (error) {
    console.error("========== EVENT DELETE ERROR ==========");
    console.error(error);
    console.error("========================================");

    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
});

export default router;