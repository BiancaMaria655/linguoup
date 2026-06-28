import { Injectable } from '@nestjs/common';

interface AnswerItem {
  questionId: string;
  answer: string;
}

interface QuestionItem {
  id: string;
  content: Record<string, unknown>;
}

export interface EvaluationResult {
  level: string;
  description: string;
  recommendedTrack: string;
}

const LEVEL_MAP: Array<{
  minPct: number;
  level: string;
  description: string;
  recommendedTrack: string;
}> = [
  { minPct: 90, level: 'C2', description: 'Proficiente', recommendedTrack: 'C2-Mastery' },
  { minPct: 75, level: 'C1', description: 'Avançado', recommendedTrack: 'C1-Advanced' },
  { minPct: 60, level: 'B2', description: 'Intermediário-avançado', recommendedTrack: 'B2-Upper-Intermediate' },
  { minPct: 45, level: 'B1', description: 'Intermediário', recommendedTrack: 'B1-Intermediate' },
  { minPct: 25, level: 'A2', description: 'Iniciante avançado', recommendedTrack: 'A2-Everyday-Conversations' },
  { minPct: 0, level: 'A1', description: 'Iniciante', recommendedTrack: 'A1-Beginner-Basics' },
];

@Injectable()
export class AssessmentEvaluationService {
  /**
   * Evaluates assessment answers against questions.
   * Calculates the percentage of correct answers and maps to CEFR level A1–C2.
   */
  evaluate(questions: QuestionItem[], answers: AnswerItem[]): EvaluationResult {
    if (!questions.length || !answers.length) {
      return this.mapToLevel(0);
    }

    const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));

    let correct = 0;
    for (const q of questions) {
      const content = q.content as Record<string, unknown>;
      const correctAnswer = content['answer'] as string | undefined;
      const userAnswer = answerMap.get(q.id);

      if (correctAnswer !== undefined && userAnswer === correctAnswer) {
        correct++;
      }
    }

    const percentage = (correct / questions.length) * 100;
    return this.mapToLevel(percentage);
  }

  private mapToLevel(percentage: number): EvaluationResult {
    for (const entry of LEVEL_MAP) {
      if (percentage >= entry.minPct) {
        return {
          level: entry.level,
          description: entry.description,
          recommendedTrack: entry.recommendedTrack,
        };
      }
    }

    // Fallback (should never be reached)
    return { level: 'A1', description: 'Iniciante', recommendedTrack: 'A1-Beginner-Basics' };
  }
}
