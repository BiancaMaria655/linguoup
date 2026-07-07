/**
 * Tests for useNotificationsScreen hook
 *
 * Covers:
 * - unreadCount reflete notificações com read: false
 * - markRead chama PATCH /notifications/:id/read e invalida cache
 * - markAllRead chama PATCH /notifications/read-all e invalida cache
 */

import { renderHook, act } from "@testing-library/react";
import { useNotificationsScreen } from "../useNotificationsScreen";
import type { Notification } from "../useNotificationsScreen";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockMarkReadMutate = jest.fn();
const mockMarkAllReadMutate = jest.fn();
const mockInvalidateQueries = jest.fn();

let mockQueryData: Notification[] = [];

// Control which mutation's onSuccess to call
let triggerMarkReadSuccess = false;
let triggerMarkAllReadSuccess = false;

jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: mockQueryData,
    isLoading: false,
  }),
  useMutation: ({ onSuccess }: { onSuccess?: () => void }) => {
    return {
      mutate: (arg?: string) => {
        if (arg !== undefined) {
          // markRead receives an id string
          mockMarkReadMutate(arg);
          if (triggerMarkReadSuccess && onSuccess) onSuccess();
        } else {
          // markAllRead receives no arg
          mockMarkAllReadMutate();
          if (triggerMarkAllReadSuccess && onSuccess) onSuccess();
        }
      },
      isPending: false,
    };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock("@/store/authStore", () => ({
  useAuthStore: () => ({ accessToken: "mock-token" }),
}));

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}));

// ── Fixtures ───────────────────────────────────────────────────────────────

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "notif-001",
    title: "Conquista desbloqueada!",
    message: "Você completou 7 dias consecutivos.",
    read: false,
    createdAt: new Date().toISOString(),
    type: "achievement",
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockQueryData = [];
  triggerMarkReadSuccess = false;
  triggerMarkAllReadSuccess = false;
  jest.clearAllMocks();
});

describe("useNotificationsScreen", () => {
  describe("unreadCount", () => {
    it("deve retornar 0 quando todas as notificações estão lidas", () => {
      mockQueryData = [
        makeNotification({ id: "1", read: true }),
        makeNotification({ id: "2", read: true }),
      ];

      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.unreadCount).toBe(0);
    });

    it("deve refletir o número de notificações com read: false", () => {
      mockQueryData = [
        makeNotification({ id: "1", read: false }),
        makeNotification({ id: "2", read: true }),
        makeNotification({ id: "3", read: false }),
      ];

      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.unreadCount).toBe(2);
    });

    it("deve retornar 0 quando não há notificações", () => {
      mockQueryData = [];
      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe("notifications list", () => {
    it("deve retornar lista completa de notificações", () => {
      const notifications = [
        makeNotification({ id: "1", read: false }),
        makeNotification({ id: "2", read: true }),
      ];
      mockQueryData = notifications;

      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications[0].id).toBe("1");
    });
  });

  describe("markRead(id)", () => {
    it("deve chamar mutate com o id correto", () => {
      const { result } = renderHook(() => useNotificationsScreen());

      act(() => {
        result.current.markRead("notif-abc");
      });

      expect(mockMarkReadMutate).toHaveBeenCalledWith("notif-abc");
    });

    it("deve invalidar o cache de notifications ao marcar como lida", () => {
      triggerMarkReadSuccess = true;
      const { result } = renderHook(() => useNotificationsScreen());

      act(() => {
        result.current.markRead("notif-abc");
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["notifications"] });
    });
  });

  describe("markAllRead()", () => {
    it("deve chamar markAllRead sem argumentos", () => {
      const { result } = renderHook(() => useNotificationsScreen());

      act(() => {
        result.current.markAllRead();
      });

      expect(mockMarkAllReadMutate).toHaveBeenCalledTimes(1);
    });

    it("deve invalidar o cache de notifications ao marcar todas como lidas", () => {
      triggerMarkAllReadSuccess = true;
      const { result } = renderHook(() => useNotificationsScreen());

      act(() => {
        result.current.markAllRead();
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["notifications"] });
    });
  });

  describe("isLoading", () => {
    it("deve retornar false quando query está resolvida", () => {
      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.isLoading).toBe(false);
    });
  });
});
