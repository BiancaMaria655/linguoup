"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "achievement" | "streak" | "reminder" | "system";
}

export interface UseNotificationsScreenReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markRead: (id: string) => void;
  isMarkingRead: boolean;
  markAllRead: () => void;
  isMarkingAllRead: boolean;
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * useNotificationsScreen
 *
 * Encapsulates all logic for the notifications screen:
 * - GET /notifications (notifications query)
 * - Derived unreadCount
 * - PATCH /notifications/:id/read (markRead mutation)
 * - PATCH /notifications/read-all (markAllRead mutation)
 */
export function useNotificationsScreen(): UseNotificationsScreenReturn {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  // ── Query ──

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => apiFetch("/notifications", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  // ── Derived ──

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Mutations ──

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
        token: accessToken ?? undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiFetch("/notifications/read-all", {
        method: "PATCH",
        token: accessToken ?? undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // ── Handlers ──

  function markRead(id: string) {
    markReadMutation.mutate(id);
  }

  function markAllRead() {
    markAllReadMutation.mutate();
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    isMarkingRead: markReadMutation.isPending,
    markAllRead,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
