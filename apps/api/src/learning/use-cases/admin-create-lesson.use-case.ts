import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';
import { RedisService } from '../../database/redis.service';
import { Lesson } from '@linguoup/database';

export interface AdminCreateLessonCommand {
  userId: string;
  tenantId: string;
  traceId: string;
  title: string;
  description: string;
  level: string;
  theme: string;
  durationMinutes: number;
  content?: any;
}

@Injectable()
export class AdminCreateLessonUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly redisService: RedisService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('admin-create-lesson-use-case');
  }

  async execute(command: AdminCreateLessonCommand): Promise<Lesson> {
    const { userId, tenantId, traceId, title, description, level, theme, durationMinutes, content } = command;

    this.logger.log('Admin creating lesson', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { title, level, theme, durationMinutes },
    });

    const lesson = await this.lessonRepository.create({
      tenantId,
      title,
      description,
      level,
      theme,
      durationMinutes,
      content,
    });

    // Invalidate Redis cache
    await this.redisService.delPattern('lessons:catalog:*');

    return lesson;
  }
}
