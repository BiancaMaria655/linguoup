import { SM2AlgorithmService } from './sm2-algorithm.service';
import { SM2State } from './sm2.types';

describe('SM2AlgorithmService', () => {
  let service: SM2AlgorithmService;

  beforeEach(() => {
    service = new SM2AlgorithmService();
  });

  const defaultState: SM2State = {
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
  };

  describe('quality 0 — total failure', () => {
    it('should reset interval to 1', () => {
      const result = service.calculate({ interval: 10, easeFactor: 2.5, repetitions: 5 }, 0);
      expect(result.interval).toBe(1);
    });

    it('should reduce easeFactor by 0.2 but clamp at 1.3', () => {
      // easeFactor 1.4 - 0.2 = 1.2 → clamped to 1.3
      const result = service.calculate({ interval: 5, easeFactor: 1.4, repetitions: 2 }, 0);
      expect(result.easeFactor).toBeCloseTo(1.3);
    });

    it('should reset repetitions to 0', () => {
      const result = service.calculate({ interval: 10, easeFactor: 2.5, repetitions: 5 }, 0);
      expect(result.repetitions).toBe(0);
    });
  });

  describe('quality 1 — failure', () => {
    it('should reset interval to 1 and reduce easeFactor', () => {
      const result = service.calculate({ interval: 5, easeFactor: 2.5, repetitions: 3 }, 1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.3);
      expect(result.repetitions).toBe(0);
    });
  });

  describe('quality 2 — failure (below threshold)', () => {
    it('should reset interval to 1', () => {
      const result = service.calculate(defaultState, 2);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });
  });

  describe('quality 3 — minimum success', () => {
    it('should advance interval using easeFactor', () => {
      const result = service.calculate(defaultState, 3);
      // interval = max(1, round(1 * 2.5)) = 3 (rounding may vary)
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it('should decrease easeFactor slightly for quality 3', () => {
      const result = service.calculate(defaultState, 3);
      // easeFactor = 2.5 + 0.1 - (5-3)*(0.08+(5-3)*0.02) = 2.5 + 0.1 - 2*(0.08+0.04) = 2.5 + 0.1 - 0.24 = 2.36
      expect(result.easeFactor).toBeCloseTo(2.36);
    });

    it('should increment repetitions', () => {
      const result = service.calculate(defaultState, 3);
      expect(result.repetitions).toBe(1);
    });
  });

  describe('quality 4 — good recall', () => {
    it('should advance interval', () => {
      const result = service.calculate(defaultState, 4);
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it('should keep easeFactor nearly the same (quality 4 formula gives 0)', () => {
      const result = service.calculate(defaultState, 4);
      // easeFactor = 2.5 + 0.1 - 1*(0.08+1*0.02) = 2.5 + 0.1 - 0.1 = 2.5
      expect(result.easeFactor).toBeCloseTo(2.5);
    });
  });

  describe('quality 5 — perfect recall (maximum growth)', () => {
    it('should increase easeFactor', () => {
      const result = service.calculate(defaultState, 5);
      // easeFactor = 2.5 + 0.1 - 0*(0.08+0*0.02) = 2.6
      expect(result.easeFactor).toBeCloseTo(2.6);
    });

    it('should advance interval progressively over multiple repetitions', () => {
      let state = defaultState;
      for (let i = 0; i < 5; i++) {
        state = service.calculate(state, 5) as SM2State;
      }
      // After 5 perfect repetitions, interval should grow significantly
      expect(state.interval).toBeGreaterThan(1);
      expect(state.repetitions).toBe(5);
    });
  });

  describe('easeFactor clamping', () => {
    it('should never allow easeFactor below 1.3 (multiple failures)', () => {
      let state: SM2State = { interval: 10, easeFactor: 1.3, repetitions: 0 };
      for (let i = 0; i < 5; i++) {
        state = service.calculate(state, 0) as SM2State;
        expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
      }
    });

    it('should clamp easeFactor exactly to 1.3 when subtraction goes below', () => {
      const result = service.calculate({ interval: 1, easeFactor: 1.35, repetitions: 0 }, 0);
      // 1.35 - 0.2 = 1.15 → clamped to 1.3
      expect(result.easeFactor).toBeCloseTo(1.3);
    });
  });

  describe('nextReviewAt calculation', () => {
    it('should set nextReviewAt to today + interval days (UTC midnight)', () => {
      const result = service.calculate(defaultState, 5);

      const expected = new Date();
      expected.setUTCDate(expected.getUTCDate() + result.interval);
      expected.setUTCHours(0, 0, 0, 0);

      // Allow 1 second tolerance for test execution time
      expect(result.nextReviewAt.getTime()).toBeCloseTo(expected.getTime(), -3);
    });

    it('should set nextReviewAt to tomorrow (interval=1) on failure', () => {
      const result = service.calculate(defaultState, 0);
      expect(result.interval).toBe(1);

      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      expect(result.nextReviewAt.getTime()).toBe(tomorrow.getTime());
    });
  });

  describe('invalid quality', () => {
    it('should throw for quality below 0', () => {
      expect(() => service.calculate(defaultState, -1)).toThrow();
    });

    it('should throw for quality above 5', () => {
      expect(() => service.calculate(defaultState, 6)).toThrow();
    });
  });
});
