import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthDomainService } from '../domain/auth.domain-service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authDomainService: AuthDomainService;

  const mockAuthDomainService = {
    verifyAccessToken: jest.fn(),
  };

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: authHeader ? { authorization: authHeader } : {},
      user: null,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    authDomainService = mockAuthDomainService as unknown as AuthDomainService;
    guard = new JwtAuthGuard(authDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access and set user in request if token is valid', async () => {
    const context = createMockContext('Bearer valid-token');
    const payload = { sub: 'user-id', email: 'test@example.com', role: 'USER', tenant_id: 'tenant-1' };
    mockAuthDomainService.verifyAccessToken.mockResolvedValue(payload);

    const canActivate = await guard.canActivate(context);

    expect(canActivate).toBe(true);
    expect(authDomainService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual({
      id: 'user-id',
      email: 'test@example.com',
      role: 'USER',
      tenant_id: 'tenant-1',
    });
  });

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authentication token is missing'),
    );
  });

  it('should throw UnauthorizedException if header is not Bearer style', async () => {
    const context = createMockContext('Basic token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authentication token is missing'),
    );
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const context = createMockContext('Bearer invalid-token');
    mockAuthDomainService.verifyAccessToken.mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired authentication token'),
    );
  });
});
