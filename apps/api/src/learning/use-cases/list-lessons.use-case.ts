import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository, FindAllLessonsParams, LessonsPage } from '../repositories/lesson.repository';

export interface ListLessonsQuery extends FindAllLessonsParams {
  userId: string;
  traceId: string;
}

@Injectable()
export class ListLessonsUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('list-lessons-use-case');
  }

  async execute(query: ListLessonsQuery): Promise<LessonsPage> {
    const { userId, tenantId, traceId, level, theme, cursor, limit } = query;

    this.logger.log('Listing lessons', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { level, theme, cursor, limit },
    });

    return this.lessonRepository.findAll({ tenantId, level, theme, cursor, limit });
  }
}
