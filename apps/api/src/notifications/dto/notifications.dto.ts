import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { NotificationChannel, NotificationType } from '@linguoup/database';

// ── Query DTOs ────────────────────────────────────────────────────────────────

export class ListNotificationsQueryDto {
  @ApiPropertyOptional({ description: 'Cursor de paginação opaco' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Número máximo de itens por página (max 50)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filtrar apenas notificações não lidas', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unreadOnly?: boolean = false;
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

export class SendTestNotificationDto {
  @ApiProperty({ description: 'UUID do usuário alvo', example: 'uuid-user' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Mensagem a ser enviada', example: 'Test push notification' })
  @IsString()
  message!: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export class NotificationDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.REMINDER })
  type!: NotificationType;

  @ApiProperty({ enum: NotificationChannel, example: NotificationChannel.PUSH })
  channel!: NotificationChannel;

  @ApiProperty({ example: 'Hora de praticar! Você tem uma lição pendente.' })
  message!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  readAt!: Date | null;

  @ApiProperty({ example: '2024-06-01T08:00:00Z' })
  sentAt!: Date;

  @ApiProperty({ example: '2024-06-01T08:00:00Z' })
  createdAt!: Date;
}

export class NotificationsMetadataDto {
  @ApiPropertyOptional({ nullable: true, example: 'next-cursor-value' })
  cursor!: string | null;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  unreadCount!: number;
}

export class ListNotificationsResponseDto {
  @ApiProperty({ type: [NotificationDto] })
  data!: NotificationDto[];

  @ApiProperty({ type: NotificationsMetadataDto })
  metadata!: NotificationsMetadataDto;
}

export class MarkAsReadResponseDto {
  @ApiProperty()
  data!: { id: string; readAt: Date };
}

export class SendTestNotificationResponseDto {
  @ApiProperty()
  data!: { sent: boolean };
}
