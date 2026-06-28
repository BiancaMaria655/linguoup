import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LessonsController } from './controllers/lessons.controller';
import { ProgressController } from './controllers/progress.controller';
import { ReviewsController } from './controllers/reviews.controller';
import { LessonRepository } from './repositories/lesson.repository';
import { ProgressRepository } from './repositories/progress.repository';
import { SpacedReviewItemRepository } from './repositories/spaced-review-item.repository';
import { LearningDomainService } from './services/learning-domain.service';
import { AssessmentEvaluationService } from './services/assessment-evaluation.service';
import { SM2AlgorithmService } from './services/sm2-algorithm.service';
import { ListLessonsUseCase } from './use-cases/list-lessons.use-case';
import { GetLessonUseCase } from './use-cases/get-lesson.use-case';
import { CompleteLessonUseCase } from './use-cases/complete-lesson.use-case';
import { GetAssessmentUseCase } from './use-cases/get-assessment.use-case';
import { SubmitAssessmentUseCase } from './use-cases/submit-assessment.use-case';
import { GetProgressUseCase } from './use-cases/get-progress.use-case';
import { GetStreakUseCase } from './use-cases/get-streak.use-case';
import { GetRecommendedReviewsUseCase } from './use-cases/get-recommended-reviews.use-case';
import { CompleteReviewUseCase } from './use-cases/complete-review.use-case';
import { CreateSpacedReviewItemsUseCase } from './use-cases/create-spaced-review-items.use-case';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [AuthModule, GamificationModule],
  controllers: [LessonsController, ProgressController, ReviewsController],
  providers: [
    LessonRepository,
    ProgressRepository,
    SpacedReviewItemRepository,
    LearningDomainService,
    AssessmentEvaluationService,
    SM2AlgorithmService,
    ListLessonsUseCase,
    GetLessonUseCase,
    CompleteLessonUseCase,
    GetAssessmentUseCase,
    SubmitAssessmentUseCase,
    GetProgressUseCase,
    GetStreakUseCase,
    GetRecommendedReviewsUseCase,
    CompleteReviewUseCase,
    CreateSpacedReviewItemsUseCase,
  ],
})
export class LearningModule {}

