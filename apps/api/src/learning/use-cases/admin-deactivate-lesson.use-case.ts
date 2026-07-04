import { Injectable, NotFoundException } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';
import { RedisService } from '../../database/redis.service';
import { Lesson } from '@linguoup/database';

export interface AdminDeactivateLessonCommand {
  id: string;
  userId: string;
  tenantId: string;
  traceId: string;
}

@Injectable()
export class AdminDeactivateLessonUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly redisService: RedisService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('admin-deactivate-lesson-use-case');
  }

  async execute(command: AdminDeactivateLessonCommand): Promise<Lesson> {
    const { id, userId, tenantId, traceId } = command;

    this.logger.log('Admin deactivating lesson', {
      lesson_id: id,
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
    });

    try {
      const lesson = await this.lessonRepository.update(id, tenantId, { isActive: false });
      
      // Invalidate Redis cache
      await this.redisService.delPattern('lessons:catalog:*');

      return lesson;
    } catch (err) {
      this.logger.error(`Failed to deactivate lesson ${id}: ${(err as Error).message}`);
      throw new NotFoundException('Lesson not found');
    }
  }
}
