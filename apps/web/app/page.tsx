"use client";

import Link from "next/link";

export default function WelcomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        background: "var(--surface-0)",
      }}
    >
      {/* Background orbs */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
          top: "-200px",
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

      {/* Content */}
      <div
        className="animate-fade-in-up"
        style={{
          maxWidth: 440,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 32,
        }}
      >
        {/* Logo */}
        <div
          className="animate-float"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
            <path
              d="M4 8C4 5.79 5.79 4 8 4h12c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4h-4l-6 4v-4H8c-2.21 0-4-1.79-4-4V8z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1
            className="gradient-text"
            style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.15 }}
          >
            LinguoUp
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Aprenda idiomas em{" "}
            <strong style={{ color: "var(--text-primary)" }}>3 a 5 minutos</strong>{" "}
            por dia. Microlições, gamificação e formação de hábitos.
          </p>
        </div>

        {/* Value props */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          {[
            { icon: "⚡", text: "Microlições de 3 a 5 minutos" },
            { icon: "🎯", text: "Metas diárias personalizadas" },
            { icon: "🔥", text: "Streak e gamificação para criar hábitos" },
            { icon: "🧠", text: "Repetição espaçada inteligente" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>{icon}</span>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <Link href="/register" className="btn-primary" style={{ width: "100%" }}>
            Começar agora — é grátis
          </Link>
          <Link href="/login" className="btn-secondary" style={{ width: "100%" }}>
            Já tenho conta — Entrar
          </Link>
        </div>

        {/* Footer links */}
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Ao continuar, você concorda com os{" "}
          <a href="#" style={{ color: "var(--brand-400)", textDecoration: "none" }}>
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a href="#" style={{ color: "var(--brand-400)", textDecoration: "none" }}>
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
}
