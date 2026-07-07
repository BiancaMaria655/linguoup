"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useStreakScreen, StreakData } from "@/app/hooks/useStreakScreen";

type Period = "7" | "30" | "90";

export default function ProgressPage() {
  const { accessToken } = useAuthStore();
  const [period, setPeriod] = useState<Period>("30");

  const { data: progress, isLoading: progressLoading } = useQuery<StreakData>({
    queryKey: ["progress", period],
    queryFn: () => apiFetch(`/progress?days=${period}`, { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const {
    streak,
    bestStreak,
    dailyGoalMinutes,
    calendarDays,
    dailyActivity,
    showGoalModal,
    newGoal,
    setNewGoal,
    openGoalModal,
    closeGoalModal,
    updateGoal,
    isUpdatingGoal,
  } = useStreakScreen(progress);

  const maxMinutes = Math.max(...(dailyActivity.map((d) => d.minutes) ?? [1]), 1);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>Progresso</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Acompanhe sua evolução no aprendizado.
        </p>
      </div>

      {/* Period filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {([["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"]] as [Period, string][]).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setPeriod(v)}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              border: `1px solid ${period === v ? "rgba(139,92,246,0.6)" : "var(--surface-border)"}`,
              background: period === v ? "rgba(139,92,246,0.15)" : "transparent",
              color: period === v ? "var(--brand-300)" : "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: period === v ? 600 : 400,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "📖", label: "Lições concluídas", value: progressLoading ? "—" : `${progress?.totalLessons ?? 0}` },
          { icon: "⏱", label: "Minutos estudados", value: progressLoading ? "—" : `${progress?.totalMinutes ?? 0}` },
          { icon: "🔤", label: "Vocabulário aprendido", value: progressLoading ? "—" : `${progress?.vocabulary ?? 0}` },
          { icon: "🔥", label: "Melhor sequência", value: progressLoading ? "—" : `${bestStreak} dias` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="glass" style={{ borderRadius: "var(--radius-md)", padding: "16px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: "1.4rem" }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>{value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Atividade diária (minutos)</div>
        {progressLoading ? (
          <div className="skeleton" style={{ height: 80, borderRadius: "var(--radius-sm)" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, overflowX: "auto" }}>
            {dailyActivity.slice(-30).map((d) => {
              const h = Math.max(4, Math.round((d.minutes / maxMinutes) * 72));
              return (
                <div
                  key={d.date}
                  title={`${new Date(d.date).toLocaleDateString("pt-BR")}: ${d.minutes}min`}
                  style={{
                    flexShrink: 0,
                    width: 8,
                    height: h,
                    borderRadius: 4,
                    background: d.minutes > 0 ? "linear-gradient(180deg, #a78bfa, #7c3aed)" : "var(--surface-3)",
                    transition: "height 0.3s ease",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Streak & Goal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {/* Streak */}
        <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>🔥</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--status-pending)", lineHeight: 1 }}>
            {progressLoading ? "—" : streak}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4 }}>Sequência atual</div>
        </div>

        {/* Daily goal */}
        <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: "2rem" }}>🎯</div>
            <button
              onClick={openGoalModal}
              style={{ background: "none", border: "none", color: "var(--brand-400)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit" }}
            >
              Alterar
            </button>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--brand-400)", lineHeight: 1, marginTop: 4 }}>
            {progressLoading ? "—" : dailyGoalMinutes}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4 }}>min/dia</div>
        </div>
      </div>

      {/* Streak calendar */}
      <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px", marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Calendário de atividades</div>
        {progressLoading ? (
          <div className="skeleton" style={{ height: 60, borderRadius: "var(--radius-sm)" }} />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {calendarDays.map((day) => (
              <div
                key={day.date}
                title={new Date(day.date).toLocaleDateString("pt-BR")}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: day.active ? "var(--brand-500)" : "var(--surface-3)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goal modal */}
      {showGoalModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeGoalModal(); }}
        >
          <div
            style={{ background: "var(--surface-1)", borderRadius: "var(--radius-lg)", padding: "24px", width: "100%", maxWidth: 480, border: "1px solid var(--surface-border)" }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Alterar Meta Diária</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 20 }}>
              {newGoal} minutos por dia
            </p>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={newGoal}
              onChange={(e) => setNewGoal(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--brand-500)", marginBottom: 20 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={closeGoalModal} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={() => updateGoal(newGoal)} disabled={isUpdatingGoal} className="btn-primary" style={{ flex: 1 }}>
                {isUpdatingGoal ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
