-- Homepage editor: draft/publish status, "show on homepage" toggle stays in `published`,
-- editable button labels, and nullable required-ish columns so DRAFTS can be incomplete.

-- Trip
ALTER TABLE "Trip" ALTER COLUMN "image" DROP NOT NULL;
ALTER TABLE "Trip" ALTER COLUMN "category" DROP NOT NULL;
ALTER TABLE "Trip" ALTER COLUMN "heading" DROP NOT NULL;
ALTER TABLE "Trip" ALTER COLUMN "dates" DROP NOT NULL;
ALTER TABLE "Trip" ALTER COLUMN "duration" DROP NOT NULL;
ALTER TABLE "Trip" ALTER COLUMN "body" DROP NOT NULL;
ALTER TABLE "Trip" ALTER COLUMN "bookNowUrl" DROP NOT NULL;
ALTER TABLE "Trip" ADD COLUMN "primaryCtaText" TEXT DEFAULT 'Experience with us';
ALTER TABLE "Trip" ADD COLUMN "secondaryCtaText" TEXT DEFAULT 'View Itinerary';
ALTER TABLE "Trip" ADD COLUMN "secondaryCtaUrl" TEXT;
ALTER TABLE "Trip" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PUBLISHED';

-- Event
ALTER TABLE "Event" ALTER COLUMN "eventDate" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "startTime" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "endTime" DROP NOT NULL;
ALTER TABLE "Event" ADD COLUMN "ctaText" TEXT DEFAULT 'Know more';
ALTER TABLE "Event" ADD COLUMN "ctaUrl" TEXT;

-- Destination
ALTER TABLE "Destination" ALTER COLUMN "region" DROP NOT NULL;

-- Intellect
ALTER TABLE "Intellect" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "Intellect" ALTER COLUMN "designation" DROP NOT NULL;
ALTER TABLE "Intellect" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "Intellect" ALTER COLUMN "image" DROP NOT NULL;
ALTER TABLE "Intellect" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PUBLISHED';

-- Testimonial
ALTER TABLE "Testimonial" ALTER COLUMN "quote" DROP NOT NULL;
ALTER TABLE "Testimonial" ALTER COLUMN "travellerName" DROP NOT NULL;
ALTER TABLE "Testimonial" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PUBLISHED';

-- GalleryImage
ALTER TABLE "GalleryImage" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PUBLISHED';
