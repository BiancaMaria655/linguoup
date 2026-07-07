import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';

export interface GetAdminMetricsQuery {
  userId: string;
  tenantId: string;
  traceId: string;
}

@Injectable()
export class GetAdminMetricsUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('get-admin-metrics-use-case');
  }

  async execute(query: GetAdminMetricsQuery) {
    const { userId, tenantId, traceId } = query;

    this.logger.log('Fetching admin metrics', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
    });

    return this.lessonRepository.getMetrics(tenantId);
  }
}
