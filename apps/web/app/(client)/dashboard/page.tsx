"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface HomeData {
  streak: number;
  xp: number;
  level: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
  nextLesson: { id: string; title: string; topic: string; durationMinutes: number } | null;
  pendingReviews: number;
}

export default function DashboardPage() {
  const { accessToken, user } = useAuthStore();

  const { data, isLoading } = useQuery<HomeData>({
    queryKey: ["home"],
    queryFn: () => apiFetch("/users/me/home", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.name.split(" ")[0] ?? "Aluno";

  const progressPct = data
    ? Math.min(100, Math.round((data.todayMinutes / data.dailyGoalMinutes) * 100))
    : 0;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
          {greeting}, {firstName}! 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
          Pronto para aprender hoje?
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard
          loading={isLoading}
          icon="🔥"
          label="Streak"
          value={isLoading ? "—" : `${data?.streak ?? 0} dias`}
          color="var(--status-pending)"
        />
        <StatCard
          loading={isLoading}
          icon="⚡"
          label="XP Total"
          value={isLoading ? "—" : `${data?.xp ?? 0} XP`}
          color="var(--brand-400)"
        />
        <StatCard
          loading={isLoading}
          icon="🏆"
          label="Nível"
          value={isLoading ? "—" : `Nível ${data?.level ?? 1}`}
          color="var(--status-ok)"
        />
      </div>

      {/* Daily goal progress */}
      <div
        className="glass"
        style={{ borderRadius: "var(--radius-lg)", padding: "20px", marginBottom: 20 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Meta diária</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {isLoading ? "—" : `${data?.todayMinutes ?? 0} / ${data?.dailyGoalMinutes ?? 10} min`}
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: progressPct >= 100 ? "var(--status-ok)" : "var(--brand-400)" }}>
            {progressPct}%
          </div>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Continue lesson */}
      {(isLoading || data?.nextLesson) && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Continuar de onde parou</h2>
          {isLoading ? (
            <SkeletonLessonCard />
          ) : data?.nextLesson ? (
            <Link
              href={`/lessons/${data.nextLesson.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="glass"
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>
                    {data.nextLesson.title}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {data.nextLesson.topic} · {data.nextLesson.durationMinutes} min
                  </div>
                </div>
                <div
                  className="btn-primary"
                  style={{ padding: "8px 18px", fontSize: "0.85rem", borderRadius: "var(--radius-full)" }}
                >
                  Continuar →
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      )}

      {/* Pending reviews */}
      {(isLoading || (data?.pendingReviews ?? 0) > 0) && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Revisões pendentes</h2>
          {isLoading ? (
            <div className="skeleton" style={{ height: 72, borderRadius: "var(--radius-lg)" }} />
          ) : (
            <Link href="/reviews" style={{ textDecoration: "none" }}>
              <div
                className="glass"
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                  }}
                >
                  🔄
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {data?.pendingReviews} item{data?.pendingReviews !== 1 ? "s" : ""} para revisar
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Repetição espaçada — reforce o que aprendeu
                  </div>
                </div>
                <div style={{ marginLeft: "auto", color: "var(--brand-400)", fontSize: "1.2rem" }}>→</div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Quick access */}
      <div>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Acessar</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/lessons", icon: "📚", label: "Trilhas de Aprendizado" },
            { href: "/progress", icon: "📊", label: "Meu Progresso" },
            { href: "/profile", icon: "🏅", label: "Conquistas" },
            { href: "/settings", icon: "⚙️", label: "Configurações" },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-1)",
                border: "1px solid var(--surface-border)",
                transition: "all 0.15s ease",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>{icon}</span>
              <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, loading }: { icon: string; label: string; value: string; color: string; loading: boolean }) {
  return (
    <div
      className="glass"
      style={{ borderRadius: "var(--radius-md)", padding: "16px", display: "flex", flexDirection: "column", gap: 6 }}
    >
      <div style={{ fontSize: "1.4rem" }}>{icon}</div>
      {loading ? (
        <div className="skeleton" style={{ height: 20, width: "70%", borderRadius: 4 }} />
      ) : (
        <div style={{ fontWeight: 700, fontSize: "1rem", color }}>{value}</div>
      )}
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function SkeletonLessonCard() {
  return (
    <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div className="skeleton" style={{ height: 18, width: "60%", borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 4 }} />
      </div>
      <div className="skeleton" style={{ height: 36, width: 100, borderRadius: "var(--radius-full)" }} />
    </div>
  );
}
