"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface HomeData {
  streak: number;
  xp: number;
  level: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
  nextLesson: { id: string; title: string; topic: string; durationMinutes: number } | null;
  pendingReviews: number;
}

export function useHomeData() {
  const { accessToken } = useAuthStore();

  const { data, isLoading, isError, error } = useQuery<HomeData>({
    queryKey: ["home"],
    queryFn: () => apiFetch("/users/me/home", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  return { data, isLoading, isError, error };
}
