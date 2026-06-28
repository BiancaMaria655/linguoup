import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { UserProfileRepository } from '../interfaces/user-preferences-repository.interface';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;

  const mockUserProfileRepository = {
    findByIdWithPreferences: jest.fn(),
  };

  const command = { userId: 'user-id', tenantId: 'tenant-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        { provide: UserProfileRepository, useValue: mockUserProfileRepository },
      ],
    }).compile();

    useCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return profile with preferences when user has completed onboarding', async () => {
    const userWithPrefs = {
      id: 'user-id',
      name: 'Maria Silva',
      email: 'maria@example.com',
      role: 'USER',
      tenant_id: 'tenant-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      passwordHash: 'hash',
      preferences: {
        userId: 'user-id',
        learningGoal: 'TRAVEL',
        targetLanguage: 'en-US',
        dailyGoalMinutes: 15,
        preferredStudyTime: 'MORNING',
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    mockUserProfileRepository.findByIdWithPreferences.mockResolvedValue(userWithPrefs);

    const result = await useCase.execute(command);

    expect(result.id).toBe('user-id');
    expect(result.name).toBe('Maria Silva');
    expect(result.email).toBe('maria@example.com');
    expect(result.preferences).not.toBeNull();
    expect(result.preferences?.onboardingCompleted).toBe(true);
    expect(result.preferences?.targetLanguage).toBe('en-US');
  });

  it('should return profile with null preferences when user has not done onboarding', async () => {
    const userWithoutPrefs = {
      id: 'user-id',
      name: 'João',
      email: 'joao@example.com',
      role: 'USER',
      tenant_id: 'tenant-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      passwordHash: 'hash',
      preferences: null,
    };
    mockUserProfileRepository.findByIdWithPreferences.mockResolvedValue(userWithoutPrefs);

    const result = await useCase.execute(command);

    expect(result.preferences).toBeNull();
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockUserProfileRepository.findByIdWithPreferences.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundException);
  });
});
