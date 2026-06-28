import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileUseCase } from './update-profile.use-case';
import { UserProfileRepository } from '../interfaces/user-preferences-repository.interface';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let userProfileRepository: UserProfileRepository;

  const mockUserProfileRepository = {
    findById: jest.fn(),
    updateProfile: jest.fn(),
  };

  const command = { userId: 'user-id', tenantId: 'tenant-1', name: 'Maria Silva' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        { provide: UserProfileRepository, useValue: mockUserProfileRepository },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    userProfileRepository = module.get<UserProfileRepository>(UserProfileRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update user name and return updated profile', async () => {
    const existingUser = {
      id: 'user-id',
      name: 'Old Name',
      email: 'maria@example.com',
      role: 'USER',
      tenant_id: 'tenant-1',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedUser = {
      ...existingUser,
      name: 'Maria Silva',
      updatedAt: new Date('2024-06-26'),
    };

    mockUserProfileRepository.findById.mockResolvedValue(existingUser);
    mockUserProfileRepository.updateProfile.mockResolvedValue(updatedUser);

    const result = await useCase.execute(command);

    expect(result.name).toBe('Maria Silva');
    expect(result.email).toBe('maria@example.com');
    expect(result.updatedAt).toEqual(new Date('2024-06-26'));
    expect(userProfileRepository.updateProfile).toHaveBeenCalledWith('user-id', { name: 'Maria Silva' });
  });

  it('should throw NotFoundException if user does not exist', async () => {
    mockUserProfileRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundException);
    expect(userProfileRepository.updateProfile).not.toHaveBeenCalled();
  });

  it('should update profile without changes when no name provided', async () => {
    const existingUser = {
      id: 'user-id',
      name: 'Old Name',
      email: 'maria@example.com',
      role: 'USER',
      tenant_id: 'tenant-1',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date('2024-06-26'),
    };
    mockUserProfileRepository.findById.mockResolvedValue(existingUser);
    mockUserProfileRepository.updateProfile.mockResolvedValue(existingUser);

    const result = await useCase.execute({ userId: 'user-id', tenantId: 'tenant-1' });

    expect(result.name).toBe('Old Name');
  });
});
