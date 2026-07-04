import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ description: 'Título da lição' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Descrição da lição' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Nível da lição (e.g. beginner, intermediate, advanced)' })
  @IsNotEmpty()
  @IsString()
  level!: string;

  @ApiProperty({ description: 'Tópico da lição' })
  @IsNotEmpty()
  @IsString()
  topic!: string;

  @ApiProperty({ description: 'Duração estimada em minutos', minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @ApiPropertyOptional({ description: 'Conteúdo JSON da lição' })
  @IsOptional()
  content?: any;
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Título da lição' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição da lição' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Nível da lição' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Tópico da lição' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ description: 'Duração estimada em minutos', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Conteúdo JSON da lição' })
  @IsOptional()
  content?: any;
}
