import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { SpacedReviewItemRepository } from '../repositories/spaced-review-item.repository';
import { SM2AlgorithmService } from '../services/sm2-algorithm.service';

const REVIEW_XP = 5;

export interface CompleteReviewCommand {
  reviewItemId: string;
  userId: string;
  tenantId: string;
  traceId: string;
  quality: number; // 0–5 SM-2 scale
}

export interface CompleteReviewResult {
  nextReviewAt: Date;
  interval: number;
  easeFactor: number;
  xpEarned: number;
}

@Injectable()
export class CompleteReviewUseCase {

  constructor(
    private readonly prisma: PrismaService,
    private readonly spacedReviewItemRepository: SpacedReviewItemRepository,
    private readonly sm2AlgorithmService: SM2AlgorithmService,
    private readonly structuredLogger: StructuredLogger,
  ) {
    this.structuredLogger.setService('reviews');
  }

  async execute(command: CompleteReviewCommand): Promise<CompleteReviewResult> {
    const { reviewItemId, userId, tenantId, traceId, quality } = command;

    // 1. Load review item (validates ownership + tenantId)
    const item = await this.spacedReviewItemRepository.findById(reviewItemId, userId, tenantId);
    if (!item) {
      throw new NotFoundException('Review item not found');
    }

    // 2. Calculate new SM-2 state
    const sm2Result = this.sm2AlgorithmService.calculate(
      {
        interval: item.interval,
        easeFactor: item.easeFactor,
        repetitions: item.repetitions,
      },
      quality,
    );

    // 3. Persist new SM-2 state + award XP atomically.
    //
    // V1 design decision (D2 — modular monolith): XP is awarded via a direct
    // `userProgress.updateMany` increment inside the same Prisma transaction,
    // instead of delegating to `AwardXpUseCase`. This guarantees atomicity
    // (SM-2 state update + XP grant succeed or fail together) without the
    // inter-use-case coupling that would be required in a microservice setup.
    //
    // When the gamification module is extracted to a separate service (V2+),
    // replace this block with a non-critical call to `AwardXpUseCase` outside
    // the transaction, wrapped in try/catch so XP failure never blocks the review.
    const xpEarned = REVIEW_XP;
    await this.prisma.$transaction(async (tx) => {
      await this.spacedReviewItemRepository.update(reviewItemId, {
        interval: sm2Result.interval,
        easeFactor: sm2Result.easeFactor,
        repetitions: sm2Result.repetitions,
        quality,
        nextReviewAt: sm2Result.nextReviewAt,
      });

      await tx.userProgress.updateMany({
        where: { userId, tenant_id: tenantId },
        data: { totalXP: { increment: xpEarned } },
      });
    });

    this.structuredLogger.log('Review completed', {
      trace_id: traceId,
      user_id: userId,
      tenant_id: tenantId,
      metadata: {
        reviewItemId,
        quality,
        newInterval: sm2Result.interval,
        newEaseFactor: sm2Result.easeFactor,
        nextReviewAt: sm2Result.nextReviewAt.toISOString(),
        xpEarned,
      },
    });

    return {
      nextReviewAt: sm2Result.nextReviewAt,
      interval: sm2Result.interval,
      easeFactor: sm2Result.easeFactor,
      xpEarned,
    };
  }
}
