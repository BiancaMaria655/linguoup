import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

export interface GetXpCommand {
  userId: string;
  tenantId: string;
  traceId: string;
}

export interface XpHistoryEntry {
  xpEarned: number;
  source: 'lesson';
  lessonId: string;
  earnedAt: Date;
}

export interface GetXpResult {
  total: number;
  history: XpHistoryEntry[];
}

@Injectable()
export class GetXpUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly structuredLogger: StructuredLogger,
  ) {
    this.structuredLogger.setService('get-xp-use-case');
  }

  async execute(command: GetXpCommand): Promise<GetXpResult> {
    const { userId, tenantId, traceId } = command;

    const [progress, completions] = await Promise.all([
      this.prisma.userProgress.findUnique({ where: { userId } }),
      this.prisma.lessonCompletion.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        select: { xpEarned: true, lessonId: true, completedAt: true },
      }),
    ]);

    const total = progress?.totalXP ?? 0;
    const history: XpHistoryEntry[] = completions.map((c) => ({
      xpEarned: c.xpEarned,
      source: 'lesson',
      lessonId: c.lessonId,
      earnedAt: c.completedAt,
    }));

    this.structuredLogger.log('XP retrieved', {
      trace_id: traceId,
      user_id: userId,
      tenant_id: tenantId,
      metadata: { total, historyCount: history.length },
    });

    return { total, history };
  }
}
