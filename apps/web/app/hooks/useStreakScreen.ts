"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── Types ──────────────────────────────────────────────────────────────────

export interface StreakData {
  totalLessons: number;
  weekLessons: number;
  totalMinutes: number;
  weekMinutes: number;
  vocabulary: number;
  streak: number;
  bestStreak: number;
  dailyActivity: { date: string; minutes: number }[];
  weeklyActivity: { week: string; minutes: number }[];
  currentStreak: number;
  calendarDays: { date: string; active: boolean }[];
  dailyGoalMinutes: number;
}

export interface UseStreakScreenReturn {
  streak: number;
  bestStreak: number;
  dailyGoalMinutes: number;
  calendarDays: { date: string; active: boolean }[];
  dailyActivity: { date: string; minutes: number }[];
  showGoalModal: boolean;
  newGoal: number;
  setNewGoal: (v: number) => void;
  openGoalModal: () => void;
  closeGoalModal: () => void;
  updateGoal: (minutes: number) => void;
  isUpdatingGoal: boolean;
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * useStreakScreen
 *
 * Encapsulates streak, best streak, daily goal, calendar, and modal state.
 * Consumes GET /progress (via the progress query key) and exposes
 * updateGoal() which calls POST /users/me/onboarding and invalidates
 * ["progress"] and ["home"] on success.
 *
 * @param progressData - StreakData already fetched by the page query (optional)
 */
export function useStreakScreen(progressData?: StreakData): UseStreakScreenReturn {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(10);

  const updateGoalMutation = useMutation({
    mutationFn: (minutes: number) =>
      apiFetch("/users/me/onboarding", {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ dailyGoalMinutes: minutes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      setShowGoalModal(false);
    },
  });

  function openGoalModal() {
    setNewGoal(progressData?.dailyGoalMinutes ?? 10);
    setShowGoalModal(true);
  }

  function closeGoalModal() {
    setShowGoalModal(false);
  }

  function updateGoal(minutes: number) {
    updateGoalMutation.mutate(minutes);
  }

  return {
    streak: progressData?.streak ?? 0,
    bestStreak: progressData?.bestStreak ?? 0,
    dailyGoalMinutes: progressData?.dailyGoalMinutes ?? 10,
    calendarDays: progressData?.calendarDays ?? [],
    dailyActivity: progressData?.dailyActivity ?? [],
    showGoalModal,
    newGoal,
    setNewGoal,
    openGoalModal,
    closeGoalModal,
    updateGoal,
    isUpdatingGoal: updateGoalMutation.isPending,
  };
}
