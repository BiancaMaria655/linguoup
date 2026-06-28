import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateGoalsUseCase } from './update-goals.use-case';
import { PrismaService } from '../../database/prisma.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const mockLogger = { setService: jest.fn(), log: jest.fn(), error: jest.fn() };

const existingPrefs = {
  userId: 'user-1',
  targetLanguage: 'en',
  learningGoal: 'travel',
  dailyGoalMinutes: 15,
  dailyGoalLessons: 1,
  preferredStudyTime: null,
  onboardingCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date('2025-01-24T18:30:00Z'),
};

describe('UpdateGoalsUseCase', () => {
  let useCase: UpdateGoalsUseCase;
  let mockPrisma: any;

  const baseCommand = { userId: 'user-1', tenantId: 'tenant-1', traceId: 'trace-1' };

  beforeEach(async () => {
    mockPrisma = {
      userPreferences: {
        findUnique: jest.fn().mockResolvedValue(existingPrefs),
        update: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ ...existingPrefs, ...data, updatedAt: new Date('2025-01-24T18:30:00Z') }),
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGoalsUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StructuredLogger, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<UpdateGoalsUseCase>(UpdateGoalsUseCase);
  });

  describe('partial PATCH', () => {
    it('should update only dailyGoalMinutes when only that field is provided', async () => {
      const result = await useCase.execute({ ...baseCommand, dailyGoalMinutes: 30 });

      expect(mockPrisma.userPreferences.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { dailyGoalMinutes: 30 } }),
      );
      expect(result.dailyGoalMinutes).toBe(30);
      expect(result.dailyGoalLessons).toBe(1); // unchanged from existingPrefs
    });

    it('should update only dailyGoalLessons when only that field is provided', async () => {
      const result = await useCase.execute({ ...baseCommand, dailyGoalLessons: 3 });

      expect(mockPrisma.userPreferences.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { dailyGoalLessons: 3 } }),
      );
      expect(result.dailyGoalLessons).toBe(3);
      expect(result.dailyGoalMinutes).toBe(15); // unchanged
    });

    it('should update both fields when both are provided', async () => {
      const result = await useCase.execute({
        ...baseCommand,
        dailyGoalMinutes: 20,
        dailyGoalLessons: 2,
      });

      expect(mockPrisma.userPreferences.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { dailyGoalMinutes: 20, dailyGoalLessons: 2 },
        }),
      );
      expect(result.dailyGoalMinutes).toBe(20);
      expect(result.dailyGoalLessons).toBe(2);
    });

    it('should return updatedAt as ISO string', async () => {
      const result = await useCase.execute({ ...baseCommand, dailyGoalMinutes: 20 });
      expect(result.updatedAt).toBe('2025-01-24T18:30:00.000Z');
    });
  });

  describe('empty body rejection', () => {
    it('should throw BadRequestException when neither field is provided', async () => {
      await expect(
        useCase.execute({ ...baseCommand }), // no dailyGoalMinutes, no dailyGoalLessons
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UserPreferences not found', () => {
    it('should throw NotFoundException when UserPreferences does not exist', async () => {
      mockPrisma.userPreferences.findUnique.mockResolvedValue(null);

      await expect(
        useCase.execute({ ...baseCommand, dailyGoalMinutes: 20 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
