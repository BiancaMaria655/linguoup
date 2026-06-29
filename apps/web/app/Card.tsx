// Web Card component

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "sm" | "md" | "lg" | "none";
}

export function Card({ elevation = "sm", className, style, children, ...rest }: CardProps) {
  const shadows: Record<string, string> = {
    none: "none",
    sm: "0 1px 4px rgba(0,0,0,0.3)",
    md: "0 4px 12px rgba(0,0,0,0.3)",
    lg: "0 8px 24px rgba(0,0,0,0.35)",
  };
  return (
    <div
      className={`glass ${className ?? ""}`}
      style={{
        borderRadius: "var(--radius-md)",
        padding: 16,
        boxShadow: shadows[elevation],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
