import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { SpacedReviewItemRepository } from '../repositories/spaced-review-item.repository';
import { Prisma } from '@linguoup/database';

const SM2_INITIAL_EASE_FACTOR = 2.5;
const SM2_INITIAL_INTERVAL = 1;
const SM2_INITIAL_REPETITIONS = 0;

export interface LessonItem {
  content: string;
  type: 'vocabulary' | 'grammar';
}

export interface CreateSpacedReviewItemsCommand {
  userId: string;
  tenantId: string;
  lessonId: string;
  traceId: string;
  items: LessonItem[];
}

@Injectable()
export class CreateSpacedReviewItemsUseCase {
  constructor(
    private readonly spacedReviewItemRepository: SpacedReviewItemRepository,
    private readonly structuredLogger: StructuredLogger,
  ) {
    this.structuredLogger.setService('reviews');
  }

  async execute(
    tx: Prisma.TransactionClient,
    command: CreateSpacedReviewItemsCommand,
  ): Promise<void> {
    const { userId, tenantId, lessonId, traceId, items } = command;

    if (items.length === 0) {
      this.structuredLogger.log('No items to create spaced review items for', {
        trace_id: traceId,
        user_id: userId,
        tenant_id: tenantId,
        metadata: { lessonId },
      });
      return;
    }

    const nextReviewAt = new Date();
    nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + SM2_INITIAL_INTERVAL);
    nextReviewAt.setUTCHours(0, 0, 0, 0);

    await this.spacedReviewItemRepository.createMany(
      tx,
      items.map((item) => ({
        tenantId,
        userId,
        lessonId,
        itemContent: item.content,
        itemType: item.type,
        nextReviewAt,
        easeFactor: SM2_INITIAL_EASE_FACTOR,
        interval: SM2_INITIAL_INTERVAL,
        repetitions: SM2_INITIAL_REPETITIONS,
        quality: null,
      })),
    );

    this.structuredLogger.log('Spaced review items created for lesson', {
      trace_id: traceId,
      user_id: userId,
      tenant_id: tenantId,
      metadata: { lessonId, itemCount: items.length },
    });
  }
}
