import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@linguoup/database';
import { MetricsInterceptor } from '../../common/interceptors/metrics.interceptor';
import { CreateAchievementDto, UpdateAchievementDto } from '../dto/admin-achievement.dto';
import { AdminCreateAchievementUseCase } from '../use-cases/admin-create-achievement.use-case';
import { AdminEditAchievementUseCase } from '../use-cases/admin-edit-achievement.use-case';
import { GamificationRepository } from '../repositories/gamification.repository';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('admin-achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@UseInterceptors(MetricsInterceptor)
@Controller('admin/achievements')
export class AdminAchievementsController {
  constructor(
    private readonly gamificationRepository: GamificationRepository,
    private readonly createAchievementUseCase: AdminCreateAchievementUseCase,
    private readonly editAchievementUseCase: AdminEditAchievementUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all achievements for admin' })
  @ApiOkResponse({ description: 'Achievements returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async listAchievements() {
    const achievements = await this.gamificationRepository.findAllAchievements();
    return {
      data: achievements.map((a) => ({
        id: a.id,
        title: a.name,
        description: a.description,
        icon: a.iconUrl,
        criteria: JSON.stringify(a.criteria),
        xpReward: a.xpReward,
        isActive: true,
      })),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new global achievement' })
  @ApiCreatedResponse({ description: 'Achievement created successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async createAchievement(@Req() req: Request, @Body() dto: CreateAchievementDto) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    let criteriaJson = {};
    try {
      criteriaJson = typeof dto.criteria === 'string' ? JSON.parse(dto.criteria) : dto.criteria;
    } catch {
      criteriaJson = { type: 'manual', value: dto.criteria };
    }

    const a = await this.createAchievementUseCase.execute({
      userId: user.id,
      traceId,
      name: dto.title,
      description: dto.description,
      iconUrl: dto.icon,
      xpReward: dto.xpReward,
      criteria: criteriaJson,
    });

    return {
      data: {
        id: a.id,
        title: a.name,
        description: a.description,
        icon: a.iconUrl,
        criteria: JSON.stringify(a.criteria),
        xpReward: a.xpReward,
        isActive: true,
      },
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit an existing platform achievement' })
  @ApiOkResponse({ description: 'Achievement updated successfully' })
  @ApiNotFoundResponse({ description: 'Achievement not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async editAchievement(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateAchievementDto,
  ) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    let criteriaJson: any = undefined;
    if (dto.criteria !== undefined) {
      try {
        criteriaJson = typeof dto.criteria === 'string' ? JSON.parse(dto.criteria) : dto.criteria;
      } catch {
        criteriaJson = { type: 'manual', value: dto.criteria };
      }
    }

    const a = await this.editAchievementUseCase.execute({
      id,
      userId: user.id,
      traceId,
      name: dto.title,
      description: dto.description,
      iconUrl: dto.icon,
      xpReward: dto.xpReward,
      criteria: criteriaJson,
    });

    return {
      data: {
        id: a.id,
        title: a.name,
        description: a.description,
        icon: a.iconUrl,
        criteria: JSON.stringify(a.criteria),
        xpReward: a.xpReward,
        isActive: true,
      },
    };
  }
}
