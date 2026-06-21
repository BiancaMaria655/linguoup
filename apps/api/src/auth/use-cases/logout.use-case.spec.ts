import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase, LogoutCommand } from './logout.use-case';
import { AuthDomainService } from '../domain/auth.domain-service';
import { RedisService } from '../../database/redis.service';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let authDomainService: AuthDomainService;
  let redisService: RedisService;

  const mockAuthDomainService = {
    verifyRefreshToken: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: AuthDomainService, useValue: mockAuthDomainService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    authDomainService = module.get<AuthDomainService>(AuthDomainService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should blacklist token and return success message', async () => {
    const command: LogoutCommand = { refreshToken: 'valid-refresh-token' };
    mockAuthDomainService.verifyRefreshToken.mockResolvedValue({ jti: 'jti-123' });

    const result = await useCase.execute(command);

    expect(result).toEqual({ message: 'Logged out successfully' });
    expect(authDomainService.verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(redisService.set).toHaveBeenCalledWith('blacklist:jti-123', 'logout', 30 * 24 * 60 * 60);
  });

  it('should return success even if no refresh token is provided', async () => {
    const result = await useCase.execute({ refreshToken: '' });

    expect(result).toEqual({ message: 'Logged out successfully' });
    expect(authDomainService.verifyRefreshToken).not.toHaveBeenCalled();
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('should return success even if verification throws error', async () => {
    mockAuthDomainService.verifyRefreshToken.mockRejectedValue(new Error('Invalid token'));

    const result = await useCase.execute({ refreshToken: 'invalid-token' });

    expect(result).toEqual({ message: 'Logged out successfully' });
    expect(authDomainService.verifyRefreshToken).toHaveBeenCalledWith('invalid-token');
    expect(redisService.set).not.toHaveBeenCalled();
  });
});
