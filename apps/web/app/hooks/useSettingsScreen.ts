"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────

export interface UserSettings {
  name: string;
  dailyGoalMinutes: number;
  preferredStudyHour: number;
  notificationFrequency: "never" | "once" | "twice" | "thrice";
}

export interface UseSettingsScreenReturn {
  // Loading
  isLoading: boolean;
  // Form state
  form: UserSettings;
  setForm: React.Dispatch<React.SetStateAction<UserSettings>>;
  // Mutation state
  saved: boolean;
  saveError: string | null;
  isSaving: boolean;
  // Handlers
  saveSettings: () => void;
  logout: () => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_FORM: UserSettings = {
  name: "",
  dailyGoalMinutes: 10,
  preferredStudyHour: 8,
  notificationFrequency: "once",
};

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * useSettingsScreen
 *
 * Encapsulates all logic for the settings screen:
 * - GET /users/me/settings (settings query)
 * - Local form state initialized from API data
 * - PATCH /users/me (saveSettings mutation)
 * - logout()
 */
export function useSettingsScreen(): UseSettingsScreenReturn {
  const { accessToken, clearAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<UserSettings>(DEFAULT_FORM);
  const [saved, setSaved] = useState(false);

  // ── Query ──

  const { data, isLoading } = useQuery<UserSettings>({
    queryKey: ["settings"],
    queryFn: () => apiFetch("/users/me/settings", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  // Initialize form when data arrives
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  // ── Mutation ──

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch("/users/me", {
        method: "PATCH",
        token: accessToken ?? undefined,
        body: JSON.stringify({
          name: form.name,
          dailyGoalMinutes: form.dailyGoalMinutes,
          preferredStudyHour: form.preferredStudyHour,
          notificationFrequency: form.notificationFrequency,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  // ── Handlers ──

  function saveSettings() {
    saveMutation.mutate();
  }

  function logout() {
    clearAuth();
    router.push("/");
  }

  return {
    isLoading,
    form,
    setForm,
    saved,
    saveError: saveMutation.isError
      ? saveMutation.error instanceof Error
        ? saveMutation.error.message
        : "Erro ao salvar."
      : null,
    isSaving: saveMutation.isPending,
    saveSettings,
    logout,
  };
}
