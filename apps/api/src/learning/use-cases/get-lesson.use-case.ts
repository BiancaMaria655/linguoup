import { Injectable, NotFoundException } from '@nestjs/common';
import { Lesson } from '@linguoup/database';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';

export interface GetLessonQuery {
  lessonId: string;
  tenantId: string;
  userId: string;
  traceId: string;
}

@Injectable()
export class GetLessonUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('get-lesson-use-case');
  }

  async execute(query: GetLessonQuery): Promise<Lesson> {
    const { lessonId, tenantId, userId, traceId } = query;

    this.logger.log('Getting lesson detail', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { lessonId },
    });

    const lesson = await this.lessonRepository.findById(lessonId, tenantId);

    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    return lesson;
  }
}
