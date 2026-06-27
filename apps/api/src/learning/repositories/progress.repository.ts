import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LessonCompletion, UserProgress } from '@linguoup/database';
import { Prisma } from '@linguoup/database';

export interface UpsertProgressParams {
  userId: string;
  tenantId: string;
  xpEarned: number;
}

export interface UpdateStreakParams {
  userId: string;
  newStreakDays: number;
  today: Date;
}

export interface CreateLessonCompletionData {
  userId: string;
  lessonId: string;
  tenantId: string;
  score: number;
  xpEarned: number;
}

@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertProgress(
    tx: Prisma.TransactionClient,
    params: UpsertProgressParams,
  ): Promise<UserProgress> {
    const { userId, tenantId, xpEarned } = params;

    const existing = await tx.userProgress.findUnique({ where: { userId } });

    if (existing) {
      return tx.userProgress.update({
        where: { userId },
        data: { totalXP: { increment: xpEarned } },
      });
    }

    return tx.userProgress.create({
      data: {
        userId,
        tenant_id: tenantId,
        totalXP: xpEarned,
        currentLevel: 1,
        currentStreakDays: 0,
        longestStreak: 0,
      },
    });
  }

  async updateStreak(
    tx: Prisma.TransactionClient,
    params: UpdateStreakParams,
  ): Promise<UserProgress> {
    const { userId, newStreakDays, today } = params;

    return tx.userProgress.update({
      where: { userId },
      data: {
        currentStreakDays: newStreakDays,
        longestStreak: { set: newStreakDays }, // will be handled by use-case with Math.max
        lastActivityDate: today,
      },
    });
  }

  async createLessonCompletion(
    tx: Prisma.TransactionClient,
    data: CreateLessonCompletionData,
  ): Promise<LessonCompletion> {
    return tx.lessonCompletion.create({
      data: {
        userId: data.userId,
        lessonId: data.lessonId,
        tenant_id: data.tenantId,
        score: data.score,
        xpEarned: data.xpEarned,
      },
    });
  }

  async findProgressByUserId(userId: string): Promise<UserProgress | null> {
    return this.prisma.userProgress.findUnique({ where: { userId } });
  }

  async findLessonsCompletedCount(userId: string): Promise<number> {
    return this.prisma.lessonCompletion.count({ where: { userId } });
  }

  async findProgressWithCompletions(userId: string): Promise<{
    progress: UserProgress | null;
    completions: { lessonId: string; completedAt: Date; durationMinutes: number }[];
  }> {
    const progress = await this.prisma.userProgress.findUnique({ where: { userId } });
    const completions = await this.prisma.lessonCompletion.findMany({
      where: { userId },
      include: { lesson: { select: { durationMinutes: true } } },
    });

    return {
      progress,
      completions: completions.map((c) => ({
        lessonId: c.lessonId,
        completedAt: c.completedAt,
        durationMinutes: c.lesson.durationMinutes,
      })),
    };
  }

  async findWeeklyActivity(
    userId: string,
    days: number,
  ): Promise<{ date: string; lessonsCompleted: number; minutesStudied: number }[]> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - (days - 1));
    since.setUTCHours(0, 0, 0, 0);

    const completions = await this.prisma.lessonCompletion.findMany({
      where: { userId, completedAt: { gte: since } },
      include: { lesson: { select: { durationMinutes: true } } },
    });

    // Build map of date -> aggregated stats
    const map = new Map<string, { lessonsCompleted: number; minutesStudied: number }>();

    // Pre-fill all N days with zeros (ascending order)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { lessonsCompleted: 0, minutesStudied: 0 });
    }

    for (const c of completions) {
      const key = c.completedAt.toISOString().slice(0, 10);
      const existing = map.get(key);
      if (existing) {
        existing.lessonsCompleted += 1;
        existing.minutesStudied += c.lesson.durationMinutes;
      }
    }

    return Array.from(map.entries()).map(([date, stats]) => ({ date, ...stats }));
  }

  async findActivityCalendar(
    userId: string,
    days: number,
  ): Promise<{ date: string; active: boolean }[]> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - (days - 1));
    since.setUTCHours(0, 0, 0, 0);

    const completions = await this.prisma.lessonCompletion.findMany({
      where: { userId, completedAt: { gte: since } },
      select: { completedAt: true },
    });

    const activeDates = new Set(completions.map((c) => c.completedAt.toISOString().slice(0, 10)));

    const calendar: { date: string; active: boolean }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const date = d.toISOString().slice(0, 10);
      calendar.push({ date, active: activeDates.has(date) });
    }

    return calendar;
  }
}
