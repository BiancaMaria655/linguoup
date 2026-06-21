import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '@linguoup/database';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (userRole?: Role): ExecutionContext => {
    const request = {
      user: userRole ? { role: userRole } : null,
    };
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = mockReflector as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    const context = createMockContext();
    mockReflector.getAllAndOverride.mockReturnValue(null);

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('should allow access if user has the required role', () => {
    const context = createMockContext(Role.USER);
    mockReflector.getAllAndOverride.mockReturnValue([Role.USER, Role.ADMIN]);

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('should throw ForbiddenException if user does not have the required role', () => {
    const context = createMockContext(Role.USER);
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Insufficient permissions'),
    );
  });

  it('should throw ForbiddenException if user is not in request', () => {
    const context = createMockContext();
    mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Insufficient permissions'),
    );
  });
});
