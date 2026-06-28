import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  SpacedReviewItemEntity,
  CreateSpacedReviewItemData,
  FindDueByUserParams,
  FindDueByUserResult,
} from './spaced-review-item.entity';
import { Prisma } from '@linguoup/database';

@Injectable()
export class SpacedReviewItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find review items due for a user (nextReviewAt <= now), ordered by most overdue first.
   * Validates tenantId for multi-tenant isolation.
   */
  async findDueByUser(params: FindDueByUserParams): Promise<FindDueByUserResult> {
    const { userId, tenantId, limit, now } = params;

    const where: Prisma.SpacedReviewItemWhereInput = {
      userId,
      tenant_id: tenantId,
      nextReviewAt: { lte: now },
    };

    const [items, totalDue] = await Promise.all([
      this.prisma.spacedReviewItem.findMany({
        where,
        orderBy: { nextReviewAt: 'asc' },
        take: limit,
        include: { lesson: { select: { title: true } } },
      }),
      this.prisma.spacedReviewItem.count({ where }),
    ]);

    // V1: overdueCount == totalDue intentionally.
    // Both count items where `nextReviewAt <= now` — i.e., all due items are
    // considered overdue by definition. The spec sample response showed different
    // values as an illustrative example only.
    //
    // If a strict distinction is needed in V2+ (e.g., overdueCount counts only
    // items where nextReviewAt < today's midnight, while total includes today's
    // items), add a separate count query with `nextReviewAt: { lt: startOfToday }`.
    const overdueCount = totalDue;

    return {
      items: items.map((item) => this.toEntity(item)),
      totalDue,
      overdueCount,
    };
  }

  /**
   * Upsert multiple SpacedReviewItems for a lesson (prevents duplicates on re-completion).
   */
  async createMany(
    tx: Prisma.TransactionClient,
    data: CreateSpacedReviewItemData[],
  ): Promise<void> {
    for (const item of data) {
      await tx.spacedReviewItem.upsert({
        where: {
          userId_lessonId_itemContent: {
            userId: item.userId,
            lessonId: item.lessonId,
            itemContent: item.itemContent,
          },
        },
        create: {
          tenant_id: item.tenantId,
          userId: item.userId,
          lessonId: item.lessonId,
          itemContent: item.itemContent,
          itemType: item.itemType,
          nextReviewAt: item.nextReviewAt,
          easeFactor: item.easeFactor,
          interval: item.interval,
          repetitions: item.repetitions,
          quality: item.quality,
        },
        // On conflict: do NOT overwrite existing SM-2 state
        update: {},
      });
    }
  }

  /**
   * Find items for a specific user+lesson (for checking existing items).
   */
  async findByUserAndLesson(
    userId: string,
    lessonId: string,
    tenantId: string,
  ): Promise<SpacedReviewItemEntity[]> {
    const items = await this.prisma.spacedReviewItem.findMany({
      where: { userId, lessonId, tenant_id: tenantId },
      include: { lesson: { select: { title: true } } },
    });
    return items.map((item) => this.toEntity(item));
  }

  /**
   * Find a single item by id, validating userId and tenantId ownership.
   */
  async findById(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<SpacedReviewItemEntity | null> {
    const item = await this.prisma.spacedReviewItem.findFirst({
      where: { id, userId, tenant_id: tenantId },
      include: { lesson: { select: { title: true } } },
    });
    return item ? this.toEntity(item) : null;
  }

  /**
   * Update SM-2 state after a review session.
   */
  async update(
    id: string,
    data: {
      interval: number;
      easeFactor: number;
      repetitions: number;
      quality: number;
      nextReviewAt: Date;
    },
  ): Promise<SpacedReviewItemEntity> {
    const item = await this.prisma.spacedReviewItem.update({
      where: { id },
      data: {
        interval: data.interval,
        easeFactor: data.easeFactor,
        repetitions: data.repetitions,
        quality: data.quality,
        nextReviewAt: data.nextReviewAt,
      },
      include: { lesson: { select: { title: true } } },
    });
    return this.toEntity(item);
  }

  private toEntity(
    item: {
      id: string;
      tenant_id: string;
      userId: string;
      lessonId: string;
      itemContent: string;
      itemType: string;
      nextReviewAt: Date;
      easeFactor: number;
      interval: number;
      repetitions: number;
      quality: number | null;
      createdAt: Date;
      updatedAt: Date;
      lesson?: { title: string } | null;
    },
  ): SpacedReviewItemEntity {
    return {
      id: item.id,
      tenantId: item.tenant_id,
      userId: item.userId,
      lessonId: item.lessonId,
      lessonTitle: item.lesson?.title,
      itemContent: item.itemContent,
      itemType: item.itemType,
      nextReviewAt: item.nextReviewAt,
      easeFactor: item.easeFactor,
      interval: item.interval,
      repetitions: item.repetitions,
      quality: item.quality,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
