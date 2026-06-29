// Web SkeletonLoader component

export interface SkeletonLoaderProps {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function SkeletonLoader({
  width = "100%",
  height = 14,
  borderRadius = 8,
}: SkeletonLoaderProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      className="glass"
      style={{ borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", gap: 12, alignItems: "center" }}
    >
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 13, width: "70%", borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 11, width: "45%", borderRadius: 4 }} />
      </div>
    </div>
  );
}
