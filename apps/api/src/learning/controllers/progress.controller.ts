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
import { GetProgressUseCase } from '../use-cases/get-progress.use-case';
import { GetStreakUseCase } from '../use-cases/get-streak.use-case';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MetricsInterceptor)
@Controller()
export class ProgressController {
  constructor(
    private readonly getProgressUseCase: GetProgressUseCase,
    private readonly getStreakUseCase: GetStreakUseCase,
  ) {}

  @Get('progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna o progresso geral de aprendizado do usuário autenticado' })
  @ApiOkResponse({
    description: 'Progresso retornado com sucesso',
    schema: {
      example: {
        data: {
          totalXP: 350,
          currentLevel: 2,
          lessonsCompleted: 7,
          minutesStudied: 84,
          vocabularyLearned: 42,
          weeklyActivity: [{ date: '2025-01-20', lessonsCompleted: 2, minutesStudied: 24 }],
          monthlyActivity: [{ week: '2025-W03', lessonsCompleted: 5 }],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getProgress(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.getProgressUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: result };
  }

  @Get('streak')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna o streak atual e o calendário de atividade (30 dias)' })
  @ApiOkResponse({
    description: 'Streak retornado com sucesso',
    schema: {
      example: {
        data: {
          currentStreak: 5,
          longestStreak: 12,
          lastActivityDate: '2025-01-24',
          activityCalendar: [
            { date: '2025-12-26', active: false },
            { date: '2025-12-27', active: true },
          ],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getStreak(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.getStreakUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: result };
  }
}
