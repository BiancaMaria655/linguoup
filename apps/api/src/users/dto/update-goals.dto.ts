import { IsInt, IsOptional, Max, Min, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGoalsDto {
  @ApiPropertyOptional({ minimum: 5, maximum: 120, example: 20 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  dailyGoalMinutes?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 20, example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  dailyGoalLessons?: number;

  /**
   * Rejects body where neither field is provided.
   * Uses @ValidateIf with a function that always returns true to trigger the check,
   * combined with a custom message via the class-validator option.
   */
  @ValidateIf((o: UpdateGoalsDto) => o.dailyGoalMinutes === undefined && o.dailyGoalLessons === undefined)
  @IsInt({ message: 'At least one of dailyGoalMinutes or dailyGoalLessons must be provided' })
  _atLeastOne?: never;
}
