import { UserDomainService } from './user.domain-service';

describe('UserDomainService', () => {
  let service: UserDomainService;

  beforeEach(() => {
    service = new UserDomainService();
  });

  describe('calculateInitialPlan', () => {
    it('should return BASIC plan for dailyGoalMinutes <= 10', () => {
      const result = service.calculateInitialPlan(10, 'en-US');
      expect(result.dailyLessons).toBe(1);
      expect(result.weeklyGoal).toBe(5);
      expect(result.intensity).toBe('BASIC');
      expect(result.targetLanguage).toBe('en-US');
    });

    it('should return BASIC plan for dailyGoalMinutes = 5', () => {
      const result = service.calculateInitialPlan(5, 'es-ES');
      expect(result.dailyLessons).toBe(1);
      expect(result.weeklyGoal).toBe(5);
      expect(result.intensity).toBe('BASIC');
    });

    it('should return INTERMEDIATE plan for dailyGoalMinutes = 11', () => {
      const result = service.calculateInitialPlan(11, 'fr-FR');
      expect(result.dailyLessons).toBe(2);
      expect(result.weeklyGoal).toBe(10);
      expect(result.intensity).toBe('INTERMEDIATE');
    });

    it('should return INTERMEDIATE plan for dailyGoalMinutes = 20', () => {
      const result = service.calculateInitialPlan(20, 'en-US');
      expect(result.dailyLessons).toBe(2);
      expect(result.weeklyGoal).toBe(10);
      expect(result.intensity).toBe('INTERMEDIATE');
    });

    it('should return INTENSIVE plan for dailyGoalMinutes > 20', () => {
      const result = service.calculateInitialPlan(30, 'en-US');
      expect(result.dailyLessons).toBe(3);
      expect(result.weeklyGoal).toBe(15);
      expect(result.intensity).toBe('INTENSIVE');
    });

    it('should return INTENSIVE plan for dailyGoalMinutes = 120', () => {
      const result = service.calculateInitialPlan(120, 'de-DE');
      expect(result.dailyLessons).toBe(3);
      expect(result.weeklyGoal).toBe(15);
      expect(result.intensity).toBe('INTENSIVE');
    });

    it('should include targetLanguage in the result', () => {
      const result = service.calculateInitialPlan(15, 'ja-JP');
      expect(result.targetLanguage).toBe('ja-JP');
    });

    it('should include a motivational message', () => {
      const result = service.calculateInitialPlan(15, 'en-US');
      expect(result.message).toBeTruthy();
      expect(typeof result.message).toBe('string');
    });
  });
});
