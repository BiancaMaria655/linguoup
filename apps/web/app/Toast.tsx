"use client";

import { useEffect, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
}

const VARIANT_MAP: Record<ToastVariant, { bg: string; text: string; border: string }> = {
  success: { bg: "rgba(34,197,94,0.15)", text: "#86efac", border: "rgba(34,197,94,0.3)" },
  error: { bg: "rgba(239,68,68,0.15)", text: "#fca5a5", border: "rgba(239,68,68,0.3)" },
  info: { bg: "rgba(139,92,246,0.15)", text: "var(--brand-300)", border: "rgba(139,92,246,0.3)" },
};

export function Toast({
  message,
  variant = "success",
  visible,
  duration = 3000,
  onHide,
}: ToastProps) {
  const [show, setShow] = useState(visible);
  const scheme = VARIANT_MAP[variant];

  useEffect(() => {
    setShow(visible);
    if (!visible) return;
    const t = setTimeout(() => { setShow(false); onHide?.(); }, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onHide]);

  if (!show) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999,
        background: scheme.bg,
        border: `1px solid ${scheme.border}`,
        borderRadius: "var(--radius-md)",
        padding: "12px 20px",
        color: scheme.text,
        fontWeight: 600,
        fontSize: "0.9rem",
        backdropFilter: "blur(20px)",
        maxWidth: "90vw",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
