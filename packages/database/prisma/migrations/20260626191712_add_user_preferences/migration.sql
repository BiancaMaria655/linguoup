/*
  Warnings:

  - Added the required column `updatedAt` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPreferences"
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
ALTER COLUMN "preferredStudyTime" DROP NOT NULL;

-- Remove the default from updatedAt (Prisma manages this via @updatedAt)
ALTER TABLE "UserPreferences" ALTER COLUMN "updatedAt" DROP DEFAULT;
