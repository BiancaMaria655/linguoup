// Web Input component

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className, style, ...rest }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-field ${error ? "input-error" : ""} ${className ?? ""}`}
        style={{
          borderColor: error ? "rgba(239,68,68,0.6)" : undefined,
          ...style,
        }}
        {...rest}
      />
      {error && (
        <span style={{ fontSize: "0.75rem", color: "#fca5a5" }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{hint}</span>
      )}
    </div>
  );
}
