import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { ProgressRepository } from '../repositories/progress.repository';

const AVG_VOCAB_PER_LESSON = 6;

export interface GetProgressCommand {
  userId: string;
  tenantId: string;
  traceId: string;
}

export interface WeeklyActivityEntry {
  date: string;
  lessonsCompleted: number;
  minutesStudied: number;
}

export interface MonthlyActivityEntry {
  week: string;
  lessonsCompleted: number;
}

export interface GetProgressResult {
  totalXP: number;
  currentLevel: number;
  lessonsCompleted: number;
  minutesStudied: number;
  vocabularyLearned: number;
  weeklyActivity: WeeklyActivityEntry[];
  monthlyActivity: MonthlyActivityEntry[];
}

@Injectable()
export class GetProgressUseCase {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('get-progress-use-case');
  }

  async execute(command: GetProgressCommand): Promise<GetProgressResult> {
    const { userId, tenantId, traceId } = command;

    const { progress, completions } =
      await this.progressRepository.findProgressWithCompletions(userId);

    const weeklyActivity = await this.progressRepository.findWeeklyActivity(userId, 7);

    const lessonsCompleted = completions.length;
    const minutesStudied = completions.reduce((sum, c) => sum + c.durationMinutes, 0);
    const vocabularyLearned = lessonsCompleted * AVG_VOCAB_PER_LESSON;

    const monthlyActivity = this.buildMonthlyActivity(completions);

    this.logger.log('Progress retrieved', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
    });

    return {
      totalXP: progress?.totalXP ?? 0,
      currentLevel: progress?.currentLevel ?? 1,
      lessonsCompleted,
      minutesStudied,
      vocabularyLearned,
      weeklyActivity,
      monthlyActivity,
    };
  }

  private buildMonthlyActivity(
    completions: { completedAt: Date }[],
  ): MonthlyActivityEntry[] {
    // Generate last 4 ISO week labels
    const weeks = this.getLast4IsoWeeks();
    const map = new Map<string, number>();
    for (const w of weeks) {
      map.set(w, 0);
    }

    for (const c of completions) {
      const week = this.toIsoWeek(c.completedAt);
      if (map.has(week)) {
        map.set(week, (map.get(week) ?? 0) + 1);
      }
    }

    return weeks.map((week) => ({ week, lessonsCompleted: map.get(week) ?? 0 }));
  }

  private getLast4IsoWeeks(): string[] {
    const weeks: string[] = [];
    const today = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i * 7);
      weeks.push(this.toIsoWeek(d));
    }
    // deduplicate in case of overlap at year boundary
    return [...new Set(weeks)].slice(-4);
  }

  private toIsoWeek(date: Date): string {
    // Returns YYYY-Www format
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7; // Mon=1..Sun=7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }
}
