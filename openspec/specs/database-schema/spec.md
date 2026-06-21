# Database Schema

## Purpose

Define the database schema for LinguoUp, including models for multi-tenancy, users, role-based access control (RBAC), lessons, gamification progress, achievements, spaced reviews, and notifications.

## Requirements

### Requirement: Multi-Tenancy Data Isolation
The database schema SHALL define a `tenant_id` field on all primary data entities (`User`, `Lesson`, `UserProgress`, `LessonCompletion`, `UserAchievement`, `SpacedReviewItem`, `Notification`) to guarantee logical data isolation between tenants.

#### Scenario: Verify tenant_id field exists on primary models
- **WHEN** the Prisma schema is parsed and migrations are generated
- **THEN** the generated tables for User, Lesson, UserProgress, LessonCompletion, UserAchievement, SpacedReviewItem, and Notification MUST include a `tenant_id` column of type String.

### Requirement: User Profile and Preferences Schema
The database schema SHALL define a `User` model and a one-to-one related `UserPreferences` model to store authentication details and individual learning configurations.

#### Scenario: Verify User and Preferences relationship
- **WHEN** a new User is created in the database
- **THEN** a corresponding UserPreferences record MUST be linked via a unique `userId` foreign key constraint referencing the User.

### Requirement: RBAC Roles Support
The database schema SHALL support role definitions to classify users into USER, ADMIN, and SUPER_ADMIN.

#### Scenario: Role values constraint
- **WHEN** a user role is persisted
- **THEN** the role column MUST only accept the values: USER, ADMIN, or SUPER_ADMIN.

### Requirement: Lesson Content and Completion Progress Schema
The database schema SHALL define a `Lesson` model containing content JSON and a `LessonCompletion` model to track completions, scores, and earned XP.

#### Scenario: LessonCompletion links User and Lesson
- **WHEN** a lesson completion is registered
- **THEN** the LessonCompletion record MUST link the User and Lesson with foreign keys, storing `score` and `xpEarned`.

### Requirement: Gamification Progress and Achievement Schema
The database schema SHALL define `UserProgress` for tracking XP, level, and streaks; `Achievement` for standard goals; and `UserAchievement` for unlocked badges.

#### Scenario: UserProgress fields check
- **WHEN** UserProgress is queried or updated
- **THEN** it MUST contain fields for `totalXP`, `currentLevel`, `currentStreakDays`, `longestStreak`, and `lastActivityDate`.

### Requirement: Spaced Review and Notification Schemas
The database schema SHALL define `SpacedReviewItem` to schedule future lessons and `Notification` to store notifications.

#### Scenario: SpacedReviewItem scheduling check
- **WHEN** a SpacedReviewItem is scheduled
- **THEN** it MUST store `nextReviewAt`, `easeFactor`, `interval`, and `repetitions`.
