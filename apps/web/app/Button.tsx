// Web Button component

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  children,
  disabled,
  className,
  style,
  ...rest
}: ButtonProps) {
  const cls = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <button
      className={`${cls} ${className ?? ""}`}
      disabled={disabled || loading}
      style={{ width: fullWidth ? "100%" : undefined, ...style }}
      {...rest}
    >
      {loading ? "Carregandoâ€¦" : children}
    </button>
  );
}
