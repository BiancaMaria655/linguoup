import { Controller, Post, Body, Req, Res, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { RegisterUserUseCase } from './use-cases/register-user.use-case';
import { LoginUserUseCase } from './use-cases/login-user.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { StructuredLogger } from '../common/logger/structured-logger.service';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('auth-controller');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    const traceId = crypto.randomUUID();
    this.logger.log(`Register request received for email: ${dto.email}`, {
      trace_id: traceId,
      tenant_id: dto.tenant_id,
    });

    const user = await this.registerUserUseCase.execute(dto);

    this.logger.log(`User registered successfully: ${user.id}`, {
      trace_id: traceId,
      user_id: user.id,
      tenant_id: user.tenant_id,
    });

    return {
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      metadata: {},
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto, @Res({ passthrough: true }) response: Response) {
    const traceId = crypto.randomUUID();
    this.logger.log(`Login request received for email: ${dto.email}`, {
      trace_id: traceId,
    });

    const result = await this.loginUserUseCase.execute(dto);

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    this.logger.log(`User logged in successfully`, {
      trace_id: traceId,
    });

    return {
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      metadata: {},
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const traceId = crypto.randomUUID();
    const refreshToken = request.cookies?.['refreshToken'];
    if (!refreshToken) {
      this.logger.warn('Refresh request rejected: missing refresh token cookie', {
        trace_id: traceId,
      });
      throw new UnauthorizedException('Refresh token is required');
    }

    this.logger.log('Refresh token rotation request received', {
      trace_id: traceId,
    });

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    this.logger.log('Refresh token rotated successfully', {
      trace_id: traceId,
    });

    return {
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      metadata: {},
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const traceId = crypto.randomUUID();
    const refreshToken = request.cookies?.['refreshToken'];

    this.logger.log('Logout request received', {
      trace_id: traceId,
    });
    
    await this.logoutUseCase.execute({ refreshToken });

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    });

    this.logger.log('User logged out and cookie cleared successfully', {
      trace_id: traceId,
    });

    return {
      data: {
        message: 'Logged out successfully',
      },
      metadata: {},
    };
  }
}
