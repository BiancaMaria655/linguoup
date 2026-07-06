"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface SubmitPayload {
  answers: { questionId: string; answer: string }[];
}

// Static fallback questions used when the API is unavailable
export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "What is the English translation of 'Obrigado'?",
    options: ["Please", "Thank you", "Sorry", "Hello"],
    correctIndex: 1,
  },
  {
    id: "q2",
    text: "Choose the correct sentence:",
    options: [
      "She don't like coffee.",
      "She doesn't likes coffee.",
      "She doesn't like coffee.",
      "She not like coffee.",
    ],
    correctIndex: 2,
  },
  {
    id: "q3",
    text: "What does 'Bom dia' mean in English?",
    options: ["Good afternoon", "Good evening", "Good night", "Good morning"],
    correctIndex: 3,
  },
  {
    id: "q4",
    text: "Fill in the blank: 'I ___ to the store yesterday.'",
    options: ["go", "gone", "went", "going"],
    correctIndex: 2,
  },
  {
    id: "q5",
    text: "Which word means 'rápido' in English?",
    options: ["Slow", "Fast", "Big", "Small"],
    correctIndex: 1,
  },
];

export function useAssessmentScreen() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [done, setDone] = useState(false);

  // Fetch questions from API with fallback to static
  const questionsQuery = useQuery<Question[]>({
    queryKey: ["assessment-questions"],
    queryFn: async () => {
      const data = await apiFetch<{ questions: Question[]; estimatedMinutes: number }>("/lessons/assessment", {
        token: accessToken ?? undefined,
      });
      // Use API data only if it's a non-empty array
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
      return SAMPLE_QUESTIONS;
    },
    initialData: SAMPLE_QUESTIONS,
    retry: 1,
  });

  const questions = questionsQuery.data ?? SAMPLE_QUESTIONS;

  const submitMutation = useMutation({
    mutationFn: (payload: SubmitPayload) =>
      apiFetch("/lessons/assessment/submit", {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify(payload),
      }),
    // Non-blocking: errors are silently ignored per spec
  });

  function handleSelect(idx: number) {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (current + 1 >= questions.length) {
      setDone(true);
      submitMutation.mutate({
        answers: newAnswers.map((a, i) => ({
          questionId: questions[i].id,
          answer: questions[i].options[a],
        })),
      });
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  function handleGoToDashboard() {
    router.push("/dashboard");
  }

  const question = questions[current];
  const isCorrect = selected === question?.correctIndex;
  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const progress = (current / questions.length) * 100;
  const level = score >= 4 ? "Intermediário" : score >= 2 ? "Básico" : "Iniciante";
  const levelEmoji = score >= 4 ? "🚀" : score >= 2 ? "📚" : "🌱";
  const saving = submitMutation.isPending;

  return {
    questions,
    current,
    selected,
    showFeedback,
    done,
    question,
    isCorrect,
    score,
    progress,
    level,
    levelEmoji,
    saving,
    handleSelect,
    handleNext,
    handleSkip,
    handleGoToDashboard,
  };
}
