import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { GetInitialPlanUseCase } from './get-initial-plan.use-case';
import { UserProfileRepository } from '../interfaces/user-preferences-repository.interface';
import { UserDomainService } from '../domain/user.domain-service';

describe('GetInitialPlanUseCase', () => {
  let useCase: GetInitialPlanUseCase;
  let userDomainService: UserDomainService;

  const mockUserProfileRepository = {
    findPreferencesByUserId: jest.fn(),
  };

  const mockUserDomainService = {
    calculateInitialPlan: jest.fn(),
  };

  const command = { userId: 'user-id', tenantId: 'tenant-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetInitialPlanUseCase,
        { provide: UserProfileRepository, useValue: mockUserProfileRepository },
        { provide: UserDomainService, useValue: mockUserDomainService },
      ],
    }).compile();

    useCase = module.get<GetInitialPlanUseCase>(GetInitialPlanUseCase);
    userDomainService = module.get<UserDomainService>(UserDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return plan when onboarding is complete', async () => {
    const preferences = {
      userId: 'user-id',
      dailyGoalMinutes: 15,
      targetLanguage: 'en-US',
      learningGoal: 'TRAVEL',
      preferredStudyTime: null,
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const plan = {
      dailyLessons: 2,
      weeklyGoal: 10,
      intensity: 'INTERMEDIATE',
      recommendedLevel: 'BEGINNER',
      targetLanguage: 'en-US',
      message: 'Excelente ritmo!',
    };

    mockUserProfileRepository.findPreferencesByUserId.mockResolvedValue(preferences);
    mockUserDomainService.calculateInitialPlan.mockReturnValue(plan);

    const result = await useCase.execute(command);

    expect(result).toEqual(plan);
    expect(userDomainService.calculateInitialPlan).toHaveBeenCalledWith(15, 'en-US');
  });

  it('should throw 422 when preferences are null (no onboarding)', async () => {
    mockUserProfileRepository.findPreferencesByUserId.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow(UnprocessableEntityException);
  });

  it('should throw 422 when onboardingCompleted is false', async () => {
    mockUserProfileRepository.findPreferencesByUserId.mockResolvedValue({
      userId: 'user-id',
      onboardingCompleted: false,
      dailyGoalMinutes: 10,
      targetLanguage: 'en-US',
      learningGoal: 'TRAVEL',
      preferredStudyTime: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute(command)).rejects.toThrow(UnprocessableEntityException);
  });
});
