"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetLanguage: string;
  learningGoal: string;
  level: number;
  xp: number;
  streak: number;
  totalLessons: number;
  onboardingCompleted: boolean;
}

export interface XpData {
  level: number;
  xp: number;
  xpForNextLevel: number;
  xpProgress: number; // 0-100 percentage
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  criteria: string;
}

export interface UseProfileScreenReturn {
  // Data
  profile: UserProfile | undefined;
  xpData: XpData | undefined;
  achievements: Achievement[];
  // Derived
  level: number;
  xp: number;
  xpProgress: number;
  xpForNext: number;
  // Loading
  isLoading: boolean;
  xpLoading: boolean;
  achievementsLoading: boolean;
  // Modal state
  editNameOpen: boolean;
  newName: string;
  editError: string | null;
  setNewName: (name: string) => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  // Handlers
  saveName: () => void;
  isSavingName: boolean;
  logout: () => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * useProfileScreen
 *
 * Encapsulates all logic for the profile screen:
 * - GET /users/me (profile query)
 * - GET /xp (XP data query)
 * - GET /achievements/me (achievements query)
 * - PATCH /users/me (updateName mutation)
 * - Modal state for editing name
 * - logout()
 */
export function useProfileScreen(): UseProfileScreenReturn {
  const { accessToken, updateUser, clearAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // ── Queries ──

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => apiFetch("/users/me", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const { data: xpData, isLoading: xpLoading } = useQuery<XpData>({
    queryKey: ["xp"],
    queryFn: () => apiFetch("/xp", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () => apiFetch("/achievements/me", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  // ── Mutations ──

  const updateNameMutation = useMutation({
    mutationFn: (name: string) =>
      apiFetch("/users/me", {
        method: "PATCH",
        token: accessToken ?? undefined,
        body: JSON.stringify({ name }),
      }),
    onSuccess: (_, name) => {
      updateUser({ name });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditNameOpen(false);
    },
    onError: (err) => setEditError(err instanceof Error ? err.message : "Erro ao salvar."),
  });

  // ── Handlers ──

  function openEditModal() {
    setNewName(profile?.name ?? "");
    setEditError(null);
    setEditNameOpen(true);
  }

  function closeEditModal() {
    setEditNameOpen(false);
  }

  function saveName() {
    updateNameMutation.mutate(newName);
  }

  function logout() {
    clearAuth();
    router.push("/");
  }

  // ── Derived ──

  const level = xpData?.level ?? profile?.level ?? 1;
  const xp = xpData?.xp ?? profile?.xp ?? 0;
  const xpProgress = xpData?.xpProgress ?? (xp % 100);
  const xpForNext = xpData?.xpForNextLevel ?? (100 - (xp % 100));

  return {
    profile,
    xpData,
    achievements,
    level,
    xp,
    xpProgress,
    xpForNext,
    isLoading,
    xpLoading,
    achievementsLoading,
    editNameOpen,
    newName,
    editError,
    setNewName,
    openEditModal,
    closeEditModal,
    saveName,
    isSavingName: updateNameMutation.isPending,
    logout,
  };
}
