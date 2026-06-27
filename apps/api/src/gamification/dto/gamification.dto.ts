import { ApiProperty } from '@nestjs/swagger';

export class XpHistoryEntryDto {
  @ApiProperty({ example: 42 })
  xpEarned!: number;

  @ApiProperty({ example: 'lesson' })
  source!: string;

  @ApiProperty({ example: 'uuid-lesson-id' })
  lessonId!: string;

  @ApiProperty({ example: '2025-01-24T10:00:00.000Z' })
  earnedAt!: Date;
}

export class XpResponseDto {
  @ApiProperty({ example: 350 })
  total!: number;

  @ApiProperty({ type: [XpHistoryEntryDto] })
  history!: XpHistoryEntryDto[];
}

export class AchievementDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Primeira Lição' })
  name!: string;

  @ApiProperty({ example: 'Complete sua primeira lição' })
  description!: string;

  @ApiProperty({ example: '/icons/achievements/first-lesson.svg' })
  iconUrl!: string;

  @ApiProperty({ example: 50 })
  xpReward!: number;

  @ApiProperty({ example: { type: 'lessons_completed', threshold: 1 } })
  criteria!: unknown;
}

export class UserAchievementDto {
  @ApiProperty({ type: AchievementDto })
  achievement!: AchievementDto;

  @ApiProperty({ example: '2025-01-24T10:00:00.000Z' })
  unlockedAt!: Date;
}
