-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subtitle" TEXT,
    "dates" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bookNowUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);
