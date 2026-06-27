import { Test, TestingModule } from '@nestjs/testing';
import { SaveOnboardingUseCase } from './save-onboarding.use-case';
import { UserProfileRepository } from '../interfaces/user-preferences-repository.interface';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

describe('SaveOnboardingUseCase', () => {
  let useCase: SaveOnboardingUseCase;
  let userProfileRepository: UserProfileRepository;

  const mockUserProfileRepository = {
    upsertPreferences: jest.fn(),
  };

  const mockLogger = {
    setService: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const baseCommand = {
    userId: 'user-id',
    tenantId: 'tenant-1',
    traceId: 'trace-id',
    learningGoal: 'TRAVEL',
    targetLanguage: 'en-US',
    dailyGoalMinutes: 15,
    preferredStudyTime: 'MORNING' as const,
  };

  const mockPreferences = {
    userId: 'user-id',
    learningGoal: 'TRAVEL',
    targetLanguage: 'en-US',
    dailyGoalMinutes: 15,
    preferredStudyTime: 'MORNING',
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveOnboardingUseCase,
        { provide: UserProfileRepository, useValue: mockUserProfileRepository },
        { provide: StructuredLogger, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<SaveOnboardingUseCase>(SaveOnboardingUseCase);
    userProfileRepository = module.get<UserProfileRepository>(UserProfileRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should save onboarding preferences and return onboardingCompleted: true (first time)', async () => {
    mockUserProfileRepository.upsertPreferences.mockResolvedValue(mockPreferences);

    const result = await useCase.execute(baseCommand);

    expect(result).toEqual({ onboardingCompleted: true });
    expect(userProfileRepository.upsertPreferences).toHaveBeenCalledWith(
      'user-id',
      {
        learningGoal: 'TRAVEL',
        targetLanguage: 'en-US',
        dailyGoalMinutes: 15,
        preferredStudyTime: 'MORNING',
        onboardingCompleted: true,
      },
    );
  });

  it('should be idempotent — second call with different data should still succeed', async () => {
    const updatedPreferences = { ...mockPreferences, dailyGoalMinutes: 30 };
    mockUserProfileRepository.upsertPreferences.mockResolvedValue(updatedPreferences);

    const result = await useCase.execute({ ...baseCommand, dailyGoalMinutes: 30 });

    expect(result).toEqual({ onboardingCompleted: true });
    expect(userProfileRepository.upsertPreferences).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({ dailyGoalMinutes: 30, onboardingCompleted: true }),
    );
  });

  it('should emit structured log with user_id, tenant_id, trace_id', async () => {
    mockUserProfileRepository.upsertPreferences.mockResolvedValue(mockPreferences);

    await useCase.execute(baseCommand);

    expect(mockLogger.log).toHaveBeenCalledWith(
      'Onboarding saved successfully',
      {
        user_id: 'user-id',
        tenant_id: 'tenant-1',
        trace_id: 'trace-id',
      },
    );
  });

  it('should pass null for preferredStudyTime when not provided', async () => {
    mockUserProfileRepository.upsertPreferences.mockResolvedValue(mockPreferences);
    const commandWithoutStudyTime = { ...baseCommand, preferredStudyTime: undefined };

    await useCase.execute(commandWithoutStudyTime);

    expect(userProfileRepository.upsertPreferences).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({ preferredStudyTime: null }),
    );
  });
});
