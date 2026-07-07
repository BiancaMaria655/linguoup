import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';
import { Lesson } from '@linguoup/database';

export interface AdminListLessonsQuery {
  userId: string;
  tenantId: string;
  traceId: string;
  level?: string;
}

@Injectable()
export class AdminListLessonsUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('admin-list-lessons-use-case');
  }

  async execute(query: AdminListLessonsQuery): Promise<Lesson[]> {
    const { userId, tenantId, traceId, level } = query;

    this.logger.log('Admin listing lessons', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { level },
    });

    return this.lessonRepository.findAllAdmin(tenantId, level);
  }
}
