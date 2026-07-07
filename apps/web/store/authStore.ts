import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  onboardingCompleted: boolean;
  targetLanguage?: string;
  learningGoal?: string;
  dailyGoalMinutes?: number;
  currentStreak?: number;
  xp?: number;
  level?: number;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => {
        set({ accessToken, user });
        if (typeof window !== "undefined") {
          const stateJson = JSON.stringify({ state: { accessToken, user } });
          document.cookie = `linguoup-auth=${encodeURIComponent(stateJson)}; path=/; max-age=31536000; SameSite=Lax`;
        }
      },
      clearAuth: () => {
        set({ accessToken: null, user: null });
        if (typeof window !== "undefined") {
          document.cookie = "linguoup-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },
      updateUser: (partial) =>
        set((state) => {
          const newUser = state.user ? { ...state.user, ...partial } : null;
          if (typeof window !== "undefined") {
            const stateJson = JSON.stringify({ state: { accessToken: state.accessToken, user: newUser } });
            document.cookie = `linguoup-auth=${encodeURIComponent(stateJson)}; path=/; max-age=31536000; SameSite=Lax`;
          }
          return { user: newUser };
        }),
    }),
    { name: "linguoup-auth" }
  )
);
