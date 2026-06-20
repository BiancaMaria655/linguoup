-- Rollback Script for Initial Migration (20260620000757_initial)
-- Drops all foreign keys, tables, and enums in correct dependency order.

-- 1. Drop Foreign Key Constraints
ALTER TABLE "UserPreferences" DROP CONSTRAINT IF EXISTS "UserPreferences_userId_fkey";
ALTER TABLE "LessonCompletion" DROP CONSTRAINT IF EXISTS "LessonCompletion_userId_fkey";
ALTER TABLE "LessonCompletion" DROP CONSTRAINT IF EXISTS "LessonCompletion_lessonId_fkey";
ALTER TABLE "UserProgress" DROP CONSTRAINT IF EXISTS "UserProgress_userId_fkey";
ALTER TABLE "UserAchievement" DROP CONSTRAINT IF EXISTS "UserAchievement_userId_fkey";
ALTER TABLE "UserAchievement" DROP CONSTRAINT IF EXISTS "UserAchievement_achievementId_fkey";
ALTER TABLE "SpacedReviewItem" DROP CONSTRAINT IF EXISTS "SpacedReviewItem_userId_fkey";
ALTER TABLE "SpacedReviewItem" DROP CONSTRAINT IF EXISTS "SpacedReviewItem_lessonId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";

-- 2. Drop Tables
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "SpacedReviewItem" CASCADE;
DROP TABLE IF EXISTS "UserAchievement" CASCADE;
DROP TABLE IF EXISTS "Achievement" CASCADE;
DROP TABLE IF EXISTS "UserProgress" CASCADE;
DROP TABLE IF EXISTS "LessonCompletion" CASCADE;
DROP TABLE IF EXISTS "Lesson" CASCADE;
DROP TABLE IF EXISTS "UserPreferences" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 3. Drop Custom Types / Enums
DROP TYPE IF EXISTS "Role" CASCADE;
