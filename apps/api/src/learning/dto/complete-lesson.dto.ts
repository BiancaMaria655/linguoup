import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class CompleteLessonDto {
  @ApiProperty({ description: 'Lesson score (0–100)', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiProperty({ description: 'Time spent completing the lesson in seconds (min 1)', minimum: 1 })
  @IsInt()
  @Min(1)
  timeSpentSeconds!: number;
}
