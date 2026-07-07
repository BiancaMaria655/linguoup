import { ApiProperty } from '@nestjs/swagger';

export class TrailResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty() level!: string;
  @ApiProperty() icon!: string;
  @ApiProperty() totalLessons!: number;
  @ApiProperty() completedLessons!: number;
}

export class TrailLessonDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() topic!: string;
  @ApiProperty() durationMinutes!: number;
  @ApiProperty({ enum: ['completed', 'next', 'locked'] })
  status!: 'completed' | 'next' | 'locked';
}

export class TrailDetailResponseDto extends TrailResponseDto {
  @ApiProperty({ type: [TrailLessonDto] }) lessons!: TrailLessonDto[];
}
