// Web OptionCard component

export interface OptionCardProps {
  label: string;
  description?: string;
  icon?: string;
  selected?: boolean;
  onSelect: () => void;
}

export function OptionCard({
  label,
  description,
  icon,
  selected = false,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      style={{
        padding: "16px",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${selected ? "rgba(139,92,246,0.6)" : "var(--surface-border)"}`,
        background: selected ? "rgba(139,92,246,0.12)" : "var(--surface-1)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "all 0.15s ease",
        textAlign: "left",
        width: "100%",
        fontFamily: "inherit",
      }}
    >
      {icon && <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{label}</div>
        {description && (
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{description}</div>
        )}
      </div>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${selected ? "var(--brand-500)" : "var(--surface-border)"}`,
          background: selected ? "var(--brand-500)" : "transparent",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }} />}
      </div>
    </button>
  );
}
