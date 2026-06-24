"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

// ── Types ────────────────────────────────────────────────
type ServiceStatus = "ok" | "error" | "pending";

interface InfraStatus {
  api: ServiceStatus;
  database: ServiceStatus;
  redis: ServiceStatus;
  apiLatency?: number;
  dbLatency?: number;
  redisLatency?: number;
  lastChecked?: string;
}

// ── Status Badge ─────────────────────────────────────────
function StatusDot({ status }: { status: ServiceStatus }) {
  const colors: Record<ServiceStatus, string> = {
    ok: "var(--status-ok)",
    error: "var(--status-error)",
    pending: "var(--status-pending)",
  };

  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: colors[status],
        boxShadow: `0 0 6px ${colors[status]}`,
        flexShrink: 0,
      }}
      className={status === "pending" ? "animate-pulse-ring" : ""}
    />
  );
}

function StatusCard({
  label,
  status,
  latency,
  delay,
}: {
  label: string;
  status: ServiceStatus;
  latency?: number;
  delay: number;
}) {
  const labels: Record<ServiceStatus, string> = {
    ok: "Operacional",
    error: "Falha",
    pending: "Verificando…",
  };

  return (
    <div
      className="animate-fade-in-up glass"
      style={{
        animationDelay: `${delay}ms`,
        borderRadius: "var(--radius-md)",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StatusDot status={status} />
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {latency !== undefined && status === "ok" && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {latency}ms
          </span>
        )}
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color:
              status === "ok"
                ? "var(--status-ok)"
                : status === "error"
                ? "var(--status-error)"
                : "var(--status-pending)",
          }}
        >
          {labels[status]}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infra, setInfra] = useState<InfraStatus>({
    api: "pending",
    database: "pending",
    redis: "pending",
  });

  // ── Health check ──────────────────────────────────────
  const checkHealth = useCallback(async () => {
    setInfra((prev) => ({ ...prev, api: "pending", database: "pending", redis: "pending" }));
    try {
      const res = await fetch(`${API_URL}/api/v1/health`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setInfra({ api: "error", database: "error", redis: "error" });
        return;
      }
      const json = await res.json();
      const d = json.data;
      setInfra({
        api: d.api.status,
        database: d.database.status,
        redis: d.redis.status,
        apiLatency: 0,
        dbLatency: d.database.latencyMs,
        redisLatency: d.redis.latencyMs,
        lastChecked: new Date(d.timestamp).toLocaleTimeString("pt-BR"),
      });
    } catch {
      setInfra({ api: "error", database: "error", redis: "error" });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // ── Login ─────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg =
          json?.message ||
          (res.status === 401
            ? "E-mail ou senha incorretos."
            : "Erro ao realizar login. Tente novamente.");
        setError(msg);
        return;
      }

      // Sucesso — accessToken disponível em json.data.accessToken
      // Por ora só exibe confirmação visual; rota de dashboard será adicionada depois
      setError(null);
      alert(`✅ Login bem-sucedido!\nToken: ${json.data.accessToken.slice(0, 32)}…`);
    } catch {
      setError("Não foi possível conectar à API. Verifique se o servidor está ativo.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        background: "var(--surface-0)",
      }}
    >
      {/* Orbs de fundo */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          top: "-150px",
          right: "-150px",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          bottom: "-100px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />

      {/* Layout principal */}
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        {/* ── Lado esquerdo — branding + status ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Logo */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0ms" }}
          >
            <div
              className="animate-float"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: "var(--radius-lg)",
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                marginBottom: 20,
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 8C4 5.79 5.79 4 8 4h12c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4h-4l-6 4v-4H8c-2.21 0-4-1.79-4-4V8z"
                  fill="white"
                  fillOpacity="0.9"
                />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}
            >
              <span className="gradient-text">LinguoUp</span>
            </h1>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: 340,
              }}
            >
              Painel administrativo. Gerencie usuários, conteúdo e métricas da
              plataforma de aprendizado de idiomas.
            </p>
          </div>

          {/* Status da infraestrutura */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Status da Infraestrutura
              </span>
              <button
                id="btn-refresh-health"
                onClick={checkHealth}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--brand-400)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: "2px 6px",
                  borderRadius: 4,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = "0.7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = "1")
                }
              >
                ↻ Atualizar
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <StatusCard
                label="API"
                status={infra.api}
                latency={infra.apiLatency}
                delay={200}
              />
              <StatusCard
                label="Banco de Dados"
                status={infra.database}
                latency={infra.dbLatency}
                delay={300}
              />
              <StatusCard
                label="Redis / Cache"
                status={infra.redis}
                latency={infra.redisLatency}
                delay={400}
              />
            </div>

            {infra.lastChecked && (
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  marginTop: 10,
                  textAlign: "right",
                }}
              >
                Última verificação: {infra.lastChecked}
              </p>
            )}
          </div>
        </div>

        {/* ── Lado direito — formulário de login ── */}
        <div
          className="animate-fade-in-up glass glow-purple"
          style={{
            animationDelay: "100ms",
            borderRadius: "var(--radius-lg)",
            padding: "40px 36px",
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Entrar
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Acesse o painel com suas credenciais de administrador.
            </p>
          </div>

          <form
            id="form-login"
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div>
              <label
                htmlFor="input-email"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                }}
              >
                E-mail
              </label>
              <input
                id="input-email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="admin@linguoup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="input-password"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                }}
              >
                Senha
              </label>
              <input
                id="input-password"
                type="password"
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div
                id="login-error"
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#fca5a5",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            <button
              id="btn-submit-login"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: "100%", marginTop: 4 }}
            >
              {isLoading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="20 20"
                    />
                  </svg>
                  Entrando…
                </>
              ) : (
                "Entrar no Painel"
              )}
            </button>
          </form>

          {/* Footer da card */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid var(--surface-border)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Acesso restrito a administradores.{" "}
              <span
                style={{ color: "var(--brand-400)", cursor: "pointer" }}
                onClick={() => alert("Funcionalidade em breve.")}
              >
                Esqueci minha senha
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Spin keyframe inline */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 680px) {
          #login-layout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

