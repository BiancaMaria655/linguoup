"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type ExerciseType = "multiple_choice" | "fill_blank" | "translation";

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
  explanation?: string;
}

export interface LessonDetail {
  id: string;
  title: string;
  topic: string;
  durationMinutes: number;
  exercises: Exercise[];
}

export interface SessionState {
  current: number;
  answers: string[];
  feedbacks: boolean[];
  startTime: number;
  showFeedback: boolean;
  selectedOption: string | null;
  fillInput: string;
}

export interface UseLessonExecutionReturn {
  session: SessionState;
  elapsedSeconds: number;
  showHint: boolean;
  score: number;
  correctPct: number;
  isDone: boolean;
  handleAnswer: (answer: string, correctAnswer: string) => void;
  handleNext: (
    total: number,
    onComplete: (score: number, time: number) => void
  ) => void;
  setShowHint: (v: boolean | ((prev: boolean) => boolean)) => void;
  setFillInput: (v: string) => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * useLessonExecution
 *
 * Manages all local session state for a lesson execution:
 * - Current exercise index, answers, feedbacks, timer
 * - handleAnswer: validates case-insensitive + trimmed, records feedback
 * - handleNext: advances to next question or triggers onComplete callback
 * - elapsedSeconds: live timer updated every second via setInterval
 */
export function useLessonExecution(): UseLessonExecutionReturn {
  const [session, setSession] = useState<SessionState>({
    current: 0,
    answers: [],
    feedbacks: [],
    startTime: Date.now(),
    showFeedback: false,
    selectedOption: null,
    fillInput: "",
  });

  const [showHint, setShowHint] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer: increment elapsedSeconds every second, clear on unmount
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const score = session.feedbacks.filter(Boolean).length;
  const answeredCount = session.feedbacks.length;
  const correctPct =
    answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0;

  // isDone is derived by the page (session.current >= total); exposed as false here
  const isDone = false;

  /**
   * handleAnswer — validates the user's answer against correctAnswer.
   * Case-insensitive, trimmed comparison.
   * Guards against double-click when showFeedback is already true.
   */
  function handleAnswer(answer: string, correctAnswer: string) {
    if (session.showFeedback) return;
    const isCorrect =
      answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setSession((s) => ({
      ...s,
      selectedOption: answer,
      fillInput: answer,
      showFeedback: true,
      answers: [...s.answers, answer],
      feedbacks: [...s.feedbacks, isCorrect],
    }));
    setShowHint(false);
  }

  /**
   * handleNext — advances to the next question.
   * If this was the last question, calls onComplete(correctPct, elapsedSeconds).
   */
  function handleNext(
    total: number,
    onComplete: (score: number, time: number) => void
  ) {
    const nextIdx = session.current + 1;

    if (nextIdx >= total) {
      // Compute final score from current feedbacks (including just-answered)
      const allFeedbacks = session.feedbacks;
      const finalScore = allFeedbacks.filter(Boolean).length;
      const finalPct =
        allFeedbacks.length > 0
          ? Math.round((finalScore / allFeedbacks.length) * 100)
          : 0;
      onComplete(finalPct, elapsedSeconds);
    }

    setSession((s) => ({
      ...s,
      current: nextIdx,
      showFeedback: false,
      selectedOption: null,
      fillInput: "",
    }));
    setShowHint(false);
  }

  function setFillInput(v: string) {
    setSession((s) => ({ ...s, fillInput: v }));
  }

  return {
    session,
    elapsedSeconds,
    showHint,
    score,
    correctPct,
    isDone,
    handleAnswer,
    handleNext,
    setShowHint,
    setFillInput,
  };
}
