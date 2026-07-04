"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface TrailLesson {
  id: string;
  title: string;
  topic: string;
  durationMinutes: number;
  status: "completed" | "next" | "locked";
}

export interface TrailDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  totalLessons: number;
  completedLessons: number;
  lessons: TrailLesson[];
}

export function useTrailDetail(id: string) {
  const { accessToken } = useAuthStore();

  const { data: trail, isLoading, isError, error } = useQuery<TrailDetail>({
    queryKey: ["trail", id],
    queryFn: () => apiFetch(`/lessons/trails/${id}`, { token: accessToken ?? undefined }),
    enabled: !!accessToken && !!id,
  });

  return { trail, isLoading, isError, error };
}
