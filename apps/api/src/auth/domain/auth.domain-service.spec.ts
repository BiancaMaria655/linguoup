import { Test, TestingModule } from '@nestjs/testing';
import { AuthDomainService } from './auth.domain-service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

describe('AuthDomainService', () => {
  let service: AuthDomainService;
  let jwtService: JwtService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'JWT_SECRET') return 'jwt-secret';
      if (key === 'REFRESH_TOKEN_SECRET') return 'refresh-secret';
      if (key === 'JWT_EXPIRES_IN') return '15m';
      if (key === 'REFRESH_TOKEN_EXPIRES_IN') return '30d';
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthDomainService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthDomainService>(AuthDomainService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
      if (key === 'JWT_SECRET') return 'jwt-secret';
      if (key === 'REFRESH_TOKEN_SECRET') return 'refresh-secret';
      if (key === 'JWT_EXPIRES_IN') return '15m';
      if (key === 'REFRESH_TOKEN_EXPIRES_IN') return '30d';
      return defaultValue;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'password123';
      const hash = await service.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      const isMatch = await argon2.verify(hash, password);
      expect(isMatch).toBe(true);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const password = 'password123';
      const hash = await argon2.hash(password);
      const result = await service.comparePasswords(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'password123';
      const hash = await argon2.hash('different');
      const result = await service.comparePasswords(password, hash);
      expect(result).toBe(false);
    });

    it('should return false if verification throws error', async () => {
      const result = await service.comparePasswords('password', 'invalid-hash');
      expect(result).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      const payload = { sub: 'user-id', email: 'test@example.com', role: 'USER', tenant_id: 'tenant-1' };
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.generateAccessToken(payload);
      expect(result).toEqual({ token: 'access-token', expiresIn: 900 });
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: 'jwt-secret',
        expiresIn: '15m',
      });
    });

    it('should fallback to 900 seconds if unknown format for expiresIn', async () => {
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'JWT_SECRET') return 'jwt-secret';
        if (key === 'JWT_EXPIRES_IN') return 'invalid';
        return defaultValue;
      });
      const payload = { sub: 'user-id', email: 'test@example.com', role: 'USER', tenant_id: 'tenant-1' };
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.generateAccessToken(payload);
      expect(result).toEqual({ token: 'access-token', expiresIn: 900 });
    });

    it('should support seconds, minutes, hours, days expiration formats', async () => {
      const formats = [
        { exp: '60s', expected: 60 },
        { exp: '10m', expected: 600 },
        { exp: '2h', expected: 7200 },
        { exp: '1d', expected: 86400 },
        { exp: '900', expected: 900 },
      ];

      for (const format of formats) {
        mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
          if (key === 'JWT_SECRET') return 'jwt-secret';
          if (key === 'JWT_EXPIRES_IN') return format.exp;
          return defaultValue;
        });

        const payload = { sub: 'user-id', email: 'test@example.com', role: 'USER', tenant_id: 'tenant-1' };
        mockJwtService.signAsync.mockResolvedValue('access-token');

        const result = await service.generateAccessToken(payload);
        expect(result.expiresIn).toBe(format.expected);
      }
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token with random UUID jti', async () => {
      mockJwtService.signAsync.mockResolvedValue('refresh-token');

      const result = await service.generateRefreshToken('user-id', 'tenant-1');
      expect(result.token).toBe('refresh-token');
      expect(result.jti).toBeDefined();
      expect(typeof result.jti).toBe('string');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-id',
          tenant_id: 'tenant-1',
          jti: result.jti,
        }),
        {
          secret: 'refresh-secret',
          expiresIn: '30d',
        },
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify access token', async () => {
      const payload = { sub: 'user-id', email: 'test@example.com', role: 'USER', tenant_id: 'tenant-1' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.verifyAccessToken('access-token');
      expect(result).toBe(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', {
        secret: 'jwt-secret',
      });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify refresh token', async () => {
      const payload = { sub: 'user-id', tenant_id: 'tenant-1', jti: 'uuid' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.verifyRefreshToken('refresh-token');
      expect(result).toBe(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh-token', {
        secret: 'refresh-secret',
      });
    });
  });
});
