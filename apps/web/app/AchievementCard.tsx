// Web AchievementCard component

export interface AchievementCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  unlocked?: boolean;
  className?: string;
}

export function AchievementCard({
  title,
  subtitle,
  icon,
  unlocked = false,
  className,
}: AchievementCardProps) {
  return (
    <div
      className={className}
      title={unlocked ? title : `Bloqueado: ${subtitle ?? title}`}
      style={{
        padding: "12px 8px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)",
        background: unlocked ? "var(--surface-1)" : "var(--surface-0)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity: unlocked ? 1 : 0.4,
        width: 110,
      }}
      aria-label={`${title}${unlocked ? "" : " â€” bloqueado"}`}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: unlocked ? "rgba(245,158,11,0.15)" : "var(--surface-2)",
          fontSize: "1.75rem",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "0.7rem", fontWeight: 600, textAlign: "center", color: "var(--text-primary)", lineHeight: 1.2 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textAlign: "center" }}>
          {subtitle}
        </div>
      )}
      {!unlocked && (
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 700 }}>Bloqueado</div>
      )}
    </div>
  );
}
