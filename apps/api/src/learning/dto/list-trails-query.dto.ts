import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ListTrailsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by level',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  level?: string;
}
