import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { SpacedReviewItemRepository } from '../repositories/spaced-review-item.repository';
import { SpacedReviewItemEntity } from '../repositories/spaced-review-item.entity';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface GetRecommendedReviewsQuery {
  userId: string;
  tenantId: string;
  traceId: string;
  limit?: number;
}

export interface ReviewItemDto {
  id: string;
  lessonId: string;
  lessonTitle: string;
  itemContent: string;
  itemType: string;
  dueDate: string;
  priority: number;
}

export interface GetRecommendedReviewsResult {
  data: ReviewItemDto[];
  metadata: {
    total: number;
    overdueCount: number;
  };
}

@Injectable()
export class GetRecommendedReviewsUseCase {
  constructor(
    private readonly spacedReviewItemRepository: SpacedReviewItemRepository,
    private readonly structuredLogger: StructuredLogger,
  ) {
    this.structuredLogger.setService('reviews');
  }

  async execute(query: GetRecommendedReviewsQuery): Promise<GetRecommendedReviewsResult> {
    const { userId, tenantId, traceId } = query;
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const now = new Date();

    const { items, totalDue, overdueCount } = await this.spacedReviewItemRepository.findDueByUser({
      userId,
      tenantId,
      limit,
      now,
    });

    this.structuredLogger.log('Fetched recommended reviews', {
      trace_id: traceId,
      user_id: userId,
      tenant_id: tenantId,
      metadata: { itemCount: items.length, totalDue, overdueCount, limit },
    });

    return {
      data: items.map((item, index) => this.toDto(item, index + 1)),
      metadata: {
        total: totalDue,
        overdueCount,
      },
    };
  }

  private toDto(item: SpacedReviewItemEntity, priority: number): ReviewItemDto {
    return {
      id: item.id,
      lessonId: item.lessonId,
      lessonTitle: item.lessonTitle ?? '',
      itemContent: item.itemContent,
      itemType: item.itemType,
      dueDate: item.nextReviewAt.toISOString(),
      priority,
    };
  }
}
