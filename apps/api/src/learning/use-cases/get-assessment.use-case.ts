import { Injectable } from '@nestjs/common';
import { Lesson } from '@linguoup/database';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';

export interface GetAssessmentQuery {
  tenantId: string;
  userId: string;
  traceId: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: string[];
  type: string;
}

export interface GetAssessmentResult {
  questions: AssessmentQuestion[];
  estimatedMinutes: number;
}

function mapLessonToQuestion(lesson: Lesson): AssessmentQuestion {
  const content = lesson.content as Record<string, unknown>;
  return {
    id: lesson.id,
    text: (content['question'] as string) ?? lesson.title,
    options: (content['options'] as string[]) ?? [],
    type: 'multiple_choice',
  };
}

@Injectable()
export class GetAssessmentUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('get-assessment-use-case');
  }

  async execute(query: GetAssessmentQuery): Promise<GetAssessmentResult> {
    const { tenantId, userId, traceId } = query;

    this.logger.log('Fetching assessment questions', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
    });

    const questions = await this.lessonRepository.findAssessmentQuestions(tenantId);

    return {
      questions: questions.map(mapLessonToQuestion),
      estimatedMinutes: 10,
    };
  }
}
