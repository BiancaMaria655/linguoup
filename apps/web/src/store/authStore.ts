import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthTokens, OnboardingData } from '@/types'

interface AuthState {
  // Auth
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean

  // Onboarding progress (persisted locally for multi-step flow)
  onboardingData: Partial<OnboardingData>
  onboardingStep: number

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
  setOnboardingData: (data: Partial<OnboardingData>) => void
  setOnboardingStep: (step: number) => void
  clearOnboarding: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      onboardingData: {},
      onboardingStep: 0,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),

      clearAuth: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          onboardingData: {},
          onboardingStep: 0,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      clearOnboarding: () =>
        set({ onboardingData: {}, onboardingStep: 0 }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        onboardingData: state.onboardingData,
        onboardingStep: state.onboardingStep,
      }),
    }
  )
)
