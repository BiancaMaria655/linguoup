import { Injectable } from '@nestjs/common';

export interface StreakResult {
  newStreakDays: number;
  streakUpdated: boolean;
}

@Injectable()
export class LearningDomainService {
  /**
   * Calculates XP earned for a lesson.
   * Linear formula: xpEarned = round(baseXp * score / 100)
   */
  calculateXp(score: number, baseXp: number): number {
    return Math.round(baseXp * score / 100);
  }

  /**
   * Computes the new streak based on the last activity date.
   *
   * Rules:
   *   - Same day → no change (streak already counted)
   *   - Consecutive day → increment by 1
   *   - Missed day(s) → reset to 1
   */
  computeStreak(
    lastActivityDate: Date | null,
    currentStreakDays: number,
    today: Date,
  ): StreakResult {
    if (!lastActivityDate) {
      return { newStreakDays: 1, streakUpdated: true };
    }

    const last = this.toDateOnly(lastActivityDate);
    const now = this.toDateOnly(today);

    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already counted today
      return { newStreakDays: currentStreakDays, streakUpdated: false };
    }

    if (diffDays === 1) {
      // Consecutive day — keep the streak going
      return { newStreakDays: currentStreakDays + 1, streakUpdated: true };
    }

    // Missed one or more days — reset
    return { newStreakDays: 1, streakUpdated: true };
  }

  private toDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
