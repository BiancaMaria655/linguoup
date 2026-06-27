-- AddUniqueConstraint: UserAchievement_userId_achievementId_key
-- Rollback: ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_userId_achievementId_key";

-- Remove any existing duplicates before adding the constraint
-- (keeps the oldest record per pair)
DELETE FROM "UserAchievement"
WHERE id NOT IN (
  SELECT DISTINCT ON ("userId", "achievementId") id
  FROM "UserAchievement"
  ORDER BY "userId", "achievementId", "unlockedAt" ASC
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
