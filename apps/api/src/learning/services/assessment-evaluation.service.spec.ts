import { AssessmentEvaluationService } from '../services/assessment-evaluation.service';

const makeQuestion = (id: string, answer: string) => ({
  id,
  content: { answer, question: `Question ${id}`, options: ['A', 'B', 'C', 'D'] },
});

describe('AssessmentEvaluationService', () => {
  let service: AssessmentEvaluationService;

  beforeEach(() => {
    service = new AssessmentEvaluationService();
  });

  it('should return A1 for 0% correct answers', () => {
    const questions = [makeQuestion('q1', 'A'), makeQuestion('q2', 'B')];
    const answers = [
      { questionId: 'q1', answer: 'D' },
      { questionId: 'q2', answer: 'C' },
    ];
    const result = service.evaluate(questions as any, answers);
    expect(result.level).toBe('A1');
  });

  it('should return A2 for ~30% correct answers', () => {
    // 3/10 = 30% → A2 (≥25%)
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 'A'));
    const answers = questions.map((q, i) => ({
      questionId: q.id,
      answer: i < 3 ? 'A' : 'B', // 3 correct
    }));
    const result = service.evaluate(questions as any, answers);
    expect(result.level).toBe('A2');
  });

  it('should return B1 for 50% correct answers', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 'A'));
    const answers = questions.map((q, i) => ({
      questionId: q.id,
      answer: i < 5 ? 'A' : 'B', // 5 correct = 50%
    }));
    const result = service.evaluate(questions as any, answers);
    expect(result.level).toBe('B1');
  });

  it('should return B2 for 65% correct answers', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 'A'));
    const answers = questions.map((q, i) => ({
      questionId: q.id,
      answer: i < 7 ? 'A' : 'B', // 7 correct = 70%
    }));
    const result = service.evaluate(questions as any, answers);
    expect(result.level).toBe('B2');
  });

  it('should return C1 for 80% correct answers', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 'A'));
    const answers = questions.map((q, i) => ({
      questionId: q.id,
      answer: i < 8 ? 'A' : 'B', // 8 correct = 80%
    }));
    const result = service.evaluate(questions as any, answers);
    expect(result.level).toBe('C1');
  });

  it('should return C2 for 100% correct answers', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 'A'));
    const answers = questions.map((q) => ({ questionId: q.id, answer: 'A' }));
    const result = service.evaluate(questions as any, answers);
    expect(result.level).toBe('C2');
  });

  it('should handle empty questions gracefully (returns A1)', () => {
    const result = service.evaluate([], [{ questionId: 'q1', answer: 'A' }]);
    expect(result.level).toBe('A1');
  });

  it('should handle partial answers without error', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 'A'));
    const answers = [{ questionId: 'q0', answer: 'A' }]; // only 1 answer for 10 questions
    const result = service.evaluate(questions as any, answers);
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('recommendedTrack');
  });
});
