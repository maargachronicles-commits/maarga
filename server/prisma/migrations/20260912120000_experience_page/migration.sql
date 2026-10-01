-- Experience page CMS + per-page intellect placements (settings keys need no migration)
CREATE TABLE "IntellectPlacement" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "intellectId" TEXT,
    "name" TEXT,
    "designation" TEXT,
    "description" TEXT,
    "image" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IntellectPlacement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExperienceSite" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "lensALabel" TEXT DEFAULT 'Engineering',
    "lensAText" TEXT,
    "lensBLabel" TEXT DEFAULT 'Cosmology',
    "lensBText" TEXT,
    "image" TEXT,
    "figure" TEXT DEFAULT 'boulders',
    "figureLeft" TEXT,
    "figureTop" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExperienceSite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExperienceFragment" (
    "id" TEXT NOT NULL,
    "text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExperienceFragment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExperienceQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExperienceQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntellectPlacement_page_idx" ON "IntellectPlacement"("page");
