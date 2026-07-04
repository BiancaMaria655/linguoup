"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  useLessonExecution,
  type Exercise,
  type LessonDetail,
} from "@/app/hooks/useLessonExecution";

// ── Types ────────────────────────────────────────────────────────────────

interface CompleteResponse {
  data: {
    xpAwarded: number;
    newAchievements: string[];
    currentStreak: number;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// ── Page ─────────────────────────────────────────────────────────────────

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

  const {
    session,
    elapsedSeconds,
    showHint,
    score,
    handleAnswer,
    handleNext,
    setShowHint,
    setFillInput,
  } = useLessonExecution();

  const completeMutation = useMutation<
    CompleteResponse,
    Error,
    { score: number; timeSpentSeconds: number }
  >({
    mutationFn: (body) =>
      apiFetch<CompleteResponse>(`/lessons/${id}/complete`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["xp"] });
    },
  });

  // Achievements query — enabled only when lesson is done
  const total = lesson?.exercises?.length ?? 0;
  const isDone = session.current >= total && total > 0;

  const achievementsQuery = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () =>
      apiFetch<Achievement[]>("/achievements", {
        token: accessToken ?? undefined,
      }),
    enabled: !!accessToken && isDone,
  });

  if (isLoading) return <LessonSkeleton />;
  if (!lesson || !lesson.exercises?.length)
    return (
      <div style={{ padding: 32, color: "var(--text-muted)" }}>
        Lição não encontrada.
      </div>
    );

  const exercise: Exercise = lesson.exercises[session.current];
  const progressPct = (session.current / total) * 100;

  const score2 = session.feedbacks.filter(Boolean).length;
  const correctPct =
    session.feedbacks.length > 0
      ? Math.round((score2 / session.feedbacks.length) * 100)
      : 0;

  // ── Result screen ──────────────────────────────────────────────────────
  if (isDone) {
    const xpAwarded = completeMutation.data?.data?.xpAwarded ?? Math.max(10, score * 5);
    const currentStreak = completeMutation.data?.data?.currentStreak ?? null;
    const achievements = achievementsQuery.data ?? [];
    const achievementsLoading = achievementsQuery.isFetching;

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
        <div
          className="animate-fade-in-up"
          style={{
            maxWidth: 480,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            textAlign: "center",
          }}
        >
          {/* Motivational emoji */}
          <div style={{ fontSize: "4rem" }}>
            {correctPct >= 80 ? "🎉" : correctPct >= 50 ? "👏" : "💪"}
          </div>

          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>
              Lição concluída!
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Você acertou{" "}
              <strong style={{ color: "var(--text-primary)" }}>{score2}</strong>{" "}
              de <strong>{total}</strong> questões.
            </p>
          </div>

          {/* Stats glass panel */}
          <div
            className="glass"
            style={{
              width: "100%",
              padding: "24px",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Pontuação
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color:
                    correctPct >= 80
                      ? "var(--status-ok)"
                      : "var(--brand-400)",
                }}
              >
                {correctPct}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Tempo
              </span>
              <span style={{ fontWeight: 600 }}>
                {Math.floor(elapsedSeconds / 60)}min {elapsedSeconds % 60}s
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                XP ganho
              </span>
              <span
                className="xp-counter"
                style={
                  {
                    fontWeight: 700,
                    color: "var(--brand-400)",
                    fontSize: "1.1rem",
                    "--xp-target": xpAwarded,
                  } as React.CSSProperties
                }
              >
                +{xpAwarded} XP
              </span>
            </div>
            {currentStreak !== null && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Streak atual
                </span>
                <span style={{ fontWeight: 600 }}>🔥 {currentStreak} dias</span>
              </div>
            )}
          </div>

          {/* Achievements */}
          {achievementsLoading ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 52, borderRadius: "var(--radius-md)" }}
                />
              ))}
            </div>
          ) : achievements.length > 0 ? (
            <div style={{ width: "100%", textAlign: "left" }}>
              <p
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                }}
              >
                Conquistas desbloqueadas
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="glass animate-fade-in-up"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{ach.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {ach.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "100%",
            }}
          >
            <button
              onClick={() => router.push("/lessons")}
              className="btn-primary"
              style={{ width: "100%" }}
              id="btn-next-lesson"
            >
              Próxima Lição →
            </button>
            <button
              onClick={() => router.push("/reviews")}
              className="btn-secondary"
              style={{ width: "100%" }}
              id="btn-review-content"
            >
              Revisar Conteúdo
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              id="btn-back-home"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.875rem",
              }}
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Execution screen ───────────────────────────────────────────────────
  const isMultipleChoice = exercise.type === "multiple_choice";
  const isFillBlank = exercise.type === "fill_blank";
  const isTranslation = exercise.type === "translation";
  const currentAnswer = session.selectedOption ?? session.fillInput;
  const isCorrect =
    session.showFeedback &&
    currentAnswer.trim().toLowerCase() ===
      exercise.correctAnswer.trim().toLowerCase();

  function onAnswer(answer: string) {
    handleAnswer(answer, exercise.correctAnswer);
  }

  function onNext() {
    handleNext(total, (pct, timeSpent) => {
      completeMutation.mutate({ score: pct, timeSpentSeconds: timeSpent });
    });
  }

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
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "1.2rem",
            fontFamily: "inherit",
          }}
          aria-label="Pausar lição"
        >
          ✕
        </button>
        <div className="progress-bar-track" style={{ flex: 1 }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span
          style={{ fontSize: "0.8rem", color: "var(--text-muted)", flexShrink: 0 }}
        >
          {session.current + 1}/{total}
        </span>
        {/* Timer display */}
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.02em",
          }}
          aria-label="Tempo decorrido"
        >
          ⏱ {formatTime(elapsedSeconds)}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          maxWidth: 600,
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {exercise.type === "multiple_choice"
              ? "Múltipla escolha"
              : exercise.type === "fill_blank"
              ? "Complete a frase"
              : "Tradução"}
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
                if (opt === exercise.correctAnswer) {
                  bg = "rgba(34,197,94,0.12)";
                  border = "rgba(34,197,94,0.5)";
                } else if (opt === session.selectedOption) {
                  bg = "rgba(239,68,68,0.12)";
                  border = "rgba(239,68,68,0.5)";
                }
              } else if (opt === session.selectedOption) {
                bg = "rgba(139,92,246,0.12)";
                border = "rgba(139,92,246,0.6)";
              }
              return (
                <button
                  key={idx}
                  onClick={() => onAnswer(opt)}
                  disabled={session.showFeedback}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${border}`,
                    background: bg,
                    color: "var(--text-primary)",
                    textAlign: "left",
                    fontSize: "0.95rem",
                    cursor: session.showFeedback ? "default" : "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                  }}
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
              onChange={(e) => setFillInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !session.showFeedback &&
                  session.fillInput.trim()
                )
                  onAnswer(session.fillInput);
              }}
              disabled={session.showFeedback}
              placeholder={isFillBlank ? "Complete a frase…" : "Digite a tradução…"}
              className="input-field"
              autoFocus
            />
            {!session.showFeedback && session.fillInput.trim() && (
              <button
                onClick={() => onAnswer(session.fillInput)}
                className="btn-primary"
                style={{ width: "100%", marginTop: 12 }}
              >
                Verificar
              </button>
            )}
          </div>
        )}

        {/* Hint button */}
        {exercise.hint && !session.showFeedback && (
          <button
            onClick={() => setShowHint((h) => !h)}
            style={{
              alignSelf: "flex-start",
              background: "none",
              border: "none",
              color: "var(--brand-400)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontFamily: "inherit",
            }}
          >
            💡 {showHint ? "Esconder dica" : "Ver dica"}
          </button>
        )}
        {showHint && exercise.hint && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
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
                Resposta correta:{" "}
                <strong>{exercise.correctAnswer}</strong>
                {exercise.explanation && (
                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                    {exercise.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Next button */}
        {session.showFeedback && (
          <button onClick={onNext} className="btn-primary" style={{ width: "100%" }}>
            {session.current + 1 < total ? "Continuar →" : "Ver resultado →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function LessonSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-0)" }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--surface-border)",
          display: "flex",
          gap: 16,
        }}
      >
        <div
          className="skeleton"
          style={{ width: 24, height: 24, borderRadius: 4 }}
        />
        <div
          className="skeleton"
          style={{
            flex: 1,
            height: 8,
            borderRadius: "var(--radius-full)",
            alignSelf: "center",
          }}
        />
      </div>
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          className="skeleton"
          style={{ height: 32, width: "70%", borderRadius: 6 }}
        />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 52, borderRadius: "var(--radius-md)" }}
          />
        ))}
      </div>
    </div>
  );
}
