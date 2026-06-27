import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { ProgressRepository } from '../repositories/progress.repository';

export interface GetStreakCommand {
  userId: string;
  tenantId: string;
  traceId: string;
}

export interface ActivityCalendarEntry {
  date: string;
  active: boolean;
}

export interface GetStreakResult {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  activityCalendar: ActivityCalendarEntry[];
}

@Injectable()
export class GetStreakUseCase {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('get-streak-use-case');
  }

  async execute(command: GetStreakCommand): Promise<GetStreakResult> {
    const { userId, tenantId, traceId } = command;

    const progress = await this.progressRepository.findProgressByUserId(userId);
    const activityCalendar = await this.progressRepository.findActivityCalendar(userId, 30);

    this.logger.log('Streak retrieved', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
    });

    return {
      currentStreak: progress?.currentStreakDays ?? 0,
      longestStreak: progress?.longestStreak ?? 0,
      lastActivityDate: progress?.lastActivityDate
        ? progress.lastActivityDate.toISOString().slice(0, 10)
        : null,
      activityCalendar,
    };
  }
}
