import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsString, ValidateNested } from 'class-validator';

class AnswerItemDto {
  @ApiProperty({ description: 'Question UUID' })
  @IsString()
  questionId!: string;

  @ApiProperty({ description: 'Selected answer' })
  @IsString()
  answer!: string;
}

export class SubmitAssessmentDto {
  @ApiProperty({ type: [AnswerItemDto], description: 'Array of answers (must not be empty)' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers!: AnswerItemDto[];
}
