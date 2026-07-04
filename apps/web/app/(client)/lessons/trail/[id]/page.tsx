"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTrailDetail } from "@/app/hooks/useTrailDetail";

export default function TrailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { trail, isLoading } = useTrailDetail(id);

  const nextLesson = trail?.lessons.find((l) => l.status === "next");

  if (isLoading) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
        <div className="skeleton" style={{ height: 32, width: "60%", borderRadius: 6, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 20, width: "80%", borderRadius: 4, marginBottom: 32 }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-md)", marginBottom: 10 }} />
        ))}
      </div>
    );
  }

  if (!trail) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>Trilha não encontrada.</div>
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>
          A trilha que você procura não existe ou não está disponível.
        </p>
        <Link
          href="/lessons"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: "var(--radius-full)",
            background: "var(--brand-600)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          ← Voltar ao catálogo
        </Link>
      </div>
    );
  }


  const pct = trail.totalLessons > 0
    ? Math.round((trail.completedLessons / trail.totalLessons) * 100)
    : 0;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.875rem", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
      >
        ← Trilhas
      </button>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>{trail.title}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 16 }}>{trail.description}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="progress-bar-track" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", flexShrink: 0 }}>
            {trail.completedLessons}/{trail.totalLessons} concluídas
          </span>
        </div>
      </div>

      {/* Start button */}
      {nextLesson && (
        <Link href={`/lessons/${nextLesson.id}`} className="btn-primary" style={{ display: "flex", marginBottom: 24 }}>
          Iniciar próxima lição →
        </Link>
      )}

      {/* Lesson list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {trail.lessons.map((lesson, idx) => {
          const isCompleted = lesson.status === "completed";
          const isNext = lesson.status === "next";
          const isLocked = lesson.status === "locked";

          return (
            <div
              key={lesson.id}
              style={{
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${isNext ? "rgba(139,92,246,0.4)" : "var(--surface-border)"}`,
                background: isNext ? "rgba(139,92,246,0.06)" : isCompleted ? "var(--surface-1)" : "rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isCompleted ? "rgba(34,197,94,0.2)" : isNext ? "rgba(139,92,246,0.2)" : "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  flexShrink: 0,
                }}
              >
                {isCompleted ? "✅" : isLocked ? "🔒" : idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{lesson.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {lesson.topic} · {lesson.durationMinutes} min
                </div>
              </div>
              {!isLocked && (
                <Link
                  href={`/lessons/${lesson.id}`}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    background: isNext ? "var(--brand-600)" : "transparent",
                    border: `1px solid ${isNext ? "transparent" : "var(--surface-border)"}`,
                    color: isNext ? "white" : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? "Revisar" : "Iniciar"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
