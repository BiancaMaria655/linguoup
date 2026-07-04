import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty({ description: 'Título da conquista' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Descrição da conquista' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Ícone da conquista' })
  @IsNotEmpty()
  @IsString()
  icon!: string;

  @ApiProperty({ description: 'XP de recompensa', minimum: 0 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  xpReward!: number;

  @ApiProperty({ description: 'Critério de desbloqueio' })
  @IsNotEmpty()
  @IsString()
  criteria!: string;
}

export class UpdateAchievementDto {
  @ApiPropertyOptional({ description: 'Título da conquista' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição da conquista' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Ícone da conquista' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'XP de recompensa', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @ApiPropertyOptional({ description: 'Critério de desbloqueio' })
  @IsOptional()
  @IsString()
  criteria?: string;
}
