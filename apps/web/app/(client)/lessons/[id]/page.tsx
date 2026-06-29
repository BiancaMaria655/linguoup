"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type ExerciseType = "multiple_choice" | "fill_blank" | "translation";

interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
  explanation?: string;
}

interface LessonDetail {
  id: string;
  title: string;
  topic: string;
  durationMinutes: number;
  exercises: Exercise[];
}

interface SessionState {
  current: number;
  answers: string[];
  feedbacks: boolean[];
  startTime: number;
  showFeedback: boolean;
  selectedOption: string | null;
  fillInput: string;
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: lesson, isLoading } = useQuery<LessonDetail>({
    queryKey: ["lesson", id],
    queryFn: () => apiFetch(`/lessons/${id}`, { token: accessToken ?? undefined }),
    enabled: !!accessToken && !!id,
  });

  const completeMutation = useMutation({
    mutationFn: (body: { score: number; timeSpentSeconds: number }) =>
      apiFetch(`/lessons/${id}/complete`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });

  const [session, setSession] = useState<SessionState>({
    current: 0,
    answers: [],
    feedbacks: [],
    startTime: Date.now(),
    showFeedback: false,
    selectedOption: null,
    fillInput: "",
  });

  const [showHint, setShowHint] = useState(false);

  if (isLoading) return <LessonSkeleton />;
  if (!lesson) return <div style={{ padding: 32, color: "var(--text-muted)" }}>Lição não encontrada.</div>;

  const exercise = lesson.exercises[session.current];
  const total = lesson.exercises.length;
  const progressPct = (session.current / total) * 100;
  const done = session.current >= total;

  const score = session.feedbacks.filter(Boolean).length;
  const correctPct = total > 0 ? Math.round((score / total) * 100) : 0;

  function handleAnswer(answer: string) {
    if (session.showFeedback) return;
    const isCorrect = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
    setSession((s) => ({
      ...s,
      selectedOption: answer,
      fillInput: answer,
      showFeedback: true,
      answers: [...s.answers, answer],
      feedbacks: [...s.feedbacks, isCorrect],
    }));
    setShowHint(false);
  }

  function handleNext() {
    const nextIdx = session.current + 1;
    if (nextIdx >= total) {
      const timeSpentSeconds = Math.round((Date.now() - session.startTime) / 1000);
      completeMutation.mutate({ score: correctPct, timeSpentSeconds });
      setSession((s) => ({ ...s, current: nextIdx, showFeedback: false, selectedOption: null, fillInput: "" }));
    } else {
      setSession((s) => ({ ...s, current: nextIdx, showFeedback: false, selectedOption: null, fillInput: "" }));
    }
  }

  if (done) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          background: "var(--surface-0)",
        }}
      >
        <div className="animate-fade-in-up" style={{ maxWidth: 480, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}>
          <div style={{ fontSize: "4rem" }}>{correctPct >= 80 ? "🎉" : correctPct >= 50 ? "👏" : "💪"}</div>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>Lição concluída!</h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Você acertou <strong style={{ color: "var(--text-primary)" }}>{score}</strong> de{" "}
              <strong>{total}</strong> questões.
            </p>
          </div>

          <div className="glass" style={{ width: "100%", padding: "24px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Pontuação</span>
              <span style={{ fontWeight: 700, color: correctPct >= 80 ? "var(--status-ok)" : "var(--brand-400)" }}>
                {correctPct}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Tempo</span>
              <span style={{ fontWeight: 600 }}>
                {Math.round((Date.now() - session.startTime) / 60000)}min
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>XP ganho</span>
              <span style={{ fontWeight: 700, color: "var(--brand-400)" }}>+{Math.max(10, score * 5)} XP</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <button onClick={() => router.push("/lessons")} className="btn-primary" style={{ width: "100%" }}>
              Próxima Lição →
            </button>
            <button onClick={() => router.push("/reviews")} className="btn-secondary" style={{ width: "100%" }}>
              Revisar Conteúdo
            </button>
            <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem" }}>
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMultipleChoice = exercise.type === "multiple_choice";
  const isFillBlank = exercise.type === "fill_blank";
  const isTranslation = exercise.type === "translation";
  const currentAnswer = session.selectedOption ?? session.fillInput;
  const isCorrect = session.showFeedback && currentAnswer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-0)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          borderBottom: "1px solid var(--surface-border)",
          background: "var(--surface-1)",
        }}
      >
        <button
          onClick={() => router.push("/lessons")}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem", fontFamily: "inherit" }}
          aria-label="Pausar lição"
        >
          ✕
        </button>
        <div className="progress-bar-track" style={{ flex: 1 }}>
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", flexShrink: 0 }}>
          {session.current + 1}/{total}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 600, width: "100%", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {exercise.type === "multiple_choice" ? "Múltipla escolha" : exercise.type === "fill_blank" ? "Complete a frase" : "Tradução"}
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.4 }}>
            {exercise.question}
          </h2>
        </div>

        {/* Multiple choice */}
        {isMultipleChoice && exercise.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {exercise.options.map((opt, idx) => {
              let border = "var(--surface-border)";
              let bg = "var(--surface-1)";
              if (session.showFeedback) {
                if (opt === exercise.correctAnswer) { bg = "rgba(34,197,94,0.12)"; border = "rgba(34,197,94,0.5)"; }
                else if (opt === session.selectedOption) { bg = "rgba(239,68,68,0.12)"; border = "rgba(239,68,68,0.5)"; }
              } else if (opt === session.selectedOption) {
                bg = "rgba(139,92,246,0.12)"; border = "rgba(139,92,246,0.6)";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={session.showFeedback}
                  style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", border: `1px solid ${border}`, background: bg, color: "var(--text-primary)", textAlign: "left", fontSize: "0.95rem", cursor: session.showFeedback ? "default" : "pointer", transition: "all 0.15s ease", fontFamily: "inherit" }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Fill in blank / Translation */}
        {(isFillBlank || isTranslation) && (
          <div>
            <input
              type="text"
              value={session.fillInput}
              onChange={(e) => setSession((s) => ({ ...s, fillInput: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter" && !session.showFeedback && session.fillInput.trim()) handleAnswer(session.fillInput); }}
              disabled={session.showFeedback}
              placeholder={isFillBlank ? "Complete a frase…" : "Digite a tradução…"}
              className="input-field"
              autoFocus
            />
            {!session.showFeedback && session.fillInput.trim() && (
              <button onClick={() => handleAnswer(session.fillInput)} className="btn-primary" style={{ width: "100%", marginTop: 12 }}>
                Verificar
              </button>
            )}
          </div>
        )}

        {/* Hint */}
        {exercise.hint && !session.showFeedback && (
          <button
            onClick={() => setShowHint((h) => !h)}
            style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--brand-400)", cursor: "pointer", fontSize: "0.875rem", fontFamily: "inherit" }}
          >
            💡 {showHint ? "Esconder dica" : "Ver dica"}
          </button>
        )}
        {showHint && exercise.hint && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            💡 {exercise.hint}
          </div>
        )}

        {/* Feedback */}
        {session.showFeedback && (
          <div className={isCorrect ? "feedback-correct" : "feedback-incorrect"}>
            <div style={{ fontWeight: 700, marginBottom: isCorrect ? 0 : 6 }}>
              {isCorrect ? "✅ Correto!" : "❌ Incorreto"}
            </div>
            {!isCorrect && (
              <div style={{ fontSize: "0.875rem" }}>
                Resposta correta: <strong>{exercise.correctAnswer}</strong>
                {exercise.explanation && <div style={{ marginTop: 6, opacity: 0.85 }}>{exercise.explanation}</div>}
              </div>
            )}
          </div>
        )}

        {/* Next button */}
        {session.showFeedback && (
          <button onClick={handleNext} className="btn-primary" style={{ width: "100%" }}>
            {session.current + 1 < total ? "Continuar →" : "Ver resultado →"}
          </button>
        )}
      </div>
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-0)" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--surface-border)", display: "flex", gap: 16 }}>
        <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 4 }} />
        <div className="skeleton" style={{ flex: 1, height: 8, borderRadius: "var(--radius-full)", alignSelf: "center" }} />
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="skeleton" style={{ height: 32, width: "70%", borderRadius: 6 }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius-md)" }} />
        ))}
      </div>
    </div>
  );
}
