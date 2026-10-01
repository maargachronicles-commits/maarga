-- Per-card button text / link for every homepage collection (editable in the CMS).
ALTER TABLE "Intellect"    ADD COLUMN IF NOT EXISTS "ctaText" TEXT, ADD COLUMN IF NOT EXISTS "ctaUrl" TEXT;
ALTER TABLE "Destination"  ADD COLUMN IF NOT EXISTS "ctaText" TEXT, ADD COLUMN IF NOT EXISTS "ctaUrl" TEXT;
ALTER TABLE "Testimonial"  ADD COLUMN IF NOT EXISTS "ctaText" TEXT, ADD COLUMN IF NOT EXISTS "ctaUrl" TEXT;
ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "ctaUrl" TEXT;
