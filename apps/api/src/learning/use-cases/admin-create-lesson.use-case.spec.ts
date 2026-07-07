import { Test, TestingModule } from '@nestjs/testing';
import { AdminCreateLessonUseCase } from './admin-create-lesson.use-case';
import { LessonRepository } from '../repositories/lesson.repository';
import { RedisService } from '../../database/redis.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const mockLesson = { id: 'l1', title: 'Test Lesson', isActive: true };

describe('AdminCreateLessonUseCase', () => {
  let useCase: AdminCreateLessonUseCase;
  let mockLessonRepo: Partial<LessonRepository>;
  let mockRedis: Partial<RedisService>;

  beforeEach(async () => {
    mockLessonRepo = {
      create: jest.fn().mockResolvedValue(mockLesson),
    };
    mockRedis = {
      delPattern: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCreateLessonUseCase,
        { provide: LessonRepository, useValue: mockLessonRepo },
        { provide: RedisService, useValue: mockRedis },
        {
          provide: StructuredLogger,
          useValue: { setService: jest.fn(), log: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<AdminCreateLessonUseCase>(AdminCreateLessonUseCase);
  });

  it('should create lesson and invalidate cache', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      tenantId: 'tenant-1',
      traceId: 'trace-1',
      title: 'Greetings',
      description: 'Intro lesson',
      level: 'beginner',
      theme: 'vocabulary',
      durationMinutes: 10,
    });

    expect(result).toEqual(mockLesson);
    expect(mockLessonRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Greetings', tenantId: 'tenant-1' }),
    );
    expect(mockRedis.delPattern).toHaveBeenCalledWith('lessons:catalog:*');
  });
});
