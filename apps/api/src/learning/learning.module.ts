import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LessonsController } from './controllers/lessons.controller';
import { ProgressController } from './controllers/progress.controller';
import { ReviewsController } from './controllers/reviews.controller';
import { AdminLessonsController } from './controllers/admin-lessons.controller';
import { AdminMetricsController } from './controllers/admin-metrics.controller';
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
import { ListTrailsUseCase } from './use-cases/list-trails.use-case';
import { GetTrailUseCase } from './use-cases/get-trail.use-case';
import { AdminListLessonsUseCase } from './use-cases/admin-list-lessons.use-case';
import { AdminCreateLessonUseCase } from './use-cases/admin-create-lesson.use-case';
import { AdminEditLessonUseCase } from './use-cases/admin-edit-lesson.use-case';
import { AdminDeactivateLessonUseCase } from './use-cases/admin-deactivate-lesson.use-case';
import { GetAdminMetricsUseCase } from './use-cases/get-admin-metrics.use-case';
import { GamificationModule } from '../gamification/gamification.module';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [AuthModule, GamificationModule, UsersModule],
  controllers: [
    LessonsController,
    ProgressController,
    ReviewsController,
    AdminLessonsController,
    AdminMetricsController,
  ],
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
    ListTrailsUseCase,
    GetTrailUseCase,
    AdminListLessonsUseCase,
    AdminCreateLessonUseCase,
    AdminEditLessonUseCase,
    AdminDeactivateLessonUseCase,
    GetAdminMetricsUseCase,
  ],
})
export class LearningModule {}


