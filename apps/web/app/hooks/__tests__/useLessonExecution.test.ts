/**
 * Tests for useLessonExecution hook
 *
 * Covers:
 * - handleAnswer: correct answer → feedbacks[0] === true, showFeedback === true
 * - handleAnswer: incorrect answer → feedbacks[0] === false, showFeedback === true
 * - handleAnswer: no-op when showFeedback === true (double-click guard)
 * - handleNext: increments current, resets showFeedback/selectedOption/fillInput
 * - handleNext: last question → calls onComplete(correctPct, elapsedSeconds)
 * - Timer: elapsedSeconds increments each second via setInterval
 */

import { renderHook, act } from "@testing-library/react";
import { useLessonExecution } from "../useLessonExecution";

// Freeze time so timer tests are deterministic
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useLessonExecution", () => {
  // ── handleAnswer ─────────────────────────────────────────────────────────

  describe("handleAnswer — correct answer", () => {
    it("should set feedbacks[0] === true and showFeedback === true", () => {
      const { result } = renderHook(() => useLessonExecution());

      act(() => {
        result.current.handleAnswer("hello", "hello");
      });

      expect(result.current.session.feedbacks[0]).toBe(true);
      expect(result.current.session.showFeedback).toBe(true);
    });

    it("should match case-insensitively and trimmed", () => {
      const { result } = renderHook(() => useLessonExecution());

      act(() => {
        result.current.handleAnswer("  HELLO  ", "hello");
      });

      expect(result.current.session.feedbacks[0]).toBe(true);
      expect(result.current.session.showFeedback).toBe(true);
    });
  });

  describe("handleAnswer — incorrect answer", () => {
    it("should set feedbacks[0] === false and showFeedback === true", () => {
      const { result } = renderHook(() => useLessonExecution());

      act(() => {
        result.current.handleAnswer("wrong", "correct");
      });

      expect(result.current.session.feedbacks[0]).toBe(false);
      expect(result.current.session.showFeedback).toBe(true);
    });
  });

  describe("handleAnswer — double-click guard", () => {
    it("should not execute when showFeedback is already true", () => {
      const { result } = renderHook(() => useLessonExecution());

      // First answer
      act(() => {
        result.current.handleAnswer("first", "first");
      });

      expect(result.current.session.feedbacks.length).toBe(1);

      // Second click while showFeedback === true — should be ignored
      act(() => {
        result.current.handleAnswer("second", "second");
      });

      expect(result.current.session.feedbacks.length).toBe(1);
    });
  });

  // ── handleNext ────────────────────────────────────────────────────────────

  describe("handleNext — with remaining questions", () => {
    it("should increment current and reset showFeedback to false", () => {
      const { result } = renderHook(() => useLessonExecution());

      // Answer first question
      act(() => {
        result.current.handleAnswer("answer", "answer");
      });

      expect(result.current.session.showFeedback).toBe(true);

      // Advance to next question (total = 3, so nextIdx = 1 < 3)
      const onComplete = jest.fn();
      act(() => {
        result.current.handleNext(3, onComplete);
      });

      expect(result.current.session.current).toBe(1);
      expect(result.current.session.showFeedback).toBe(false);
      expect(result.current.session.selectedOption).toBeNull();
      expect(result.current.session.fillInput).toBe("");
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe("handleNext — last question", () => {
    it("should call onComplete with (correctPct, elapsedSeconds)", () => {
      const { result } = renderHook(() => useLessonExecution());

      // Advance fake timer by 30 seconds so elapsedSeconds = 30
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      // Answer the only question correctly (total = 1)
      act(() => {
        result.current.handleAnswer("correct", "correct");
      });

      const onComplete = jest.fn();
      act(() => {
        result.current.handleNext(1, onComplete);
      });

      // correctPct: 1/1 = 100; elapsedSeconds should be 30
      expect(onComplete).toHaveBeenCalledWith(100, 30);
    });

    it("should call onComplete with 0% when all answers are wrong", () => {
      const { result } = renderHook(() => useLessonExecution());

      act(() => {
        result.current.handleAnswer("wrong", "correct");
      });

      const onComplete = jest.fn();
      act(() => {
        result.current.handleNext(1, onComplete);
      });

      expect(onComplete).toHaveBeenCalledWith(0, expect.any(Number));
    });

    it("should advance session.current to total", () => {
      const { result } = renderHook(() => useLessonExecution());

      act(() => {
        result.current.handleAnswer("answer", "answer");
      });

      const onComplete = jest.fn();
      act(() => {
        result.current.handleNext(1, onComplete);
      });

      expect(result.current.session.current).toBe(1);
    });
  });

  // ── Timer ─────────────────────────────────────────────────────────────────

  describe("timer (elapsedSeconds)", () => {
    it("should increment elapsedSeconds every second", () => {
      const { result } = renderHook(() => useLessonExecution());

      expect(result.current.elapsedSeconds).toBe(0);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.elapsedSeconds).toBe(3);
    });

    it("should stop incrementing after unmount", () => {
      const { result, unmount } = renderHook(() => useLessonExecution());

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.elapsedSeconds).toBe(2);

      unmount();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // elapsedSeconds should not have changed after unmount
      expect(result.current.elapsedSeconds).toBe(2);
    });
  });
});
