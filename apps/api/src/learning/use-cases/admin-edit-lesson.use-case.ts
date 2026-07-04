import { Injectable, NotFoundException } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';
import { RedisService } from '../../database/redis.service';
import { Lesson } from '@linguoup/database';

export interface AdminEditLessonCommand {
  id: string;
  userId: string;
  tenantId: string;
  traceId: string;
  title?: string;
  description?: string;
  level?: string;
  theme?: string;
  durationMinutes?: number;
  content?: any;
}

@Injectable()
export class AdminEditLessonUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly redisService: RedisService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('admin-edit-lesson-use-case');
  }

  async execute(command: AdminEditLessonCommand): Promise<Lesson> {
    const { id, userId, tenantId, traceId, ...updateData } = command;

    this.logger.log('Admin editing lesson', {
      lesson_id: id,
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
    });

    try {
      const lesson = await this.lessonRepository.update(id, tenantId, updateData);
      
      // Invalidate Redis cache
      await this.redisService.delPattern('lessons:catalog:*');

      return lesson;
    } catch (err) {
      this.logger.error(`Failed to edit lesson ${id}: ${(err as Error).message}`);
      throw new NotFoundException('Lesson not found');
    }
  }
}
