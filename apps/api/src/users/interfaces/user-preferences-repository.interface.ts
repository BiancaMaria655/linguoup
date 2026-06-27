import { User, UserPreferences } from '@linguoup/database';

export interface UpdateProfileData {
  name?: string;
}

export interface UpsertPreferencesData {
  learningGoal: string;
  targetLanguage: string;
  dailyGoalMinutes: number;
  preferredStudyTime?: string | null;
  onboardingCompleted: boolean;
}

export abstract class UserProfileRepository {
  abstract findById(userId: string): Promise<User | null>;
  abstract updateProfile(userId: string, data: UpdateProfileData): Promise<User>;
  abstract upsertPreferences(userId: string, data: UpsertPreferencesData): Promise<UserPreferences>;
  abstract findPreferencesByUserId(userId: string): Promise<UserPreferences | null>;
  abstract findByIdWithPreferences(userId: string): Promise<(User & { preferences: UserPreferences | null }) | null>;
}
