/**
 * Tests for useStreakScreen hook
 *
 * Covers:
 * - Initial state: showGoalModal === false, newGoal === 10
 * - openGoalModal(): showGoalModal becomes true, newGoal is set to current dailyGoalMinutes
 * - closeGoalModal(): showGoalModal becomes false without mutation
 * - updateGoal(): calls mutate with correct minutes (via mocked useMutation)
 */

import { renderHook, act } from "@testing-library/react";
import { useStreakScreen, StreakData } from "../useStreakScreen";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockMutate = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock("@/store/authStore", () => ({
  useAuthStore: () => ({ accessToken: "mock-token" }),
}));

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}));

// ── Fixtures ───────────────────────────────────────────────────────────────

const makeProgressData = (overrides: Partial<StreakData> = {}): StreakData => ({
  totalLessons: 10,
  weekLessons: 3,
  totalMinutes: 120,
  weekMinutes: 45,
  vocabulary: 50,
  streak: 5,
  bestStreak: 10,
  dailyActivity: [],
  weeklyActivity: [],
  currentStreak: 5,
  calendarDays: [],
  dailyGoalMinutes: 20,
  ...overrides,
});

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useStreakScreen", () => {
  describe("initial state", () => {
    it("should have showGoalModal === false and newGoal === 10 without progressData", () => {
      const { result } = renderHook(() => useStreakScreen(undefined));

      expect(result.current.showGoalModal).toBe(false);
      expect(result.current.newGoal).toBe(10);
    });

    it("should reflect streak and bestStreak from progressData", () => {
      const data = makeProgressData({ streak: 7, bestStreak: 14 });
      const { result } = renderHook(() => useStreakScreen(data));

      expect(result.current.streak).toBe(7);
      expect(result.current.bestStreak).toBe(14);
    });

    it("should reflect dailyGoalMinutes from progressData", () => {
      const data = makeProgressData({ dailyGoalMinutes: 30 });
      const { result } = renderHook(() => useStreakScreen(data));

      expect(result.current.dailyGoalMinutes).toBe(30);
    });
  });

  describe("openGoalModal()", () => {
    it("should set showGoalModal to true", () => {
      const { result } = renderHook(() => useStreakScreen(makeProgressData()));

      act(() => {
        result.current.openGoalModal();
      });

      expect(result.current.showGoalModal).toBe(true);
    });

    it("should initialize newGoal to current dailyGoalMinutes", () => {
      const data = makeProgressData({ dailyGoalMinutes: 25 });
      const { result } = renderHook(() => useStreakScreen(data));

      act(() => {
        result.current.openGoalModal();
      });

      expect(result.current.newGoal).toBe(25);
    });

    it("should default newGoal to 10 when progressData is undefined", () => {
      const { result } = renderHook(() => useStreakScreen(undefined));

      act(() => {
        result.current.openGoalModal();
      });

      expect(result.current.newGoal).toBe(10);
    });
  });

  describe("closeGoalModal()", () => {
    it("should set showGoalModal to false without calling mutate", () => {
      const { result } = renderHook(() => useStreakScreen(makeProgressData()));

      // Open first
      act(() => { result.current.openGoalModal(); });
      expect(result.current.showGoalModal).toBe(true);

      // Close
      act(() => { result.current.closeGoalModal(); });

      expect(result.current.showGoalModal).toBe(false);
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe("updateGoal(minutes)", () => {
    it("should call mutate with the provided minutes", () => {
      const { result } = renderHook(() => useStreakScreen(makeProgressData()));

      act(() => { result.current.updateGoal(30); });

      expect(mockMutate).toHaveBeenCalledWith(30);
    });

    it("should reflect isUpdatingGoal === false when mutation is idle", () => {
      const { result } = renderHook(() => useStreakScreen(makeProgressData()));
      expect(result.current.isUpdatingGoal).toBe(false);
    });
  });

  describe("setNewGoal()", () => {
    it("should update newGoal state", () => {
      const { result } = renderHook(() => useStreakScreen(makeProgressData()));

      act(() => { result.current.setNewGoal(45); });

      expect(result.current.newGoal).toBe(45);
    });
  });
});
