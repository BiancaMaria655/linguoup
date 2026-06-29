// Web Badge components â€” used internally by other web components

export interface BadgeProps {
  label: string;
  variant?: "xp" | "streak" | "level" | "custom";
  color?: string;
  background?: string;
}

const VARIANT_STYLES: Record<string, { bg: string; text: string }> = {
  xp: { bg: "rgba(139,92,246,0.15)", text: "var(--brand-300)" },
  streak: { bg: "rgba(245,158,11,0.15)", text: "#fcd34d" },
  level: { bg: "rgba(34,197,94,0.15)", text: "#86efac" },
  custom: { bg: "var(--surface-3)", text: "var(--text-secondary)" },
};

export function Badge({ label, variant = "custom", color, background }: BadgeProps) {
  const scheme = VARIANT_STYLES[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: "0.7rem",
        fontWeight: 700,
        background: background ?? scheme.bg,
        color: color ?? scheme.text,
      }}
    >
      {label}
    </span>
  );
}

export function StreakIcon({ count }: { count: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontWeight: 700 }}>
      ðŸ”¥ {count}
    </span>
  );
}
