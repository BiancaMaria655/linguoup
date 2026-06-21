import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase, RefreshTokenCommand } from './refresh-token.use-case';
import { UserRepository } from '../interfaces/user-repository.interface';
import { AuthDomainService } from '../domain/auth.domain-service';
import { RedisService } from '../../database/redis.service';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@linguoup/database';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepository: UserRepository;
  let authDomainService: AuthDomainService;
  let redisService: RedisService;

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockAuthDomainService = {
    verifyRefreshToken: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const mockRedisService = {
    exists: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: AuthDomainService, useValue: mockAuthDomainService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    authDomainService = module.get<AuthDomainService>(AuthDomainService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should refresh tokens successfully in normal rotation flow', async () => {
    const command: RefreshTokenCommand = { refreshToken: 'valid-refresh-token' };
    const payload = { sub: 'user-id', tenant_id: 'tenant-1', jti: 'jti-1' };
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      role: Role.USER,
      tenant_id: 'tenant-1',
    };

    mockAuthDomainService.verifyRefreshToken.mockResolvedValue(payload);
    mockRedisService.exists.mockResolvedValue(false); // not compromised
    mockRedisService.get.mockResolvedValue(null); // not blacklisted
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockAuthDomainService.generateAccessToken.mockResolvedValue({ token: 'new-access-token', expiresIn: 900 });
    mockAuthDomainService.generateRefreshToken.mockResolvedValue({ token: 'new-refresh-token', jti: 'jti-2' });

    const result = await useCase.execute(command);

    expect(result).toEqual({
      accessToken: 'new-access-token',
      expiresIn: 900,
      refreshToken: 'new-refresh-token',
    });
    expect(authDomainService.verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(redisService.exists).toHaveBeenCalledWith('compromised:user:user-id');
    expect(redisService.get).toHaveBeenCalledWith('blacklist:jti-1');
    expect(userRepository.findById).toHaveBeenCalledWith('user-id');
    expect(redisService.set).toHaveBeenCalledWith('blacklist:jti-1', 'rotated', 30 * 24 * 60 * 60);
    expect(authDomainService.generateAccessToken).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      tenant_id: mockUser.tenant_id,
    });
    expect(authDomainService.generateRefreshToken).toHaveBeenCalledWith(mockUser.id, mockUser.tenant_id);
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    await expect(useCase.execute({ refreshToken: '' })).rejects.toThrow(
      new UnauthorizedException('Refresh token is required'),
    );
  });

  it('should throw UnauthorizedException if verification throws error', async () => {
    mockAuthDomainService.verifyRefreshToken.mockRejectedValue(new Error('Invalid signature'));

    await expect(useCase.execute({ refreshToken: 'invalid-token' })).rejects.toThrow(
      new UnauthorizedException('Invalid refresh token'),
    );
  });

  it('should throw UnauthorizedException if user is flagged as compromised', async () => {
    const payload = { sub: 'user-id', tenant_id: 'tenant-1', jti: 'jti-1' };
    mockAuthDomainService.verifyRefreshToken.mockResolvedValue(payload);
    mockRedisService.exists.mockResolvedValue(true); // compromised!

    await expect(useCase.execute({ refreshToken: 'token' })).rejects.toThrow(
      new UnauthorizedException('Session has been invalidated due to security reasons'),
    );
    expect(redisService.exists).toHaveBeenCalledWith('compromised:user:user-id');
  });

  it('should throw UnauthorizedException and flag user as compromised if token is blacklisted as rotated (reuse detection)', async () => {
    const payload = { sub: 'compromised-user-id', tenant_id: 'tenant-1', jti: 'jti-reused' };
    mockAuthDomainService.verifyRefreshToken.mockResolvedValue(payload);
    mockRedisService.exists.mockResolvedValue(false);
    mockRedisService.get.mockResolvedValue('rotated'); // blacklisted as rotated!

    await expect(useCase.execute({ refreshToken: 'token' })).rejects.toThrow(
      new UnauthorizedException('Session has expired or token has been reused'),
    );
    expect(redisService.set).toHaveBeenCalledWith('compromised:user:compromised-user-id', 'true', 30 * 24 * 60 * 60);
  });

  it('should throw UnauthorizedException if token is blacklisted as logout', async () => {
    const payload = { sub: 'user-id', tenant_id: 'tenant-1', jti: 'jti-logout' };
    mockAuthDomainService.verifyRefreshToken.mockResolvedValue(payload);
    mockRedisService.exists.mockResolvedValue(false);
    mockRedisService.get.mockResolvedValue('logout'); // blacklisted as logout!

    await expect(useCase.execute({ refreshToken: 'token' })).rejects.toThrow(
      new UnauthorizedException('Session has expired or token has been reused'),
    );
    expect(redisService.set).not.toHaveBeenCalledWith(expect.stringContaining('compromised:user:'), expect.any(String), expect.any(Number));
  });

  it('should throw UnauthorizedException if user is not found in database', async () => {
    const payload = { sub: 'nonexistent-user', tenant_id: 'tenant-1', jti: 'jti-1' };
    mockAuthDomainService.verifyRefreshToken.mockResolvedValue(payload);
    mockRedisService.exists.mockResolvedValue(false);
    mockRedisService.get.mockResolvedValue(null);
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'token' })).rejects.toThrow(
      new UnauthorizedException('User not found'),
    );
  });
});
