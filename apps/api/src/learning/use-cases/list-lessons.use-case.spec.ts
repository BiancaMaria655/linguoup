import { Test, TestingModule } from '@nestjs/testing';
import { ListLessonsUseCase } from './list-lessons.use-case';
import { LessonRepository } from '../repositories/lesson.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const mockPage = {
  data: [{ id: 'l1', title: 'Test Lesson' }],
  metadata: { cursor: null, total: 1 },
};

describe('ListLessonsUseCase', () => {
  let useCase: ListLessonsUseCase;
  let mockLessonRepo: Partial<LessonRepository>;

  beforeEach(async () => {
    mockLessonRepo = {
      findAll: jest.fn().mockResolvedValue(mockPage),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListLessonsUseCase,
        { provide: LessonRepository, useValue: mockLessonRepo },
        {
          provide: StructuredLogger,
          useValue: { setService: jest.fn(), log: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<ListLessonsUseCase>(ListLessonsUseCase);
  });

  const baseQuery = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    traceId: 'trace-1',
  };

  it('should return lessons page from repository', async () => {
    const result = await useCase.execute(baseQuery);
    expect(result).toEqual(mockPage);
    expect(mockLessonRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-1' }),
    );
  });

  it('should pass level and theme filters to repository', async () => {
    await useCase.execute({ ...baseQuery, level: 'A1', theme: 'greetings' });
    expect(mockLessonRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'A1', theme: 'greetings' }),
    );
  });

  it('should call repository once per query (cache is inside repository, not use-case)', async () => {
    await useCase.execute(baseQuery);
    await useCase.execute(baseQuery);
    // Use-case always delegates to repository; cache hit/miss is tested at the repository level
    expect(mockLessonRepo.findAll).toHaveBeenCalledTimes(2);
  });

  it('should simulate cache hit: repository returns cached data immediately', async () => {
    // Simulate cache hit: repository is fast and returns data from cache
    (mockLessonRepo.findAll as jest.Mock).mockResolvedValueOnce(mockPage);
    const result = await useCase.execute(baseQuery);
    expect(result.data).toHaveLength(1);
  });

  it('should simulate cache miss: repository falls through to DB', async () => {
    const dbPage = { data: [{ id: 'l2', title: 'From DB' }], metadata: { cursor: null, total: 1 } };
    (mockLessonRepo.findAll as jest.Mock).mockResolvedValueOnce(dbPage);
    const result = await useCase.execute(baseQuery);
    expect(result.data[0]).toMatchObject({ id: 'l2' });
  });
});
