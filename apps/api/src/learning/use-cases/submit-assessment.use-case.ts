import { Injectable } from '@nestjs/common';
import { Lesson } from '@linguoup/database';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';
import { AssessmentEvaluationService, EvaluationResult } from '../services/assessment-evaluation.service';

export interface SubmitAssessmentCommand {
  tenantId: string;
  userId: string;
  traceId: string;
  answers: Array<{ questionId: string; answer: string }>;
}

@Injectable()
export class SubmitAssessmentUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly assessmentEvaluationService: AssessmentEvaluationService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('submit-assessment-use-case');
  }

  async execute(command: SubmitAssessmentCommand): Promise<EvaluationResult> {
    const { tenantId, userId, traceId, answers } = command;

    this.logger.log('Submitting assessment', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { answersCount: answers.length },
    });

    const lessons: Lesson[] = await this.lessonRepository.findAssessmentQuestions(tenantId);

    // Map Lesson to the QuestionItem shape expected by AssessmentEvaluationService
    const questions = lessons.map((l) => ({
      id: l.id,
      content: l.content as Record<string, unknown>,
    }));

    const result = this.assessmentEvaluationService.evaluate(questions, answers);

    this.logger.log('Assessment evaluated', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { level: result.level },
    });

    return result;
  }
}
