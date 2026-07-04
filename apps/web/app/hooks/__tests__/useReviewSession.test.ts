/**
 * Tests for useReviewSession hook
 *
 * Covers:
 * - startSession(): sessionActive true, sessionIndex 0, scores []
 * - handleSelect(): correct answer → scores[0] === true, showFeedback === true
 * - handleSelect(): incorrect answer → scores[0] === false, showFeedback === true
 * - handleSelect(): double-click guard — no-op when showFeedback already true
 * - handleNext(): advance index and reset feedback/selected
 * - handleNext(): last item → sessionActive becomes false, queries invalidated
 * - endSession(): sessionActive becomes false
 */

import { renderHook, act } from "@testing-library/react";
import { useReviewSession, ReviewItem } from "../useReviewSession";

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

function makeItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: "item-1",
    question: "What does 'Olá' mean?",
    options: ["Hello", "Goodbye", "Thank you", "Please"],
    correctAnswer: "Hello",
    dueDate: new Date().toISOString(),
    topic: "Vocabulário",
    ...overrides,
  };
}

const twoItems: ReviewItem[] = [
  makeItem({ id: "item-1", correctAnswer: "Hello" }),
  makeItem({ id: "item-2", question: "What does 'Obrigado' mean?", correctAnswer: "Thank you" }),
];

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useReviewSession", () => {
  describe("initial state", () => {
    it("should start with sessionActive === false and no current item", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));

      expect(result.current.sessionActive).toBe(false);
      expect(result.current.currentItem).toBeNull();
      expect(result.current.sessionIndex).toBe(0);
      expect(result.current.scores).toEqual([]);
    });
  });

  describe("startSession()", () => {
    it("should set sessionActive to true and reset state", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));

      act(() => { result.current.startSession(); });

      expect(result.current.sessionActive).toBe(true);
      expect(result.current.sessionIndex).toBe(0);
      expect(result.current.scores).toEqual([]);
      expect(result.current.selected).toBeNull();
      expect(result.current.showFeedback).toBe(false);
    });

    it("should expose the first item as currentItem", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));

      act(() => { result.current.startSession(); });

      expect(result.current.currentItem?.id).toBe("item-1");
    });
  });

  describe("handleSelect() — correct answer", () => {
    it("should set showFeedback to true and record true in scores", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });

      act(() => { result.current.handleSelect("Hello"); });

      expect(result.current.showFeedback).toBe(true);
      expect(result.current.scores[0]).toBe(true);
      expect(result.current.selected).toBe("Hello");
    });

    it("should match case-insensitively and trimmed", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });

      act(() => { result.current.handleSelect("  HELLO  "); });

      expect(result.current.scores[0]).toBe(true);
    });

    it("should call completeMutation.mutate with correct payload", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });

      act(() => { result.current.handleSelect("Hello"); });

      expect(mockMutate).toHaveBeenCalledWith({ itemId: "item-1", correct: true });
    });
  });

  describe("handleSelect() — incorrect answer", () => {
    it("should record false in scores", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });

      act(() => { result.current.handleSelect("Goodbye"); });

      expect(result.current.scores[0]).toBe(false);
    });

    it("should call completeMutation.mutate with correct: false", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });

      act(() => { result.current.handleSelect("Goodbye"); });

      expect(mockMutate).toHaveBeenCalledWith({ itemId: "item-1", correct: false });
    });
  });

  describe("handleSelect() — double-click guard", () => {
    it("should be a no-op when showFeedback is already true", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });

      // First selection
      act(() => { result.current.handleSelect("Hello"); });
      expect(result.current.scores.length).toBe(1);

      // Second click (guard)
      act(() => { result.current.handleSelect("Goodbye"); });
      expect(result.current.scores.length).toBe(1);
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleNext() — with remaining items", () => {
    it("should increment sessionIndex and reset feedback/selected", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });

      act(() => { result.current.handleSelect("Hello"); });
      expect(result.current.showFeedback).toBe(true);

      act(() => { result.current.handleNext(); });

      expect(result.current.sessionIndex).toBe(1);
      expect(result.current.showFeedback).toBe(false);
      expect(result.current.selected).toBeNull();
    });

    it("should expose the next item as currentItem", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });
      act(() => { result.current.handleSelect("Hello"); });
      act(() => { result.current.handleNext(); });

      expect(result.current.currentItem?.id).toBe("item-2");
    });

    it("should NOT invalidate queries when items remain", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });
      act(() => { result.current.handleSelect("Hello"); });
      act(() => { result.current.handleNext(); });

      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });

  describe("handleNext() — last item (session conclusion)", () => {
    it("should set sessionActive to false when last item is advanced", () => {
      const singleItem = [makeItem()];
      const { result } = renderHook(() => useReviewSession(singleItem));
      act(() => { result.current.startSession(); });
      act(() => { result.current.handleSelect("Hello"); });
      act(() => { result.current.handleNext(); });

      expect(result.current.sessionActive).toBe(false);
    });

    it("should invalidate [reviews] and [home] queries on completion", () => {
      const singleItem = [makeItem()];
      const { result } = renderHook(() => useReviewSession(singleItem));
      act(() => { result.current.startSession(); });
      act(() => { result.current.handleSelect("Hello"); });
      act(() => { result.current.handleNext(); });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["reviews"] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["home"] });
    });

    it("should have currentItem === null after session ends", () => {
      const singleItem = [makeItem()];
      const { result } = renderHook(() => useReviewSession(singleItem));
      act(() => { result.current.startSession(); });
      act(() => { result.current.handleSelect("Hello"); });
      act(() => { result.current.handleNext(); });

      expect(result.current.currentItem).toBeNull();
    });
  });

  describe("endSession()", () => {
    it("should set sessionActive to false", () => {
      const { result } = renderHook(() => useReviewSession(twoItems));
      act(() => { result.current.startSession(); });
      expect(result.current.sessionActive).toBe(true);

      act(() => { result.current.endSession(); });

      expect(result.current.sessionActive).toBe(false);
    });
  });
});
