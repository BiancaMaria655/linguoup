import { Injectable } from '@nestjs/common';
import { IInitialPlan, PlanIntensity, UserLevel } from '../interfaces/user-profile.interface';

@Injectable()
export class UserDomainService {
  /**
   * Calculates the initial learning plan based on daily goal in minutes.
   *
   * Rules:
   *   ≤10 min  → BASIC       / 1 lesson/day
   *   11-20 min → INTERMEDIATE / 2 lessons/day
   *   >20 min  → INTENSIVE   / 3 lessons/day
   *   weeklyGoal = dailyLessons × 5 (business days)
   */
  calculateInitialPlan(dailyGoalMinutes: number, targetLanguage: string): IInitialPlan {
    let dailyLessons: number;
    let intensity: PlanIntensity;
    let recommendedLevel: UserLevel;
    let message: string;

    if (dailyGoalMinutes <= 10) {
      dailyLessons = 1;
      intensity = 'BASIC';
      recommendedLevel = 'BEGINNER';
      message = 'Ótimo começo! Uma lição por dia é suficiente para criar o hábito.';
    } else if (dailyGoalMinutes <= 20) {
      dailyLessons = 2;
      intensity = 'INTERMEDIATE';
      recommendedLevel = 'BEGINNER';
      message = 'Excelente ritmo! Duas lições por dia vão acelerar seu aprendizado.';
    } else {
      dailyLessons = 3;
      intensity = 'INTENSIVE';
      recommendedLevel = 'INTERMEDIATE';
      message = 'Impressionante dedicação! Três lições por dia para um progresso intensivo.';
    }

    const weeklyGoal = dailyLessons * 5;

    return {
      dailyLessons,
      weeklyGoal,
      intensity,
      recommendedLevel,
      targetLanguage,
      message,
    };
  }
}
