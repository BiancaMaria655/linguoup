"use client";

import { useAuthStore } from "@/store/authStore";
import { useProfileScreen, type Achievement } from "@/app/hooks/useProfileScreen";

// ── Constants ──────────────────────────────────────────────────────────────

const LANGUAGE_NAMES: Record<string, string> = {
  en: "Inglês", es: "Espanhol", fr: "Francês", de: "Alemão", it: "Italiano", jp: "Japonês",
};
const GOAL_NAMES: Record<string, string> = {
  CAREER: "Trabalho", TRAVEL: "Viagem", EXAM: "Estudos", CULTURE: "Cultura",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuthStore();
  const {
    profile,
    achievements,
    level,
    xp,
    xpProgress,
    xpForNext,
    isLoading,
    xpLoading,
    achievementsLoading,
    editNameOpen,
    newName,
    editError,
    setNewName,
    openEditModal,
    closeEditModal,
    saveName,
    isSavingName,
    logout,
  } = useProfileScreen();

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
              onClick={openEditModal}
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

      {/* Level & XP — skeleton or data */}
      {xpLoading ? (
        <div className="skeleton" style={{ height: 96, borderRadius: "var(--radius-lg)", marginBottom: 20 }} />
      ) : (
        <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Nível {level}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{xp} XP acumulado</div>
            </div>
            <div style={{ fontSize: "1.5rem" }}>⚡</div>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
            {xpForNext} XP para o próximo nível
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "🔥", label: "Streak", value: isLoading ? "—" : `${profile?.streak ?? 0} dias` },
          { icon: "📖", label: "Lições", value: isLoading ? "—" : `${profile?.totalLessons ?? 0}` },
          { icon: "🏅", label: "Conquistas", value: achievementsLoading ? "—" : `${achievements.filter((a: Achievement) => a.unlocked).length}` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="glass" style={{ borderRadius: "var(--radius-md)", padding: "14px", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem" }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{value}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Achievements grid — skeleton or full grid */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Conquistas</h2>
        {achievementsLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🏅</div>
            <div>Conquistas serão desbloqueadas conforme você avança!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
            {achievements.map((a: Achievement) => (
              <div
                key={a.id}
                title={a.unlocked ? `${a.title} — ${a.description}` : `Bloqueado: ${a.criteria}`}
                style={{
                  padding: "12px 8px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--surface-border)",
                  background: a.unlocked ? "var(--surface-1)" : "var(--surface-0)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  opacity: a.unlocked ? 1 : 0.4,
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: "1.75rem" }}>{a.icon}</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, textAlign: "center", color: a.unlocked ? "var(--text-primary)" : "var(--text-muted)", lineHeight: 1.2 }}>
                  {a.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 24 }}>
        <a href="/settings" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-primary)", textDecoration: "none", borderRadius: "var(--radius-md)", background: "var(--surface-1)", border: "1px solid var(--surface-border)", marginBottom: 8, fontWeight: 500 }}>
          <span>⚙️ Configurações</span><span style={{ color: "var(--text-muted)" }}>→</span>
        </a>
        <a href="/notifications" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-primary)", textDecoration: "none", borderRadius: "var(--radius-md)", background: "var(--surface-1)", border: "1px solid var(--surface-border)", marginBottom: 8, fontWeight: 500 }}>
          <span>🔔 Notificações</span><span style={{ color: "var(--text-muted)" }}>→</span>
        </a>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}
      >
        Sair da Conta
      </button>

      {/* Edit name modal */}
      {editNameOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}>
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
              <button onClick={closeEditModal} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button
                onClick={saveName}
                disabled={!newName.trim() || isSavingName}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {isSavingName ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
