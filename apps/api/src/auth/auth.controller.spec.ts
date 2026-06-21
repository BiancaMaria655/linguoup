import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from './use-cases/register-user.use-case';
import { LoginUserUseCase } from './use-cases/login-user.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { Request, Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { StructuredLogger } from '../common/logger/structured-logger.service';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: RegisterUserUseCase;
  let loginUserUseCase: LoginUserUseCase;
  let refreshTokenUseCase: RefreshTokenUseCase;
  let logoutUseCase: LogoutUseCase;

  const mockRegisterUserUseCase = { execute: jest.fn() };
  const mockLoginUserUseCase = { execute: jest.fn() };
  const mockRefreshTokenUseCase = { execute: jest.fn() };
  const mockLogoutUseCase = { execute: jest.fn() };
  const mockLogger = {
    setService: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUserUseCase, useValue: mockRegisterUserUseCase },
        { provide: LoginUserUseCase, useValue: mockLoginUserUseCase },
        { provide: RefreshTokenUseCase, useValue: mockRefreshTokenUseCase },
        { provide: LogoutUseCase, useValue: mockLogoutUseCase },
        { provide: StructuredLogger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUserUseCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    loginUserUseCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return the profile', async () => {
      const dto = { email: 'test@example.com', name: 'John Doe', password: 'password123', tenant_id: 'tenant-1' };
      const createdUser = { id: 'user-uuid', email: 'test@example.com', name: 'John Doe' };
      mockRegisterUserUseCase.execute.mockResolvedValue(createdUser);

      const result = await controller.register(dto);
      expect(result).toEqual({
        data: {
          userId: 'user-uuid',
          email: 'test@example.com',
          name: 'John Doe',
        },
        metadata: {},
      });
      expect(registerUserUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should authenticate user and set refresh token cookie', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const loginResponse = { accessToken: 'access-token', expiresIn: 900, refreshToken: 'refresh-token' };
      mockLoginUserUseCase.execute.mockResolvedValue(loginResponse);

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(dto, mockResponse);

      expect(result).toEqual({
        data: {
          accessToken: 'access-token',
          expiresIn: 900,
        },
        metadata: {},
      });
      expect(loginUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.objectContaining({
        httpOnly: true,
        path: '/api/v1/auth',
      }));
    });
  });

  describe('refresh', () => {
    it('should refresh access token using cookie value', async () => {
      const mockRequest = {
        cookies: { refreshToken: 'valid-refresh-token' },
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const refreshResponse = { accessToken: 'new-access-token', expiresIn: 900, refreshToken: 'new-refresh-token' };
      mockRefreshTokenUseCase.execute.mockResolvedValue(refreshResponse);

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(result).toEqual({
        data: {
          accessToken: 'new-access-token',
          expiresIn: 900,
        },
        metadata: {},
      });
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'valid-refresh-token' });
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token', expect.objectContaining({
        httpOnly: true,
        path: '/api/v1/auth',
      }));
    });

    it('should throw UnauthorizedException if cookie is missing', async () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockResponse = {} as unknown as Response;

      await expect(controller.refresh(mockRequest, mockResponse)).rejects.toThrow(
        new UnauthorizedException('Refresh token is required'),
      );
    });
  });

  describe('logout', () => {
    it('should execute logout usecase and clear cookie', async () => {
      const mockRequest = {
        cookies: { refreshToken: 'valid-refresh-token' },
      } as unknown as Request;

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockRequest, mockResponse);

      expect(result).toEqual({
        data: {
          message: 'Logged out successfully',
        },
        metadata: {},
      });
      expect(logoutUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'valid-refresh-token' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', expect.objectContaining({
        httpOnly: true,
        path: '/api/v1/auth',
      }));
    });
  });
});
