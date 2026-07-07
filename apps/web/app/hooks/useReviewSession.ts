"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  dueDate: string;
  topic: string;
}

export interface UseReviewSessionReturn {
  sessionIndex: number;
  sessionActive: boolean;
  selected: string | null;
  showFeedback: boolean;
  scores: boolean[];
  currentItem: ReviewItem | null;
  startSession: () => void;
  endSession: () => void;
  handleSelect: (answer: string) => void;
  handleNext: () => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * useReviewSession
 *
 * Manages all local state for a spaced-repetition review session.
 * - startSession(): activates session, resets index and scores
 * - handleSelect(answer): validates against correctAnswer (case-insensitive),
 *   records score, fires POST /reviews/:id/complete, guards against double-click
 * - handleNext(): advances to next item or concludes session,
 *   invalidating ["reviews"] and ["home"] on completion
 * - endSession(): forcefully ends the session (e.g., pressing ✕)
 *
 * @param items - ReviewItem[] passed from the page query data
 */
export function useReviewSession(items: ReviewItem[]): UseReviewSessionReturn {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);

  const completeMutation = useMutation({
    mutationFn: (body: { itemId: string; correct: boolean }) =>
      apiFetch(`/reviews/${body.itemId}/complete`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ correct: body.correct }),
      }),
  });

  const sessionItems = items.slice(0, 10);
  const currentItem = sessionActive ? (sessionItems[sessionIndex] ?? null) : null;

  function startSession() {
    setSessionIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setScores([]);
    setSessionActive(true);
  }

  function endSession() {
    setSessionActive(false);
  }

  /**
   * handleSelect — double-click guard: no-op if showFeedback is already true.
   */
  function handleSelect(answer: string) {
    if (showFeedback) return;
    const item = sessionItems[sessionIndex];
    if (!item) return;

    const isCorrect =
      answer.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase();

    setSelected(answer);
    setShowFeedback(true);
    setScores((s) => [...s, isCorrect]);
    completeMutation.mutate({ itemId: item.id, correct: isCorrect });
  }

  /**
   * handleNext — advances or concludes.
   */
  function handleNext() {
    const next = sessionIndex + 1;
    if (next >= sessionItems.length) {
      setSessionIndex(next);
      setSelected(null);
      setShowFeedback(false);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    } else {
      setSessionIndex(next);
      setSelected(null);
      setShowFeedback(false);
    }
  }

  return {
    sessionIndex,
    sessionActive,
    selected,
    showFeedback,
    scores,
    currentItem,
    startSession,
    endSession,
    handleSelect,
    handleNext,
  };
}
