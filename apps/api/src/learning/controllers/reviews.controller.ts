import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MetricsInterceptor } from '../../common/interceptors/metrics.interceptor';
import { GetRecommendedReviewsQueryDto, CompleteReviewBodyDto } from '../dto/reviews.dto';
import { GetRecommendedReviewsUseCase } from '../use-cases/get-recommended-reviews.use-case';
import { CompleteReviewUseCase } from '../use-cases/complete-review.use-case';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MetricsInterceptor)
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly getRecommendedReviewsUseCase: GetRecommendedReviewsUseCase,
    private readonly completeReviewUseCase: CompleteReviewUseCase,
  ) {}

  @Get('recommended')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lista itens recomendados para revisão hoje (SM-2)',
    description:
      'Retorna itens com nextReviewAt ≤ agora, ordenados por mais atrasados primeiro. Isolado por tenant.',
  })
  @ApiOkResponse({
    description:
      'Lista de itens de revisão com metadata (total, overdueCount)',
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async getRecommended(
    @Req() req: Request,
    @Query() query: GetRecommendedReviewsQueryDto,
  ) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.getRecommendedReviewsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      limit: query.limit,
    });

    return result;
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registra resultado de revisão e calcula próximo intervalo SM-2',
    description:
      'Atualiza o estado SM-2 do item (interval, easeFactor, nextReviewAt) e concede 5 XP.',
  })
  @ApiOkResponse({
    description:
      'Revisão registrada. Retorna { nextReviewAt, interval, easeFactor, xpEarned }',
  })
  @ApiBadRequestResponse({ description: 'reviewItemId inválido ou quality fora do range 0–5' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async complete(@Req() req: Request, @Body() dto: CompleteReviewBodyDto) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.completeReviewUseCase.execute({
      reviewItemId: dto.reviewItemId,
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      quality: dto.quality,
    });

    return { data: result };
  }
}
