import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LessonResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty() level!: string;
  @ApiProperty() theme!: string;
  @ApiProperty() durationMinutes!: number;
}

export class LessonDetailResponseDto extends LessonResponseDto {
  @ApiProperty({ type: Object, description: 'Full lesson content including exercises' })
  content!: Record<string, unknown>;
}

export class PaginationMetadataDto {
  @ApiPropertyOptional({ nullable: true }) cursor!: string | null;
  @ApiProperty() total!: number;
}

export class CompleteLessonResponseDto {
  @ApiProperty() xpEarned!: number;
  @ApiProperty() newTotalXP!: number;
  @ApiProperty() streakUpdated!: boolean;
  @ApiProperty() streakDays!: number;
}

export class AssessmentQuestionDto {
  @ApiProperty() id!: string;
  @ApiProperty() text!: string;
  @ApiProperty({ type: [String] }) options!: string[];
  @ApiProperty() type!: string;
}

export class AssessmentResultDto {
  @ApiProperty() level!: string;
  @ApiProperty() description!: string;
  @ApiProperty() recommendedTrack!: string;
}
