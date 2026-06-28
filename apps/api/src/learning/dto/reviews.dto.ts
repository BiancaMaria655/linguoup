import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GetRecommendedReviewsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of items to return (1–100)',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CompleteReviewBodyDto {
  @ApiProperty({ description: 'UUID of the review item to complete', format: 'uuid' })
  @IsString()
  @IsUUID()
  reviewItemId!: string;

  @ApiProperty({
    description: 'SM-2 quality of recall (0 = total failure, 5 = perfect)',
    minimum: 0,
    maximum: 5,
  })
  @IsInt()
  @Min(0)
  @Max(5)
  quality!: number;
}
