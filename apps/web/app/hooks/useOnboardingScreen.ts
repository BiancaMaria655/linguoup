"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type Step = "goal" | "language" | "availability" | "plan";

interface OnboardingState {
  learningGoal: string;
  targetLanguage: string;
  dailyMinutes: number;
  preferredStudyTime: string;
}

interface OnboardingPayload {
  learningGoal: string;
  targetLanguage: string;
  dailyGoalMinutes: number;
  preferredStudyTime: string | null;
}

const STEPS: Step[] = ["goal", "language", "availability", "plan"];

async function saveOnboarding(
  payload: OnboardingPayload,
  token: string
): Promise<void> {
  await apiFetch("/users/me/onboarding", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function useOnboardingScreen() {
  const router = useRouter();
  const { accessToken, user, updateUser } = useAuthStore();
  const [step, setStep] = useState<Step>("goal");
  const [state, setState] = useState<OnboardingState>({
    learningGoal: "",
    targetLanguage: "",
    dailyMinutes: 10,
    preferredStudyTime: "MORNING",
  });

  const currentIndex = STEPS.indexOf(step);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  const mutation = useMutation({
    mutationFn: () =>
      saveOnboarding(
        {
          learningGoal: state.learningGoal,
          targetLanguage: state.targetLanguage,
          dailyGoalMinutes: state.dailyMinutes,
          preferredStudyTime: state.preferredStudyTime,
        },
        accessToken ?? ""
      ),
    onSuccess() {
      updateUser({
        onboardingCompleted: true,
        learningGoal: state.learningGoal,
        targetLanguage: state.targetLanguage,
        dailyGoalMinutes: state.dailyMinutes,
      });
      router.push("/assessment");
    },
  });

  function update<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function next() {
    const nextStep = STEPS[currentIndex + 1];
    if (nextStep) setStep(nextStep);
  }

  function back() {
    const prevStep = STEPS[currentIndex - 1];
    if (prevStep) setStep(prevStep);
  }

  function handleCreatePlan() {
    if (!accessToken) return;
    mutation.mutate();
  }

  const isAlreadyCompleted = Boolean(user?.onboardingCompleted);

  return {
    step,
    state,
    update,
    next,
    back,
    handleCreatePlan,
    currentIndex,
    progress,
    steps: STEPS,
    saving: mutation.isPending,
    error: mutation.error?.message ?? null,
    isAlreadyCompleted,
  };
}
