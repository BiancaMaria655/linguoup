import { Injectable } from '@nestjs/common';
import { Lesson } from '@linguoup/database';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';
import { AssessmentEvaluationService, EvaluationResult } from '../services/assessment-evaluation.service';
import { UserProfileRepository } from '../../users/interfaces/user-preferences-repository.interface';

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
    private readonly userProfileRepository: UserProfileRepository,
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

    let userLevel = 'BEGINNER';
    if (result.level === 'B1' || result.level === 'B2') {
      userLevel = 'INTERMEDIATE';
    } else if (result.level === 'C1' || result.level === 'C2') {
      userLevel = 'ADVANCED';
    }

    const existingPrefs = await this.userProfileRepository.findPreferencesByUserId(userId);
    const learningGoal = existingPrefs?.learningGoal ?? 'CAREER';
    const targetLanguage = existingPrefs?.targetLanguage ?? 'en';
    const dailyGoalMinutes = existingPrefs?.dailyGoalMinutes ?? 10;
    const preferredStudyTime = existingPrefs?.preferredStudyTime ?? null;

    await this.userProfileRepository.upsertPreferences(userId, {
      learningGoal,
      targetLanguage,
      dailyGoalMinutes,
      preferredStudyTime,
      proficiencyLevel: userLevel,
      onboardingCompleted: true,
    });

    this.logger.log('Assessment evaluated and saved', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { level: result.level, mappedUserLevel: userLevel },
    });

    return result;
  }
}
