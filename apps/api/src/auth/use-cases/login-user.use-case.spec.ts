import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserUseCase, LoginUserCommand } from './login-user.use-case';
import { UserRepository } from '../interfaces/user-repository.interface';
import { AuthDomainService } from '../domain/auth.domain-service';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@linguoup/database';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: UserRepository;
  let authDomainService: AuthDomainService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
  };

  const mockAuthDomainService = {
    comparePasswords: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: AuthDomainService, useValue: mockAuthDomainService },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    authDomainService = module.get<AuthDomainService>(AuthDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should authenticate user and return tokens successfully', async () => {
    const command: LoginUserCommand = {
      email: 'user@example.com',
      password: 'StrongPassword123!',
    };

    const mockUser = {
      id: 'user-uuid',
      email: 'user@example.com',
      name: 'John Doe',
      passwordHash: 'hashed-password',
      role: Role.USER,
      tenant_id: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockAuthDomainService.comparePasswords.mockResolvedValue(true);
    mockAuthDomainService.generateAccessToken.mockResolvedValue({ token: 'access-token', expiresIn: 900 });
    mockAuthDomainService.generateRefreshToken.mockResolvedValue({ token: 'refresh-token', jti: 'jti-uuid' });

    const result = await useCase.execute(command);

    expect(result).toEqual({
      accessToken: 'access-token',
      expiresIn: 900,
      refreshToken: 'refresh-token',
    });
    expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(authDomainService.comparePasswords).toHaveBeenCalledWith(command.password, mockUser.passwordHash);
    expect(authDomainService.generateAccessToken).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      tenant_id: mockUser.tenant_id,
    });
    expect(authDomainService.generateRefreshToken).toHaveBeenCalledWith(mockUser.id, mockUser.tenant_id);
  });

  it('should throw UnauthorizedException if email is missing', async () => {
    await expect(useCase.execute({ password: 'password' } as LoginUserCommand)).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
  });

  it('should throw UnauthorizedException if password is missing', async () => {
    await expect(useCase.execute({ email: 'user@example.com' } as LoginUserCommand)).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'nonexistent@example.com', password: 'password' })).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
  });

  it('should throw UnauthorizedException if password comparison fails', async () => {
    const mockUser = {
      id: 'user-uuid',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
    };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockAuthDomainService.comparePasswords.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'user@example.com', password: 'wrongpassword' })).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
    expect(authDomainService.comparePasswords).toHaveBeenCalledWith('wrongpassword', mockUser.passwordHash);
  });
});
