import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository, TrailSummary } from '../repositories/lesson.repository';

export interface ListTrailsQuery {
  userId: string;
  tenantId: string;
  traceId: string;
  level?: string;
}

@Injectable()
export class ListTrailsUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('list-trails-use-case');
  }

  async execute(query: ListTrailsQuery): Promise<TrailSummary[]> {
    const { userId, tenantId, traceId, level } = query;

    this.logger.log('Listing trails', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { level },
    });

    return this.lessonRepository.findAllTrails(tenantId, userId, level);
  }
}
