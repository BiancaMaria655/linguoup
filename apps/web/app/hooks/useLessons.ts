"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export type Level = "all" | "beginner" | "intermediate" | "advanced";

export interface Trail {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  totalLessons: number;
  completedLessons: number;
  icon: string;
}

export function useLessons(filter: Level) {
  const { accessToken } = useAuthStore();

  const { data: trails = [], isLoading, isError, error } = useQuery<Trail[]>({
    queryKey: ["trails", filter],
    queryFn: () =>
      apiFetch(`/lessons/trails${filter !== "all" ? `?level=${filter}` : ""}`, {
        token: accessToken ?? undefined,
      }),
    enabled: !!accessToken,
  });

  return { trails, isLoading, isError, error };
}
