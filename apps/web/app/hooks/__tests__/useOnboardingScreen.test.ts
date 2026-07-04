/**
 * Tests for useOnboardingScreen hook
 * Covers: progressão de passos; bloqueio sem seleção; submissão com sucesso; tratamento de erro
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useOnboardingScreen } from "../useOnboardingScreen";

// --- Mocks ---
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockUpdateUser = jest.fn();
let mockAccessToken: string | null = "valid-token";
let mockUserOnboardingCompleted = false;

jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => {
    const state = {
      accessToken: mockAccessToken,
      user: { onboardingCompleted: mockUserOnboardingCompleted },
      updateUser: mockUpdateUser,
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

beforeEach(() => {
  jest.clearAllMocks();
  mockAccessToken = "valid-token";
  mockUserOnboardingCompleted = false;
});

describe("useOnboardingScreen", () => {
  describe("progressão de passos", () => {
    it("deve iniciar no passo 'goal'", () => {
      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });
      expect(result.current.step).toBe("goal");
      expect(result.current.currentIndex).toBe(0);
    });

    it("deve avançar para 'language' ao chamar next()", () => {
      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.update("learningGoal", "CAREER");
        result.current.next();
      });

      expect(result.current.step).toBe("language");
      expect(result.current.currentIndex).toBe(1);
    });

    it("deve retroceder ao passo anterior ao chamar back()", () => {
      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.update("learningGoal", "CAREER");
        result.current.next();
      });
      expect(result.current.step).toBe("language");

      act(() => {
        result.current.back();
      });
      expect(result.current.step).toBe("goal");
    });

    it("barra de progresso deve ser 25% no passo 1", () => {
      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });
      expect(result.current.progress).toBe(25);
    });

    it("barra de progresso deve ser 100% no passo 4 (plan)", () => {
      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });

      // Advance through all steps
      act(() => {
        result.current.update("learningGoal", "CAREER");
        result.current.next(); // goal → language
      });
      act(() => {
        result.current.update("targetLanguage", "en");
        result.current.next(); // language → availability
      });
      act(() => {
        result.current.next(); // availability → plan
      });

      expect(result.current.step).toBe("plan");
      expect(result.current.progress).toBe(100);
    });
  });

  describe("bloqueio sem seleção", () => {
    it("deve preservar seleções ao voltar e avançar novamente", () => {
      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.update("learningGoal", "TRAVEL");
        result.current.next();
      });
      act(() => {
        result.current.back();
      });

      // Selection should be preserved
      expect(result.current.state.learningGoal).toBe("TRAVEL");
    });
  });

  describe("submissão com sucesso", () => {
    it("deve chamar API, atualizar store e redirecionar para /assessment", async () => {
      mockApiFetch.mockResolvedValueOnce({ onboardingCompleted: true });

      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });

      // Fill all steps
      act(() => result.current.update("learningGoal", "CAREER"));
      act(() => result.current.update("targetLanguage", "en"));
      act(() => result.current.update("dailyMinutes", 15));
      act(() => result.current.update("preferredHour", 9));

      await act(async () => {
        result.current.handleCreatePlan();
      });

      await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith({
        onboardingCompleted: true,
        learningGoal: "CAREER",
        targetLanguage: "en",
        dailyGoalMinutes: 15,
      }));
      expect(mockPush).toHaveBeenCalledWith("/assessment");
    });
  });

  describe("tratamento de erro", () => {
    it("deve expor erro quando API falha sem navegar", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Erro ao salvar plano."));

      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });

      act(() => result.current.update("learningGoal", "EXAM"));
      act(() => result.current.update("targetLanguage", "fr"));

      await act(async () => {
        result.current.handleCreatePlan();
      });

      await waitFor(() =>
        expect(result.current.error).toBe("Erro ao salvar plano.")
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("isAlreadyCompleted", () => {
    it("deve retornar true quando onboardingCompleted = true no store", () => {
      mockUserOnboardingCompleted = true;

      const { result } = renderHook(() => useOnboardingScreen(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isAlreadyCompleted).toBe(true);
    });
  });
});
