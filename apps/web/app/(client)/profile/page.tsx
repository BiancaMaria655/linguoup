"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetLanguage: string;
  learningGoal: string;
  level: number;
  xp: number;
  streak: number;
  totalLessons: number;
  onboardingCompleted: boolean;
}

interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "Inglês", es: "Espanhol", fr: "Francês", de: "Alemão", it: "Italiano", jp: "Japonês",
};
const GOAL_NAMES: Record<string, string> = {
  work: "Trabalho", travel: "Viagem", studies: "Estudos", hobby: "Hobby", other: "Outro",
};

export default function ProfilePage() {
  const { accessToken, user, updateUser, clearAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => apiFetch("/users/me", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () => apiFetch("/achievements/me", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const updateNameMutation = useMutation({
    mutationFn: (name: string) =>
      apiFetch("/users/me", {
        method: "PATCH",
        token: accessToken ?? undefined,
        body: JSON.stringify({ name }),
      }),
    onSuccess: (_, name) => {
      updateUser({ name });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditNameOpen(false);
    },
    onError: (err) => setEditError(err instanceof Error ? err.message : "Erro ao salvar."),
  });

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "white",
            flexShrink: 0,
          }}
        >
          {isLoading ? "…" : (profile?.name ?? user?.name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              {isLoading ? "…" : profile?.name ?? user?.name}
            </h1>
            <button
              onClick={() => { setNewName(profile?.name ?? ""); setEditError(null); setEditNameOpen(true); }}
              style={{ background: "none", border: "none", color: "var(--brand-400)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit" }}
            >
              ✏️ Editar
            </button>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {isLoading ? "…" : profile?.email ?? user?.email}
          </p>
          {profile && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
              {GOAL_NAMES[profile.learningGoal] ?? profile.learningGoal} · {LANGUAGE_NAMES[profile.targetLanguage] ?? profile.targetLanguage}
            </p>
          )}
        </div>
      </div>

      {/* Level & XP */}
      {!isLoading && profile && (
        <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Nível {profile.level}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{profile.xp} XP acumulado</div>
            </div>
            <div style={{ fontSize: "1.5rem" }}>⚡</div>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${(profile.xp % 100)}%` }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
            {100 - (profile.xp % 100)} XP para o próximo nível
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "🔥", label: "Streak", value: isLoading ? "—" : `${profile?.streak ?? 0} dias` },
          { icon: "📖", label: "Lições", value: isLoading ? "—" : `${profile?.totalLessons ?? 0}` },
          { icon: "🏅", label: "Conquistas", value: isLoading ? "—" : `${unlockedAchievements.length}` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="glass" style={{ borderRadius: "var(--radius-md)", padding: "14px", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem" }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{value}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent achievements */}
      {unlockedAchievements.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Conquistas recentes</h2>
            <Link href="/progress" style={{ fontSize: "0.8rem", color: "var(--brand-400)", textDecoration: "none" }}>Ver todas</Link>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {unlockedAchievements.slice(0, 6).map((a) => (
              <div key={a.id} title={a.title} style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: "1px solid rgba(139,92,246,0.3)" }}>
                {a.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 24 }}>
        <Link href="/settings" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-primary)", textDecoration: "none", borderRadius: "var(--radius-md)", background: "var(--surface-1)", border: "1px solid var(--surface-border)", marginBottom: 8, fontWeight: 500 }}>
          <span>⚙️ Configurações</span><span style={{ color: "var(--text-muted)" }}>→</span>
        </Link>
        <Link href="/notifications" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-primary)", textDecoration: "none", borderRadius: "var(--radius-md)", background: "var(--surface-1)", border: "1px solid var(--surface-border)", marginBottom: 8, fontWeight: 500 }}>
          <span>🔔 Notificações</span><span style={{ color: "var(--text-muted)" }}>→</span>
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}
      >
        Sair da Conta
      </button>

      {/* Edit name modal */}
      {editNameOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditNameOpen(false); }}>
          <div style={{ background: "var(--surface-1)", borderRadius: "var(--radius-lg)", padding: "24px", width: "100%", maxWidth: 480, border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Editar Nome</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field"
              placeholder="Seu nome"
              style={{ marginBottom: 12 }}
            />
            {editError && <div className="feedback-incorrect" style={{ marginBottom: 12 }}>{editError}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditNameOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button
                onClick={() => updateNameMutation.mutate(newName)}
                disabled={!newName.trim() || updateNameMutation.isPending}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {updateNameMutation.isPending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
