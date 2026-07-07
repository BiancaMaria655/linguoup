import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ListLessonsQueryDto } from '../dto/list-lessons-query.dto';
import { ListTrailsQueryDto } from '../dto/list-trails-query.dto';
import { CompleteLessonDto } from '../dto/complete-lesson.dto';
import { SubmitAssessmentDto } from '../dto/submit-assessment.dto';
import { MetricsInterceptor } from '../../common/interceptors/metrics.interceptor';
import { ListLessonsUseCase } from '../use-cases/list-lessons.use-case';
import { GetLessonUseCase } from '../use-cases/get-lesson.use-case';
import { CompleteLessonUseCase } from '../use-cases/complete-lesson.use-case';
import { GetAssessmentUseCase } from '../use-cases/get-assessment.use-case';
import { SubmitAssessmentUseCase } from '../use-cases/submit-assessment.use-case';
import { ListTrailsUseCase } from '../use-cases/list-trails.use-case';
import { GetTrailUseCase } from '../use-cases/get-trail.use-case';


interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MetricsInterceptor)
@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly listLessonsUseCase: ListLessonsUseCase,
    private readonly getLessonUseCase: GetLessonUseCase,
    private readonly completeLessonUseCase: CompleteLessonUseCase,
    private readonly getAssessmentUseCase: GetAssessmentUseCase,
    private readonly submitAssessmentUseCase: SubmitAssessmentUseCase,
    private readonly listTrailsUseCase: ListTrailsUseCase,
    private readonly getTrailUseCase: GetTrailUseCase,
  ) {}


  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista o catálogo de lições com filtros e paginação cursor-based' })
  @ApiOkResponse({ description: 'Lista de lições retornada com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async listLessons(@Req() req: Request, @Query() query: ListLessonsQueryDto) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.listLessonsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      level: query.level,
      theme: query.theme,
      cursor: query.cursor,
      limit: query.limit,
    });

    return result;
  }

  // NOTE: /trails and /assessment must come BEFORE /:id to avoid route conflicts

  @Get('trails')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista o catálogo de trilhas de aprendizado (agrupadas por tema/nível)' })
  @ApiOkResponse({ description: 'Lista de trilhas retornada com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async listTrails(@Req() req: Request, @Query() query: ListTrailsQueryDto) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const trails = await this.listTrailsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      level: query.level,
    });

    return { data: trails };
  }

  @Get('trails/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna o detalhe de uma trilha com status de cada lição' })
  @ApiOkResponse({ description: 'Trilha retornada com sucesso' })
  @ApiNotFoundResponse({ description: 'Trilha não encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getTrail(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const trail = await this.getTrailUseCase.execute({
      trailId: id,
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: trail };
  }

  @Get('assessment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna perguntas de avaliação de nível (estimado: 10 min)' })
  @ApiOkResponse({ description: 'Perguntas de avaliação retornadas' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getAssessment(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.getAssessmentUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: result };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna o detalhe completo de uma lição' })
  @ApiOkResponse({ description: 'Lição retornada com sucesso' })
  @ApiNotFoundResponse({ description: 'Lição não encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getLesson(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const lesson = await this.getLessonUseCase.execute({
      lessonId: id,
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: lesson };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registra a conclusão de uma lição (transação atômica: XP + streak + conquistas)' })
  @ApiOkResponse({ description: 'Lição concluída com sucesso. Inclui newAchievements com conquistas desbloqueadas (array vazio se nenhuma).' })
  @ApiBadRequestResponse({ description: 'Campos inválidos (score fora do range 0-100)' })
  @ApiNotFoundResponse({ description: 'Lição não encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async completeLesson(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: CompleteLessonDto,
  ) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.completeLessonUseCase.execute({
      lessonId: id,
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      score: dto.score,
      timeSpentSeconds: dto.timeSpentSeconds,
    });

    return { data: result };
  }

  @Post('assessment/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submete respostas da avaliação e retorna o nível identificado' })
  @ApiOkResponse({ description: 'Avaliação processada com sucesso' })
  @ApiBadRequestResponse({ description: 'answers não pode ser vazio' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async submitAssessment(@Req() req: Request, @Body() dto: SubmitAssessmentDto) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.submitAssessmentUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      answers: dto.answers,
    });

    return { data: result };
  }
}
