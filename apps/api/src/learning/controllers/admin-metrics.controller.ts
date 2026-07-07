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
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@linguoup/database';
import { MetricsInterceptor } from '../../common/interceptors/metrics.interceptor';
import { GetAdminMetricsUseCase } from '../use-cases/get-admin-metrics.use-case';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('admin-metrics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@UseInterceptors(MetricsInterceptor)
@Controller('admin/metrics')
export class AdminMetricsController {
  constructor(
    private readonly getAdminMetricsUseCase: GetAdminMetricsUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get dashboard statistics aggregated by tenant' })
  @ApiOkResponse({ description: 'Metrics returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getMetrics(@Req() req: Request) {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const metrics = await this.getAdminMetricsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: metrics };
  }
}
