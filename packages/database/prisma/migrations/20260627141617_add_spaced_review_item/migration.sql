-- AlterTable
ALTER TABLE "SpacedReviewItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "itemContent" TEXT NOT NULL,
ADD COLUMN     "itemType" TEXT NOT NULL,
ADD COLUMN     "quality" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "SpacedReviewItem_userId_tenant_id_nextReviewAt_idx" ON "SpacedReviewItem"("userId", "tenant_id", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpacedReviewItem_userId_lessonId_itemContent_key" ON "SpacedReviewItem"("userId", "lessonId", "itemContent");
