-- Round 8: destinations & itineraries, activity icons, media library, events page
ALTER TABLE "Destination" ADD COLUMN "code" TEXT,
  ADD COLUMN "heroLabel" TEXT,
  ADD COLUMN "heroTitle" TEXT,
  ADD COLUMN "experienceUrl" TEXT,
  ADD COLUMN "enquireLabel" TEXT,
  ADD COLUMN "enquireTitle" TEXT,
  ADD COLUMN "enquireText" TEXT,
  ADD COLUMN "enquireCtaText" TEXT,
  ADD COLUMN "enquireCtaUrl" TEXT;
CREATE UNIQUE INDEX "Destination_code_key" ON "Destination"("code");

ALTER TABLE "Event" ADD COLUMN "subtitle" TEXT,
  ADD COLUMN "body" TEXT,
  ADD COLUMN "whoIsThisFor" TEXT,
  ADD COLUMN "postEventText" TEXT,
  ADD COLUMN "feedback" JSONB,
  ADD COLUMN "bookUrl" TEXT,
  ADD COLUMN "bookCtaText" TEXT DEFAULT 'Book now',
  ADD COLUMN "earlyBirdNote" TEXT;

CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "destinationId" TEXT NOT NULL,
    "label" TEXT DEFAULT 'Journey Path',
    "title" TEXT,
    "durationLabel" TEXT,
    "heroImage" TEXT,
    "heroLabel" TEXT,
    "heroTitle" TEXT,
    "heroCtaText" TEXT DEFAULT 'Enquire about this journey',
    "heroCtaUrl" TEXT,
    "staysTitle" TEXT DEFAULT 'Where you''ll stay',
    "intellectsLabel" TEXT DEFAULT 'Intellects',
    "intellectsTitle" TEXT DEFAULT 'The Scholar Who Reads This Place',
    "intellectsIntro" TEXT,
    "enquireLabel" TEXT DEFAULT 'Enquire',
    "enquireTitle" TEXT DEFAULT 'Begin Your Maarga',
    "enquireText" TEXT,
    "enquireCtaText" TEXT DEFAULT 'Enquire about this journey',
    "enquireCtaUrl" TEXT,
    "pdfUrl" TEXT,
    "days" JSONB,
    "stays" JSONB,
    "iconOverrides" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Itinerary_code_key" ON "Itinerary"("code");

CREATE TABLE "ActivityIcon" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ActivityIcon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "kind" TEXT NOT NULL DEFAULT 'image',
    "inBank" BOOLEAN NOT NULL DEFAULT false,
    "inFolderGallery" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventPrinciple" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EventPrinciple_pkey" PRIMARY KEY ("id")
);
