import { Injectable, NotFoundException } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository, TrailWithLessons } from '../repositories/lesson.repository';

export interface GetTrailQuery {
  trailId: string;
  userId: string;
  tenantId: string;
  traceId: string;
}

@Injectable()
export class GetTrailUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('get-trail-use-case');
  }

  async execute(query: GetTrailQuery): Promise<TrailWithLessons> {
    const { trailId, userId, tenantId, traceId } = query;

    this.logger.log('Getting trail detail', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { trailId },
    });

    const trail = await this.lessonRepository.findTrailWithLessons(trailId, tenantId, userId);

    if (!trail) {
      throw new NotFoundException('Trilha não encontrada');
    }

    return trail;
  }
}
