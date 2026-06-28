-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcmToken" TEXT;

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "studyReminderEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studyReminderTime" TEXT;
