import { Test, TestingModule } from '@nestjs/testing';
import { AdminDeactivateLessonUseCase } from './admin-deactivate-lesson.use-case';
import { LessonRepository } from '../repositories/lesson.repository';
import { RedisService } from '../../database/redis.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const mockLesson = { id: 'l1', title: 'Test Lesson', isActive: false };

describe('AdminDeactivateLessonUseCase', () => {
  let useCase: AdminDeactivateLessonUseCase;
  let mockLessonRepo: Partial<LessonRepository>;
  let mockRedis: Partial<RedisService>;

  beforeEach(async () => {
    mockLessonRepo = {
      update: jest.fn().mockResolvedValue(mockLesson),
    };
    mockRedis = {
      delPattern: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDeactivateLessonUseCase,
        { provide: LessonRepository, useValue: mockLessonRepo },
        { provide: RedisService, useValue: mockRedis },
        {
          provide: StructuredLogger,
          useValue: { setService: jest.fn(), log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<AdminDeactivateLessonUseCase>(AdminDeactivateLessonUseCase);
  });

  it('should deactivate lesson and invalidate cache', async () => {
    const result = await useCase.execute({
      id: 'l1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      traceId: 'trace-1',
    });

    expect(result).toEqual(mockLesson);
    expect(mockLessonRepo.update).toHaveBeenCalledWith(
      'l1',
      'tenant-1',
      { isActive: false },
    );
    expect(mockRedis.delPattern).toHaveBeenCalledWith('lessons:catalog:*');
  });
});
