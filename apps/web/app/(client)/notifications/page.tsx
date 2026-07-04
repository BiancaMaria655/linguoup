"use client";

import { useNotificationsScreen } from "@/app/hooks/useNotificationsScreen";
import type { Notification } from "@/app/hooks/useNotificationsScreen";

// ── Constants ──────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<Notification["type"], string> = {
  achievement: "🏆",
  streak: "🔥",
  reminder: "⏰",
  system: "📢",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    isMarkingAllRead,
  } = useNotificationsScreen();

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>
            Notificações
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(139,92,246,0.2)",
                  color: "var(--brand-300)",
                  verticalAlign: "middle",
                }}
              >
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Seus lembretes e atualizações.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={isMarkingAllRead}
            style={{ background: "none", border: "none", color: "var(--brand-400)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit" }}
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-md)" }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔔</div>
          <div>Nenhuma notificação ainda.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map((n: Notification) => (
            <div
              key={n.id}
              style={{
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${!n.read ? "rgba(139,92,246,0.3)" : "var(--surface-border)"}`,
                background: !n.read ? "rgba(139,92,246,0.06)" : "var(--surface-1)",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              >
                {TYPE_ICONS[n.type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>{n.message}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {new Date(n.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit", flexShrink: 0 }}
                >
                  Lida
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
