import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LessonsController } from './controllers/lessons.controller';
import { ProgressController } from './controllers/progress.controller';
import { LessonRepository } from './repositories/lesson.repository';
import { ProgressRepository } from './repositories/progress.repository';
import { LearningDomainService } from './services/learning-domain.service';
import { AssessmentEvaluationService } from './services/assessment-evaluation.service';
import { ListLessonsUseCase } from './use-cases/list-lessons.use-case';
import { GetLessonUseCase } from './use-cases/get-lesson.use-case';
import { CompleteLessonUseCase } from './use-cases/complete-lesson.use-case';
import { GetAssessmentUseCase } from './use-cases/get-assessment.use-case';
import { SubmitAssessmentUseCase } from './use-cases/submit-assessment.use-case';
import { GetProgressUseCase } from './use-cases/get-progress.use-case';
import { GetStreakUseCase } from './use-cases/get-streak.use-case';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [AuthModule, GamificationModule],
  controllers: [LessonsController, ProgressController],
  providers: [
    LessonRepository,
    ProgressRepository,
    LearningDomainService,
    AssessmentEvaluationService,
    ListLessonsUseCase,
    GetLessonUseCase,
    CompleteLessonUseCase,
    GetAssessmentUseCase,
    SubmitAssessmentUseCase,
    GetProgressUseCase,
    GetStreakUseCase,
  ],
})
export class LearningModule {}
