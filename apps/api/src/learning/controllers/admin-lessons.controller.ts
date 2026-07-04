import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
import { CreateLessonDto, UpdateLessonDto } from '../dto/admin-lesson.dto';
import { AdminListLessonsUseCase } from '../use-cases/admin-list-lessons.use-case';
import { AdminCreateLessonUseCase } from '../use-cases/admin-create-lesson.use-case';
import { AdminEditLessonUseCase } from '../use-cases/admin-edit-lesson.use-case';
import { AdminDeactivateLessonUseCase } from '../use-cases/admin-deactivate-lesson.use-case';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('admin-lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@UseInterceptors(MetricsInterceptor)
@Controller('admin/lessons')
export class AdminLessonsController {
  constructor(
    private readonly listLessonsUseCase: AdminListLessonsUseCase,
    private readonly createLessonUseCase: AdminCreateLessonUseCase,
    private readonly editLessonUseCase: AdminEditLessonUseCase,
    private readonly deactivateLessonUseCase: AdminDeactivateLessonUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all lessons for admin (includes active/inactive)' })
  @ApiOkResponse({ description: 'List of lessons returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async listLessons(@Req() req: Request, @Query('level') level?: string) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const lessons = await this.listLessonsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      level: level === 'all' ? undefined : level,
    });

    return {
      data: lessons.map((l) => ({
        id: l.id,
        title: l.title,
        topic: l.theme, // map theme to topic for frontend
        level: l.level,
        durationMinutes: l.durationMinutes,
        isActive: l.isActive,
      })),
      metadata: { total: lessons.length },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiCreatedResponse({ description: 'Lesson created successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async createLesson(@Req() req: Request, @Body() dto: CreateLessonDto) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const lesson = await this.createLessonUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      title: dto.title,
      description: dto.description,
      level: dto.level,
      theme: dto.topic, // map topic to theme for backend
      durationMinutes: dto.durationMinutes,
      content: dto.content,
    });

    return {
      data: {
        id: lesson.id,
        title: lesson.title,
        topic: lesson.theme, // map theme to topic for frontend
        level: lesson.level,
        durationMinutes: lesson.durationMinutes,
        isActive: lesson.isActive,
      },
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit an existing lesson' })
  @ApiOkResponse({ description: 'Lesson updated successfully' })
  @ApiNotFoundResponse({ description: 'Lesson not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async editLesson(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const lesson = await this.editLessonUseCase.execute({
      id,
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      title: dto.title,
      description: dto.description,
      level: dto.level,
      theme: dto.topic, // map topic to theme
      durationMinutes: dto.durationMinutes,
      content: dto.content,
    });

    return {
      data: {
        id: lesson.id,
        title: lesson.title,
        topic: lesson.theme, // map theme to topic
        level: lesson.level,
        durationMinutes: lesson.durationMinutes,
        isActive: lesson.isActive,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate (soft delete) an existing lesson' })
  @ApiOkResponse({ description: 'Lesson deactivated successfully' })
  @ApiNotFoundResponse({ description: 'Lesson not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async deactivateLesson(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const lesson = await this.deactivateLessonUseCase.execute({
      id,
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return {
      data: {
        id: lesson.id,
        isActive: lesson.isActive,
      },
    };
  }
}
