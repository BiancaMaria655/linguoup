import {
  Body,
  Controller,
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
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MetricsInterceptor } from '../common/interceptors/metrics.interceptor';
import { Role } from '@linguoup/database';
import { ListNotificationsUseCase } from './use-cases/list-notifications.use-case';
import { MarkAsReadUseCase } from './use-cases/mark-as-read.use-case';
import { SendTestNotificationUseCase } from './use-cases/send-test-notification.use-case';
import {
  ListNotificationsQueryDto,
  SendTestNotificationDto,
  ListNotificationsResponseDto,
  MarkAsReadResponseDto,
  SendTestNotificationResponseDto,
} from './dto/notifications.dto';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MetricsInterceptor)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly sendTestNotificationUseCase: SendTestNotificationUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna histórico de notificações paginado do usuário autenticado' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor de paginação opaco' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Máx. de itens por página (max 50)' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean, description: 'Filtrar apenas não lidas' })
  @ApiOkResponse({ description: 'Lista de notificações retornada com sucesso', type: ListNotificationsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  async listNotifications(
    @Req() req: Request,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<ListNotificationsResponseDto> {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.listNotificationsUseCase.execute({
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
      cursor: query.cursor,
      limit: query.limit,
      unreadOnly: query.unreadOnly,
    });

    return {
      data: result.notifications.map((n) => ({
        id: n.id,
        type: n.type,
        channel: n.channel,
        message: n.message,
        readAt: n.readAt,
        sentAt: n.sentAt,
        createdAt: n.createdAt,
      })),
      metadata: {
        cursor: result.nextCursor,
        total: result.total,
        unreadCount: result.unreadCount,
      },
    };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marca uma notificação como lida (idempotente)' })
  @ApiOkResponse({ description: 'Notificação marcada como lida', type: MarkAsReadResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  @ApiNotFoundResponse({ description: 'Notificação não encontrada ou não pertence ao usuário' })
  async markAsRead(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<MarkAsReadResponseDto> {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.markAsReadUseCase.execute({
      notificationId: id,
      userId: user.id,
      tenantId: user.tenant_id,
      traceId,
    });

    return { data: result };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Envia notificação de teste via FCM (apenas ADMIN)' })
  @ApiOkResponse({ description: 'Notificação de teste enviada', type: SendTestNotificationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  @ApiForbiddenResponse({ description: 'Acesso negado — apenas ADMIN' })
  @ApiBadRequestResponse({ description: 'Usuário inválido ou sem token FCM registrado' })
  async sendTest(
    @Req() req: Request,
    @Body() body: SendTestNotificationDto,
  ): Promise<SendTestNotificationResponseDto> {
    const user = (req as any).user as AuthenticatedUser;
    const traceId = crypto.randomUUID();

    const result = await this.sendTestNotificationUseCase.execute({
      adminUserId: user.id,
      tenantId: user.tenant_id,
      traceId,
      targetUserId: body.userId,
      message: body.message,
    });

    return { data: result };
  }
}
