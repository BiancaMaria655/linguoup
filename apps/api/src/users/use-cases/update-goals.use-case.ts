import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { PrismaService } from '../../database/prisma.service';

export interface UpdateGoalsCommand {
  userId: string;
  tenantId: string;
  traceId: string;
  dailyGoalMinutes?: number;
  dailyGoalLessons?: number;
}

export interface UpdateGoalsResult {
  dailyGoalMinutes: number;
  dailyGoalLessons: number;
  updatedAt: string;
}

@Injectable()
export class UpdateGoalsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('update-goals-use-case');
  }

  async execute(command: UpdateGoalsCommand): Promise<UpdateGoalsResult> {
    const { userId, tenantId, traceId, dailyGoalMinutes, dailyGoalLessons } = command;

    if (dailyGoalMinutes === undefined && dailyGoalLessons === undefined) {
      throw new BadRequestException(
        'At least one of dailyGoalMinutes or dailyGoalLessons must be provided',
      );
    }

    const existing = await this.prisma.userPreferences.findUnique({ where: { userId } });
    if (!existing) {
      throw new NotFoundException('User preferences not found');
    }

    const updated = await this.prisma.userPreferences.update({
      where: { userId },
      data: {
        ...(dailyGoalMinutes !== undefined && { dailyGoalMinutes }),
        ...(dailyGoalLessons !== undefined && { dailyGoalLessons }),
      },
    });

    this.logger.log('Daily goals updated', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
    });

    return {
      dailyGoalMinutes: updated.dailyGoalMinutes,
      dailyGoalLessons: updated.dailyGoalLessons,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
