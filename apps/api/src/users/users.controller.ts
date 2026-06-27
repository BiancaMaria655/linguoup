import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { SaveOnboardingUseCase } from './use-cases/save-onboarding.use-case';
import { GetInitialPlanUseCase } from './use-cases/get-initial-plan.use-case';
import { UpdateGoalsUseCase } from './use-cases/update-goals.use-case';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly saveOnboardingUseCase: SaveOnboardingUseCase,
    private readonly getInitialPlanUseCase: GetInitialPlanUseCase,
    private readonly updateGoalsUseCase: UpdateGoalsUseCase,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna o perfil do usuário autenticado' })
  @ApiOkResponse({ description: 'Perfil retornado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getProfile(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;

    const profile = await this.getUserProfileUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
    });

    return { data: profile };
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza o nome do usuário autenticado' })
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso' })
  @ApiBadRequestResponse({ description: 'Campos inválidos (validação falhou)' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = (req as any).user as AuthenticatedUser;

    const result = await this.updateProfileUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      name: dto.name,
    });

    return { data: result };
  }

  @Post('me/onboarding')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Salva as preferências de onboarding do usuário' })
  @ApiOkResponse({ description: 'Onboarding salvo com sucesso' })
  @ApiBadRequestResponse({ description: 'Campos obrigatórios ausentes ou inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async saveOnboarding(@Req() req: Request, @Body() dto: SaveOnboardingDto) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.saveOnboardingUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      learningGoal: dto.learningGoal,
      targetLanguage: dto.targetLanguage,
      dailyGoalMinutes: dto.dailyGoalMinutes,
      preferredStudyTime: dto.preferredStudyTime ?? null,
    });

    return { data: result };
  }

  @Get('me/onboarding/plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna o plano inicial de aprendizado calculado' })
  @ApiOkResponse({ description: 'Plano retornado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  @ApiUnprocessableEntityResponse({ description: 'Onboarding não concluído (ONBOARDING_INCOMPLETE)' })
  async getInitialPlan(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;

    const plan = await this.getInitialPlanUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
    });

    return { data: plan };
  }

  @Patch('me/goals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza a meta diária de lições e/ou minutos do usuário autenticado' })
  @ApiOkResponse({ description: 'Meta atualizada com sucesso' })
  @ApiBadRequestResponse({ description: 'Nenhum campo fornecido ou valor fora do intervalo permitido' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async updateGoals(@Req() req: Request, @Body() dto: UpdateGoalsDto) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.updateGoalsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      dailyGoalMinutes: dto.dailyGoalMinutes,
      dailyGoalLessons: dto.dailyGoalLessons,
    });

    return { data: result };
  }
}
