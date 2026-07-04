"use client";

import Link from "next/link";
import { useState } from "react";
import { useLessons, type Level } from "@/app/hooks/useLessons";

const LEVEL_LABELS: Record<string, string> = {
  all: "Todos",
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "rgba(34,197,94,0.15)",
  intermediate: "rgba(139,92,246,0.15)",
  advanced: "rgba(245,158,11,0.15)",
};

const LEVEL_TEXT_COLORS: Record<string, string> = {
  beginner: "#86efac",
  intermediate: "var(--brand-300)",
  advanced: "#fcd34d",
};

export default function LessonsPage() {
  const [filter, setFilter] = useState<Level>("all");

  const { trails, isLoading } = useLessons(filter);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>Trilhas</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Explore trilhas de aprendizado organizadas por nível.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {(["all", "beginner", "intermediate", "advanced"] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              border: `1px solid ${filter === l ? "rgba(139,92,246,0.6)" : "var(--surface-border)"}`,
              background: filter === l ? "rgba(139,92,246,0.15)" : "transparent",
              color: filter === l ? "var(--brand-300)" : "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: filter === l ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
            }}
          >
            {LEVEL_LABELS[l]}
          </button>
        ))}
      </div>

      {/* Trail list */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      ) : trails.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>📚</div>
          <div>Nenhuma trilha encontrada.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {trails.map((trail) => {
            const pct = trail.totalLessons > 0
              ? Math.round((trail.completedLessons / trail.totalLessons) * 100)
              : 0;
            return (
              <Link
                key={trail.id}
                href={`/lessons/trail/${trail.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="glass"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "var(--radius-md)",
                      background: LEVEL_COLORS[trail.level],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      flexShrink: 0,
                    }}
                  >
                    {trail.icon || "📖"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem" }}>{trail.title}</span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          background: LEVEL_COLORS[trail.level],
                          color: LEVEL_TEXT_COLORS[trail.level],
                        }}
                      >
                        {LEVEL_LABELS[trail.level]}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 10, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {trail.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="progress-bar-track" style={{ flex: 1, height: 6 }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>
                        {trail.completedLessons}/{trail.totalLessons} lições
                      </span>
                    </div>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "1.2rem", alignSelf: "center" }}>→</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
