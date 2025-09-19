-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "publicReview" TEXT NOT NULL,
    "privateNotes" TEXT,
    "reviewCategories" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "displayOnWebsite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Review_propertyId_idx" ON "Review"("propertyId");

-- CreateIndex
CREATE INDEX "Review_channel_idx" ON "Review"("channel");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_approved_idx" ON "Review"("approved");

-- CreateIndex
CREATE INDEX "Review_displayOnWebsite_idx" ON "Review"("displayOnWebsite");

-- CreateIndex
CREATE INDEX "Review_submittedAt_idx" ON "Review"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_sourceId_source_key" ON "Review"("sourceId", "source");
