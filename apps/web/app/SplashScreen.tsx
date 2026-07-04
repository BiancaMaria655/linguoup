"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300); // wait for fade-out transition
    }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      aria-label="Carregando LinguoUp"
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-0)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          animation: "splashIn 0.5s ease forwards",
        }}
      >
        {/* Logo icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(124,58,237,0.4)",
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
        {/* Wordmark */}
        <span
          className="gradient-text"
          style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.02em" }}
        >
          LinguoUp
        </span>
      </div>

      <style>{`
        @keyframes splashIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
