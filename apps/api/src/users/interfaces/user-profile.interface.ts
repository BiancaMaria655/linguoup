export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type PlanIntensity = 'BASIC' | 'INTERMEDIATE' | 'INTENSIVE';

export interface IUserPreferences {
  learningGoal: string;
  targetLanguage: string;
  dailyGoalMinutes: number;
  preferredStudyTime: string | null;
  onboardingCompleted: boolean;
}

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: UserLevel;
  preferences: IUserPreferences | null;
  createdAt: Date;
}

export interface IInitialPlan {
  dailyLessons: number;
  weeklyGoal: number;
  intensity: PlanIntensity;
  recommendedLevel: UserLevel;
  targetLanguage: string;
  message: string;
}
