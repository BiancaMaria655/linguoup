export interface SpacedReviewItemEntity {
  id: string;
  tenantId: string;
  userId: string;
  lessonId: string;
  lessonTitle?: string;
  itemContent: string;
  itemType: string; // "vocabulary" | "grammar"
  nextReviewAt: Date;
  easeFactor: number;
  interval: number;
  repetitions: number;
  quality: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSpacedReviewItemData {
  tenantId: string;
  userId: string;
  lessonId: string;
  itemContent: string;
  itemType: string;
  nextReviewAt: Date;
  easeFactor: number;
  interval: number;
  repetitions: number;
  quality: number | null;
}

export interface FindDueByUserParams {
  userId: string;
  tenantId: string;
  limit: number;
  now: Date;
}

export interface FindDueByUserResult {
  items: SpacedReviewItemEntity[];
  totalDue: number;
  overdueCount: number;
}
