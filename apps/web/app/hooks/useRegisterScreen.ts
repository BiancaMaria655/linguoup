"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface RegisterPayload {
  name: string;
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

async function registerAndFetchProfile(payload: RegisterPayload): Promise<AuthUser & { accessToken: string }> {
  await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...payload, tenant_id: "tenant_default_123" }),
  });
  const loginData = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: payload.email, password: payload.password }),
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

export function useRegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { accessToken, user } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: registerAndFetchProfile,
    onSuccess(data) {
      const { accessToken: token, ...userData } = data;
      setAuth(token, userData);
      router.push("/onboarding");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 8) return; // inline validation before API call
    mutation.mutate({ name, email, password });
  }

  const isAlreadyAuthenticated = Boolean(accessToken && user);

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error: mutation.error?.message ?? null,
    loading: mutation.isPending,
    handleSubmit,
    isAlreadyAuthenticated,
  };
}
