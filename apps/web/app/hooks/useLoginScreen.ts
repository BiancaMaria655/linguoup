"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  preferences: {
    onboardingCompleted: boolean;
    targetLanguage?: string;
    learningGoal?: string;
    dailyGoalMinutes?: number;
  } | null;
}

async function loginAndFetchProfile(payload: LoginPayload): Promise<AuthUser & { accessToken: string }> {
  const loginData = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const profile = await apiFetch<UserProfileResponse>("/users/me", {
    token: loginData.accessToken,
  });
  return {
    accessToken: loginData.accessToken,
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    onboardingCompleted: profile.preferences?.onboardingCompleted ?? false,
    targetLanguage: profile.preferences?.targetLanguage,
    learningGoal: profile.preferences?.learningGoal,
    dailyGoalMinutes: profile.preferences?.dailyGoalMinutes,
  };
}

export function useLoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { accessToken, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: loginAndFetchProfile,
    onSuccess(data) {
      const { accessToken: token, ...userData } = data;
      setAuth(token, userData);
      if (userData.role === "ADMIN" || userData.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else if (userData.onboardingCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    mutation.mutate({ email, password });
  }

  const isAlreadyAuthenticated = Boolean(accessToken && user);

  return {
    email,
    setEmail,
    password,
    setPassword,
    error: mutation.error?.message ?? null,
    loading: mutation.isPending,
    handleSubmit,
    isAlreadyAuthenticated,
    role: user?.role ?? null,
  };
}
