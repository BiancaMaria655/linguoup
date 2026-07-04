import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { Lesson } from '@linguoup/database';
import * as crypto from 'crypto';

export interface FindAllLessonsParams {
  level?: string;
  theme?: string;
  cursor?: string;
  limit?: number;
  tenantId: string;
}

export interface LessonsPage {
  data: Lesson[];
  metadata: { cursor: string | null; total: number };
}

export interface TrailSummary {
  id: string;
  title: string;
  description: string;
  level: string;
  icon: string;
  totalLessons: number;
  completedLessons: number;
}

export interface TrailLessonItem {
  id: string;
  title: string;
  topic: string;
  durationMinutes: number;
  status: 'completed' | 'next' | 'locked';
}

export interface TrailWithLessons extends TrailSummary {
  lessons: TrailLessonItem[];
}

@Injectable()
export class LessonRepository {
  private readonly logger = new Logger(LessonRepository.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: FindAllLessonsParams): Promise<LessonsPage> {
    const { level, theme, cursor, limit = 20, tenantId } = params;

    const cacheKey = this.buildCacheKey({ level, theme, cursor, limit, tenantId });

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cached) as LessonsPage;
      }
    } catch (err) {
      this.logger.warn(`Redis get failed, falling through to DB: ${(err as Error).message}`);
    }

    const where: Record<string, unknown> = { tenant_id: tenantId, isActive: true };
    if (level) where['level'] = level;
    if (theme) where['theme'] = theme;

    const cursorArg = cursor ? { id: cursor } : undefined;

    const [lessons, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        take: limit + 1, // fetch one extra to determine next cursor
        skip: cursorArg ? 1 : 0,
        cursor: cursorArg,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    let nextCursor: string | null = null;
    if (lessons.length > limit) {
      const lastItem = lessons.pop()!;
      nextCursor = lastItem.id;
    }

    const result: LessonsPage = {
      data: lessons,
      metadata: { cursor: nextCursor, total },
    };

    try {
      await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    } catch (err) {
      this.logger.warn(`Redis set failed: ${(err as Error).message}`);
    }

    return result;
  }

  async findById(id: string, tenantId: string): Promise<Lesson | null> {
    return this.prisma.lesson.findFirst({
      where: { id, tenant_id: tenantId, isActive: true },
    });
  }

  async findAssessmentQuestions(tenantId: string): Promise<Lesson[]> {
    return this.prisma.lesson.findMany({
      where: { tenant_id: tenantId, theme: 'assessment', isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Returns virtual trail catalog grouped by (theme, level).
   * Each trail's ID is a deterministic SHA-256 prefix of "theme:level".
   * Excludes assessment lessons.
   */
  async findAllTrails(
    tenantId: string,
    userId: string,
    level?: string,
  ): Promise<TrailSummary[]> {
    const where: Record<string, unknown> = {
      tenant_id: tenantId,
      NOT: { theme: 'assessment' },
      isActive: true,
    };
    if (level) where['level'] = level;

    const lessons = await this.prisma.lesson.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // Fetch completed lesson IDs for this user
    const completions = await this.prisma.lessonCompletion.findMany({
      where: { userId, tenant_id: tenantId },
      select: { lessonId: true },
    });
    const completedIds = new Set(completions.map((c) => c.lessonId));

    // Group by theme+level
    const trailMap = new Map<string, { lessons: Lesson[]; level: string; theme: string }>();
    for (const lesson of lessons) {
      const key = `${lesson.theme}:${lesson.level}`;
      if (!trailMap.has(key)) {
        trailMap.set(key, { lessons: [], level: lesson.level, theme: lesson.theme });
      }
      trailMap.get(key)!.lessons.push(lesson);
    }

    return Array.from(trailMap.entries()).map(([key, group]) => ({
      id: this.trailId(key),
      title: this.themeTitle(group.theme),
      description: this.themeDescription(group.theme, group.level),
      level: group.level,
      icon: this.themeIcon(group.theme),
      totalLessons: group.lessons.length,
      completedLessons: group.lessons.filter((l) => completedIds.has(l.id)).length,
    }));
  }

  /**
   * Returns a single trail (theme+level group) with per-lesson status.
   * trailId must be a deterministic ID produced by findAllTrails.
   */
  async findTrailWithLessons(
    trailId: string,
    tenantId: string,
    userId: string,
  ): Promise<TrailWithLessons | null> {
    const lessons = await this.prisma.lesson.findMany({
      where: { tenant_id: tenantId, NOT: { theme: 'assessment' }, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    // Find the group matching this trailId
    const groupsByKey = new Map<string, Lesson[]>();
    for (const lesson of lessons) {
      const key = `${lesson.theme}:${lesson.level}`;
      if (!groupsByKey.has(key)) groupsByKey.set(key, []);
      groupsByKey.get(key)!.push(lesson);
    }

    let matchedKey: string | null = null;
    let matchedLessons: Lesson[] = [];
    for (const [key, group] of groupsByKey.entries()) {
      if (this.trailId(key) === trailId) {
        matchedKey = key;
        matchedLessons = group;
        break;
      }
    }

    if (!matchedKey || matchedLessons.length === 0) return null;

    const [theme, level] = matchedKey.split(':');

    const completions = await this.prisma.lessonCompletion.findMany({
      where: { userId, tenant_id: tenantId },
      select: { lessonId: true },
    });
    const completedIds = new Set(completions.map((c) => c.lessonId));

    // Compute per-lesson status: completed → next (first incomplete) → locked
    let nextAssigned = false;
    const lessonItems: TrailLessonItem[] = matchedLessons.map((l) => {
      if (completedIds.has(l.id)) {
        return {
          id: l.id,
          title: l.title,
          topic: l.theme,
          durationMinutes: l.durationMinutes,
          status: 'completed',
        };
      }
      if (!nextAssigned) {
        nextAssigned = true;
        return {
          id: l.id,
          title: l.title,
          topic: l.theme,
          durationMinutes: l.durationMinutes,
          status: 'next',
        };
      }
      return {
        id: l.id,
        title: l.title,
        topic: l.theme,
        durationMinutes: l.durationMinutes,
        status: 'locked',
      };
    });

    const completedCount = lessonItems.filter((l) => l.status === 'completed').length;

    return {
      id: trailId,
      title: this.themeTitle(theme),
      description: this.themeDescription(theme, level),
      level,
      icon: this.themeIcon(theme),
      totalLessons: matchedLessons.length,
      completedLessons: completedCount,
      lessons: lessonItems,
    };
  }

  /** Deterministic ID for a trail from its "theme:level" composite key */
  private trailId(compositeKey: string): string {
    return crypto
      .createHash('sha256')
      .update(compositeKey)
      .digest('hex')
      .slice(0, 16);
  }

  private themeTitle(theme: string): string {
    const titles: Record<string, string> = {
      grammar: 'Gramática',
      vocabulary: 'Vocabulário',
      speaking: 'Conversação',
      listening: 'Compreensão Auditiva',
      reading: 'Leitura',
      writing: 'Escrita',
      business: 'Inglês para Negócios',
      travel: 'Inglês para Viagens',
    };
    return titles[theme.toLowerCase()] ?? theme.charAt(0).toUpperCase() + theme.slice(1);
  }

  private themeDescription(theme: string, level: string): string {
    const levelLabel = { beginner: 'iniciante', intermediate: 'intermediário', advanced: 'avançado' }[level] ?? level;
    const themeLabel = this.themeTitle(theme).toLowerCase();
    return `Trilha de ${themeLabel} para nível ${levelLabel}.`;
  }

  private themeIcon(theme: string): string {
    const icons: Record<string, string> = {
      grammar: '📝',
      vocabulary: '📖',
      speaking: '🗣️',
      listening: '🎧',
      reading: '📚',
      writing: '✍️',
      business: '💼',
      travel: '✈️',
    };
    return icons[theme.toLowerCase()] ?? '🎓';
  }

  private buildCacheKey(params: {
    level?: string;
    theme?: string;
    cursor?: string;
    limit?: number;
    tenantId: string;
  }): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(params))
      .digest('hex')
      .slice(0, 16);
    return `lessons:catalog:${hash}`;
  }

  async create(data: {
    tenantId: string;
    title: string;
    description: string;
    level: string;
    theme: string;
    durationMinutes: number;
    content: any;
  }): Promise<Lesson> {
    return this.prisma.lesson.create({
      data: {
        tenant_id: data.tenantId,
        title: data.title,
        description: data.description,
        level: data.level,
        theme: data.theme,
        durationMinutes: data.durationMinutes,
        content: data.content ?? {},
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      title: string;
      description: string;
      level: string;
      theme: string;
      durationMinutes: number;
      content: any;
      isActive: boolean;
    }>,
  ): Promise<Lesson> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    return this.prisma.lesson.update({
      where: { id },
      data,
    });
  }

  async findAllAdmin(tenantId: string, level?: string): Promise<Lesson[]> {
    const where: Record<string, any> = { tenant_id: tenantId };
    if (level) {
      where.level = level;
    }
    return this.prisma.lesson.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMetrics(tenantId: string): Promise<{
    totalUsers: number;
    activeToday: number;
    totalLessons: number;
    lessonsCompletedToday: number;
    totalAchievements: number;
  }> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeToday,
      totalLessons,
      lessonsCompletedToday,
      totalAchievements,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { tenant_id: tenantId },
      }),
      this.prisma.userProgress.count({
        where: {
          tenant_id: tenantId,
          lastActivityDate: {
            gte: startOfToday,
          },
        },
      }),
      this.prisma.lesson.count({
        where: { tenant_id: tenantId },
      }),
      this.prisma.lessonCompletion.count({
        where: {
          tenant_id: tenantId,
          completedAt: {
            gte: startOfToday,
          },
        },
      }),
      this.prisma.achievement.count(),
    ]);

    return {
      totalUsers,
      activeToday,
      totalLessons,
      lessonsCompletedToday,
      totalAchievements,
    };
  }
}
