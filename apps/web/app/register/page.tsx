"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, tenant_id: "tenant_default_123" }),
      });
      const loginData = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const profile = await apiFetch<{
        id: string; name: string; email: string; role: "USER" | "ADMIN" | "SUPER_ADMIN";
        preferences: { onboardingCompleted: boolean; targetLanguage?: string; learningGoal?: string; dailyGoalMinutes?: number } | null;
      }>("/users/me", { token: loginData.accessToken });
      setAuth(loginData.accessToken, {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        onboardingCompleted: profile.preferences?.onboardingCompleted ?? false,
        targetLanguage: profile.preferences?.targetLanguage,
        learningGoal: profile.preferences?.learningGoal,
        dailyGoalMinutes: profile.preferences?.dailyGoalMinutes,
      });
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

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
      }}
    >
      <BackgroundOrbs />
      <div
        className="animate-fade-in-up"
        style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 24 }}
      >
        <Logo />

        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>
            Criar conta
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Comece a aprender idiomas hoje mesmo.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="name" style={labelStyle}>Nome</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="email" style={labelStyle}>E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="password" style={labelStyle}>Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="input-field"
              minLength={8}
              required
            />
          </div>

          {error && (
            <div className="feedback-incorrect" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !email || !password}
            className="btn-primary"
            style={{ width: "100%", marginTop: 4 }}
          >
            {loading ? "Criando conta…" : "Criar Conta"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "var(--brand-400)", fontWeight: 600 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: 6,
};

function BackgroundOrbs() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          top: "-150px",
          right: "-100px",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          bottom: "-80px",
          left: "-80px",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-sm)",
          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
          <path
            d="M4 8C4 5.79 5.79 4 8 4h12c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4h-4l-6 4v-4H8c-2.21 0-4-1.79-4-4V8z"
            fill="white"
            fillOpacity="0.9"
          />
        </svg>
      </div>
      <span className="gradient-text" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
        LinguoUp
      </span>
    </Link>
  );
}
