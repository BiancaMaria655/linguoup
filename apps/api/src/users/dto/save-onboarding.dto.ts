import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LearningGoal, PreferredStudyTime } from './enums';

export class SaveOnboardingDto {
  @IsNotEmpty()
  @IsEnum(LearningGoal)
  learningGoal!: LearningGoal;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  targetLanguage!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(120)
  dailyGoalMinutes!: number;

  @IsOptional()
  @IsEnum(PreferredStudyTime)
  preferredStudyTime?: PreferredStudyTime | null;
}
