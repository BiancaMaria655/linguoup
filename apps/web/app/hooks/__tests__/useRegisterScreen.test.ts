/**
 * Tests for useRegisterScreen hook
 * Covers: cadastro válido → redirect; e-mail duplicado → erro; senha fraca → bloqueio
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useRegisterScreen } from "../useRegisterScreen";

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

describe("useRegisterScreen", () => {
  describe("handleSubmit — cadastro com dados válidos", () => {
    it("deve redirecionar para /onboarding após cadastro bem-sucedido", async () => {
      // register → login → profile
      mockApiFetch
        .mockResolvedValueOnce({}) // register
        .mockResolvedValueOnce({ accessToken: "new-token" }) // login
        .mockResolvedValueOnce({
          id: "u1",
          name: "Ana",
          email: "ana@test.com",
          role: "USER",
          preferences: { onboardingCompleted: false },
        }); // profile

      const { result } = renderHook(() => useRegisterScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setName("Ana");
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

  describe("handleSubmit — e-mail duplicado", () => {
    it("deve expor erro quando API retorna EMAIL_ALREADY_EXISTS", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("E-mail já cadastrado"));

      const { result } = renderHook(() => useRegisterScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setName("Bia");
        result.current.setEmail("existente@test.com");
        result.current.setPassword("senha123");
      });

      await act(async () => {
        result.current.handleSubmit({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent);
      });

      await waitFor(() =>
        expect(result.current.error).toBe("E-mail já cadastrado")
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("handleSubmit — senha fraca", () => {
    it("não deve chamar a API quando senha tem menos de 8 caracteres", async () => {
      const { result } = renderHook(() => useRegisterScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setName("Carlos");
        result.current.setEmail("carlos@test.com");
        result.current.setPassword("curta"); // < 8 chars
      });

      await act(async () => {
        result.current.handleSubmit({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent);
      });

      // API should not have been called
      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("isAlreadyAuthenticated", () => {
    it("deve retornar true quando token e user existem", () => {
      mockAccessToken = "token-existente";
      mockUser = { onboardingCompleted: false };

      const { result } = renderHook(() => useRegisterScreen(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isAlreadyAuthenticated).toBe(true);
    });
  });
});
