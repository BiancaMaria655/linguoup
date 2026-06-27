import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MetricsInterceptor } from '../../common/interceptors/metrics.interceptor';
import { GetXpUseCase } from '../use-cases/get-xp.use-case';
import { GetAchievementsUseCase } from '../use-cases/get-achievements.use-case';
import { GetMyAchievementsUseCase } from '../use-cases/get-my-achievements.use-case';
import { XpResponseDto, AchievementDto, UserAchievementDto } from '../dto/gamification.dto';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MetricsInterceptor)
@Controller()
export class GamificationController {
  constructor(
    private readonly getXpUseCase: GetXpUseCase,
    private readonly getAchievementsUseCase: GetAchievementsUseCase,
    private readonly getMyAchievementsUseCase: GetMyAchievementsUseCase,
  ) {}

  @Get('xp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna XP total e histórico cronológico de ganhos do usuário' })
  @ApiOkResponse({ description: 'XP total e histórico retornados com sucesso', type: XpResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getXp(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.getXpUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: result, metadata: {} };
  }

  @Get('achievements')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna catálogo de todas as conquistas disponíveis na plataforma' })
  @ApiOkResponse({ description: 'Catálogo de conquistas retornado com sucesso', type: [AchievementDto] })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getAchievements(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.getAchievementsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: result, metadata: {} };
  }

  @Get('achievements/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna conquistas desbloqueadas pelo usuário autenticado' })
  @ApiOkResponse({ description: 'Conquistas do usuário retornadas com sucesso', type: [UserAchievementDto] })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getMyAchievements(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.getMyAchievementsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: result, metadata: {} };
  }
}
