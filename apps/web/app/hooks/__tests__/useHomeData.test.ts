/**
 * Tests for useHomeData hook
 * Covers: sucesso — dados retornados; loading inicial; erro da API → isError: true
 */
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useHomeData } from "../useHomeData";

// --- Mocks ---
let mockAccessToken: string | null = "mock-token";

jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => {
    const state = {
      accessToken: mockAccessToken,
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock("@/lib/api");
import { apiFetch } from "@/lib/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockHomeData = {
  streak: 5,
  xp: 1200,
  level: 3,
  dailyGoalMinutes: 15,
  todayMinutes: 10,
  nextLesson: { id: "lesson-1", title: "Greetings", topic: "Speaking", durationMinutes: 5 },
  pendingReviews: 3,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockAccessToken = "mock-token";
});

describe("useHomeData", () => {
  describe("sucesso — API retorna dados", () => {
    it("deve retornar data com streak, xp, level, nextLesson e pendingReviews", async () => {
      mockApiFetch.mockResolvedValueOnce(mockHomeData);

      const { result } = renderHook(() => useHomeData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockHomeData);
      expect(result.current.data?.streak).toBe(5);
      expect(result.current.data?.xp).toBe(1200);
      expect(result.current.data?.level).toBe(3);
      expect(result.current.data?.nextLesson?.id).toBe("lesson-1");
      expect(result.current.data?.pendingReviews).toBe(3);
      expect(result.current.isError).toBe(false);
    });
  });

  describe("loading inicial", () => {
    it("deve expor isLoading: true antes da resposta", async () => {
      let resolveQuery!: (value: unknown) => void;
      const queryPromise = new Promise((res) => {
        resolveQuery = res;
      });
      mockApiFetch.mockReturnValueOnce(queryPromise as Promise<typeof mockHomeData>);

      const { result } = renderHook(() => useHomeData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Resolve and clean up
      resolveQuery(mockHomeData);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  describe("erro da API", () => {
    it("deve expor isError: true quando API retorna 500", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Internal Server Error"));

      const { result } = renderHook(() => useHomeData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
