/**
 * Tests for useLoginScreen hook
 * Covers: submit válido → redirect; credenciais inválidas → erro; loading state
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useLoginScreen } from "../useLoginScreen";

// --- Mocks ---
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockSetAuth = jest.fn();
let mockAccessToken: string | null = null;
let mockUser: { onboardingCompleted: boolean } | null = null;

jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => {
    const state = {
      accessToken: mockAccessToken,
      user: mockUser,
      setAuth: mockSetAuth,
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
  mockAccessToken = null;
  mockUser = null;
});

describe("useLoginScreen", () => {
  describe("handleSubmit — credenciais válidas com onboarding pendente", () => {
    it("deve redirecionar para /onboarding quando onboardingCompleted = false", async () => {
      mockApiFetch
        .mockResolvedValueOnce({ accessToken: "token-123" })
        .mockResolvedValueOnce({
          id: "u1",
          name: "Ana",
          email: "ana@test.com",
          role: "USER",
          preferences: { onboardingCompleted: false },
        });

      const { result } = renderHook(() => useLoginScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setEmail("ana@test.com");
        result.current.setPassword("senha123");
      });

      await act(async () => {
        result.current.handleSubmit({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent);
      });

      await waitFor(() => expect(mockSetAuth).toHaveBeenCalled());
      expect(mockPush).toHaveBeenCalledWith("/onboarding");
    });
  });

  describe("handleSubmit — credenciais válidas com onboarding completo", () => {
    it("deve redirecionar para /dashboard quando onboardingCompleted = true", async () => {
      mockApiFetch
        .mockResolvedValueOnce({ accessToken: "token-456" })
        .mockResolvedValueOnce({
          id: "u2",
          name: "Bob",
          email: "bob@test.com",
          role: "USER",
          preferences: { onboardingCompleted: true },
        });

      const { result } = renderHook(() => useLoginScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setEmail("bob@test.com");
        result.current.setPassword("senha123");
      });

      await act(async () => {
        result.current.handleSubmit({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent);
      });

      await waitFor(() => expect(mockSetAuth).toHaveBeenCalled());
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("handleSubmit — credenciais inválidas", () => {
    it("deve expor erro e não redirecionar quando API retorna 401", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Credenciais inválidas"));

      const { result } = renderHook(() => useLoginScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setEmail("errado@test.com");
        result.current.setPassword("errado");
      });

      await act(async () => {
        result.current.handleSubmit({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent);
      });

      await waitFor(() =>
        expect(result.current.error).toBe("Credenciais inválidas")
      );
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockSetAuth).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("deve expor loading=true durante a requisição", async () => {
      let resolveLogin!: (value: unknown) => void;
      const loginPromise = new Promise((res) => {
        resolveLogin = res;
      });
      mockApiFetch.mockReturnValueOnce(loginPromise as Promise<{ accessToken: string }>);

      const { result } = renderHook(() => useLoginScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setEmail("user@test.com");
        result.current.setPassword("senha123");
      });

      act(() => {
        result.current.handleSubmit({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent);
      });

      await waitFor(() => expect(result.current.loading).toBe(true));

      // Resolve and clean up
      act(() => resolveLogin({ accessToken: "t" }));
    });
  });

  describe("isAlreadyAuthenticated", () => {
    it("deve retornar true quando token e user estão presentes", () => {
      mockAccessToken = "token-existente";
      mockUser = { onboardingCompleted: true };

      const { result } = renderHook(() => useLoginScreen(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isAlreadyAuthenticated).toBe(true);
    });
  });
});
