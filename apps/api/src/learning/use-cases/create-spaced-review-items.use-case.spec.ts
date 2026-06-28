import { Test, TestingModule } from '@nestjs/testing';
import { CreateSpacedReviewItemsUseCase } from './create-spaced-review-items.use-case';
import { SpacedReviewItemRepository } from '../repositories/spaced-review-item.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

describe('CreateSpacedReviewItemsUseCase', () => {
  let useCase: CreateSpacedReviewItemsUseCase;
  let mockRepository: Partial<SpacedReviewItemRepository>;

  const fakeTx = {} as any;

  const baseCommand = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    lessonId: 'lesson-1',
    traceId: 'trace-1',
    items: [
      { content: 'Hello', type: 'vocabulary' as const },
      { content: 'Present tense', type: 'grammar' as const },
    ],
  };

  beforeEach(async () => {
    mockRepository = {
      createMany: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSpacedReviewItemsUseCase,
        { provide: SpacedReviewItemRepository, useValue: mockRepository },
        { provide: StructuredLogger, useValue: { setService: jest.fn(), log: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<CreateSpacedReviewItemsUseCase>(CreateSpacedReviewItemsUseCase);
  });

  describe('item creation', () => {
    it('should call createMany with all provided items', async () => {
      await useCase.execute(fakeTx, baseCommand);

      expect(mockRepository.createMany).toHaveBeenCalledTimes(1);
      const callArg = (mockRepository.createMany as jest.Mock).mock.calls[0][1];
      expect(callArg).toHaveLength(2);
    });

    it('should create items with correct SM-2 initial state', async () => {
      await useCase.execute(fakeTx, baseCommand);

      const items = (mockRepository.createMany as jest.Mock).mock.calls[0][1];
      for (const item of items) {
        expect(item.easeFactor).toBe(2.5);
        expect(item.interval).toBe(1);
        expect(item.repetitions).toBe(0);
        expect(item.quality).toBeNull();
      }
    });

    it('should set nextReviewAt to tomorrow (1 day from now)', async () => {
      const before = new Date();
      await useCase.execute(fakeTx, baseCommand);

      const items = (mockRepository.createMany as jest.Mock).mock.calls[0][1];
      const tomorrow = new Date(before);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      for (const item of items) {
        // Should be UTC midnight the next day
        expect(item.nextReviewAt.getUTCHours()).toBe(0);
        expect(item.nextReviewAt.getTime()).toBeGreaterThanOrEqual(tomorrow.getTime() - 1000);
      }
    });

    it('should pass tenantId, userId, lessonId to each item', async () => {
      await useCase.execute(fakeTx, baseCommand);

      const items = (mockRepository.createMany as jest.Mock).mock.calls[0][1];
      for (const item of items) {
        expect(item.tenantId).toBe('tenant-1');
        expect(item.userId).toBe('user-1');
        expect(item.lessonId).toBe('lesson-1');
      }
    });
  });

  describe('upsert (no duplicates)', () => {
    it('should pass the transaction to createMany (upsert handled in repository)', async () => {
      await useCase.execute(fakeTx, baseCommand);

      expect(mockRepository.createMany).toHaveBeenCalledWith(fakeTx, expect.any(Array));
    });
  });

  describe('empty items list', () => {
    it('should not call createMany when items list is empty', async () => {
      await useCase.execute(fakeTx, { ...baseCommand, items: [] });

      expect(mockRepository.createMany).not.toHaveBeenCalled();
    });
  });
});
