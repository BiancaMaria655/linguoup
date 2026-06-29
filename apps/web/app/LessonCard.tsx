// Web LessonCard component

import Link from "next/link";
import { Badge } from "./Badge";

export type LessonLevel = "beginner" | "intermediate" | "advanced";

export interface LessonCardProps {
  id: string;
  title: string;
  topic: string;
  durationMinutes: number;
  level: LessonLevel;
  completed?: boolean;
  locked?: boolean;
}

const LEVEL_LABEL: Record<LessonLevel, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const LEVEL_VARIANT: Record<LessonLevel, "xp" | "level" | "streak"> = {
  beginner: "xp",
  intermediate: "level",
  advanced: "streak",
};

export function LessonCard({
  id,
  title,
  topic,
  durationMinutes,
  level,
  completed = false,
  locked = false,
}: LessonCardProps) {
  const content = (
    <div
      style={{
        padding: "16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface-1)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: locked ? 0.5 : 1,
        cursor: locked ? "default" : "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-sm)",
          background: locked ? "var(--surface-2)" : "rgba(139,92,246,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          flexShrink: 0,
        }}
      >
        {locked ? "🔒" : completed ? "✅" : "📖"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {topic} Â· {durationMinutes} min
        </div>
      </div>
      <Badge label={LEVEL_LABEL[level]} variant={LEVEL_VARIANT[level]} />
    </div>
  );

  if (locked) return content;
  return <Link href={`/lessons/${id}`} style={{ textDecoration: "none" }}>{content}</Link>;
}

