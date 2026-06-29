"use client";

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  persistent?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  persistent = false,
}: BottomSheetProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 0",
      }}
      onClick={!persistent ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}
    >
      <div
        style={{
          background: "var(--surface-1)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          padding: "24px",
          width: "100%",
          maxWidth: 520,
          border: "1px solid var(--surface-border)",
          borderBottom: "none",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--surface-3)", margin: "0 auto 16px" }} />

        {title && <h3 style={{ fontWeight: 700, marginBottom: description ? 8 : 16 }}>{title}</h3>}
        {description && <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 16 }}>{description}</p>}
        {children}
      </div>
    </div>
  );
}
