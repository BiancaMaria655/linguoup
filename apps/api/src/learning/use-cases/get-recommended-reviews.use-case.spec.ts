import { Test, TestingModule } from '@nestjs/testing';
import { GetRecommendedReviewsUseCase } from './get-recommended-reviews.use-case';
import { SpacedReviewItemRepository } from '../repositories/spaced-review-item.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { SpacedReviewItemEntity } from '../repositories/spaced-review-item.entity';

const mockStructuredLogger = {
  setService: jest.fn(),
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

const makeItem = (overrides: Partial<SpacedReviewItemEntity> = {}): SpacedReviewItemEntity => ({
  id: 'item-1',
  tenantId: 'tenant-1',
  userId: 'user-1',
  lessonId: 'lesson-1',
  lessonTitle: 'Test Lesson',
  itemContent: 'Hello',
  itemType: 'vocabulary',
  nextReviewAt: new Date('2026-01-01T00:00:00Z'),
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  quality: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('GetRecommendedReviewsUseCase', () => {
  let useCase: GetRecommendedReviewsUseCase;
  let mockRepository: Partial<SpacedReviewItemRepository>;

  const baseQuery = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    traceId: 'trace-1',
  };

  beforeEach(async () => {
    mockRepository = {
      findDueByUser: jest.fn().mockResolvedValue({
        items: [],
        totalDue: 0,
        overdueCount: 0,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRecommendedReviewsUseCase,
        { provide: SpacedReviewItemRepository, useValue: mockRepository },
        { provide: StructuredLogger, useValue: mockStructuredLogger },
      ],
    }).compile();

    useCase = module.get<GetRecommendedReviewsUseCase>(GetRecommendedReviewsUseCase);
  });

  describe('empty list', () => {
    it('should return empty data and zero metadata when no items are due', async () => {
      const result = await useCase.execute(baseQuery);

      expect(result.data).toEqual([]);
      expect(result.metadata.total).toBe(0);
      expect(result.metadata.overdueCount).toBe(0);
    });
  });

  describe('filtering by date', () => {
    it('should pass current datetime to repository for filtering', async () => {
      const beforeCall = Date.now();
      await useCase.execute(baseQuery);
      const afterCall = Date.now();

      const calledWith = (mockRepository.findDueByUser as jest.Mock).mock.calls[0][0];
      expect(calledWith.now.getTime()).toBeGreaterThanOrEqual(beforeCall);
      expect(calledWith.now.getTime()).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('ordering', () => {
    it('should assign priority in ascending order (1, 2, 3…)', async () => {
      const items = [makeItem({ id: 'a' }), makeItem({ id: 'b' }), makeItem({ id: 'c' })];
      (mockRepository.findDueByUser as jest.Mock).mockResolvedValue({
        items,
        totalDue: 3,
        overdueCount: 3,
      });

      const result = await useCase.execute(baseQuery);

      expect(result.data[0].priority).toBe(1);
      expect(result.data[1].priority).toBe(2);
      expect(result.data[2].priority).toBe(3);
    });
  });

  describe('limit', () => {
    it('should default limit to 20 when not provided', async () => {
      await useCase.execute(baseQuery);
      expect(mockRepository.findDueByUser).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 }),
      );
    });

    it('should cap limit at 100', async () => {
      await useCase.execute({ ...baseQuery, limit: 999 });
      expect(mockRepository.findDueByUser).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 }),
      );
    });

    it('should use provided limit when within bounds', async () => {
      await useCase.execute({ ...baseQuery, limit: 5 });
      expect(mockRepository.findDueByUser).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5 }),
      );
    });
  });

  describe('overdueCount', () => {
    it('should report overdueCount from repository result', async () => {
      (mockRepository.findDueByUser as jest.Mock).mockResolvedValue({
        items: [makeItem()],
        totalDue: 12,
        overdueCount: 5,
      });

      const result = await useCase.execute({ ...baseQuery, limit: 1 });

      expect(result.metadata.total).toBe(12);
      expect(result.metadata.overdueCount).toBe(5);
    });
  });

  describe('tenant isolation', () => {
    it('should pass tenantId to repository for isolation', async () => {
      await useCase.execute({ ...baseQuery, tenantId: 'tenant-A' });
      expect(mockRepository.findDueByUser).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'tenant-A' }),
      );
    });
  });

  describe('DTO mapping', () => {
    it('should map item fields to ReviewItemDto correctly', async () => {
      const item = makeItem({
        id: 'item-uuid',
        lessonId: 'lesson-uuid',
        lessonTitle: 'Greetings',
        itemContent: 'Hello',
        itemType: 'vocabulary',
        nextReviewAt: new Date('2026-01-01T00:00:00Z'),
      });
      (mockRepository.findDueByUser as jest.Mock).mockResolvedValue({
        items: [item],
        totalDue: 1,
        overdueCount: 1,
      });

      const result = await useCase.execute(baseQuery);

      expect(result.data[0]).toMatchObject({
        id: 'item-uuid',
        lessonId: 'lesson-uuid',
        lessonTitle: 'Greetings',
        itemContent: 'Hello',
        itemType: 'vocabulary',
        dueDate: '2026-01-01T00:00:00.000Z',
        priority: 1,
      });
    });
  });
});
