"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type Step = "goal" | "language" | "availability" | "plan";

interface OnboardingState {
  learningGoal: string;
  targetLanguage: string;
  dailyMinutes: number;
  preferredHour: number;
}

const GOALS = [
  { value: "work", label: "Trabalho", icon: "💼", description: "Reuniões e crescimento profissional" },
  { value: "travel", label: "Viagem", icon: "✈️", description: "Comunicação em outros países" },
  { value: "studies", label: "Estudos", icon: "🎓", description: "Intercâmbio e certificações" },
  { value: "hobby", label: "Hobby", icon: "🎨", description: "Aprender por curiosidade e prazer" },
  { value: "other", label: "Outro", icon: "🌟", description: "Razão pessoal" },
];

const LANGUAGES = [
  { value: "en", label: "Inglês", flag: "🇺🇸" },
  { value: "es", label: "Espanhol", flag: "🇪🇸" },
  { value: "fr", label: "Francês", flag: "🇫🇷" },
  { value: "de", label: "Alemão", flag: "🇩🇪" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "jp", label: "Japonês", flag: "🇯🇵" },
];

const DAILY_OPTIONS = [
  { value: 5, label: "5 min", description: "Leve e consistente" },
  { value: 10, label: "10 min", description: "Equilíbrio ideal" },
  { value: 15, label: "15 min", description: "Aprendizado acelerado" },
  { value: 20, label: "20 min", description: "Foco máximo", recommended: true },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { accessToken, updateUser } = useAuthStore();
  const [step, setStep] = useState<Step>("goal");
  const [state, setState] = useState<OnboardingState>({
    learningGoal: "",
    targetLanguage: "",
    dailyMinutes: 10,
    preferredHour: 8,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: Step[] = ["goal", "language", "availability", "plan"];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  function update<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function next() {
    const next = steps[currentIndex + 1];
    if (next) setStep(next);
  }

  function back() {
    const prev = steps[currentIndex - 1];
    if (prev) setStep(prev);
  }

  async function handleCreatePlan() {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/users/me/onboarding", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({
          learningGoal: state.learningGoal,
          targetLanguage: state.targetLanguage,
          dailyGoalMinutes: state.dailyMinutes,
          preferredStudyHour: state.preferredHour,
        }),
      });
      updateUser({
        onboardingCompleted: true,
        learningGoal: state.learningGoal,
        targetLanguage: state.targetLanguage,
        dailyGoalMinutes: state.dailyMinutes,
      });
      router.push("/assessment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar plano.");
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        background: "var(--surface-0)",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "var(--surface-2)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div
        className="animate-fade-in-up"
        style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Step header */}
        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>
            Passo {currentIndex + 1} de {steps.length}
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {step === "goal" && "Qual é seu objetivo?"}
            {step === "language" && "Qual idioma deseja aprender?"}
            {step === "availability" && "Quanto tempo você tem por dia?"}
            {step === "plan" && "Seu plano personalizado 🎉"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 6 }}>
            {step === "goal" && "Isso nos ajuda a personalizar seu aprendizado."}
            {step === "language" && "Você poderá adicionar mais idiomas depois."}
            {step === "availability" && "Seja honesto — consistência é mais importante que quantidade."}
            {step === "plan" && "Criamos um plano ideal baseado nas suas respostas."}
          </p>
        </div>

        {/* Step content */}
        {step === "goal" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GOALS.map((g) => (
              <OptionCard
                key={g.value}
                icon={g.icon}
                label={g.label}
                description={g.description}
                selected={state.learningGoal === g.value}
                onSelect={() => update("learningGoal", g.value)}
              />
            ))}
          </div>
        )}

        {step === "language" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => update("targetLanguage", l.value)}
                className={state.targetLanguage === l.value ? "option-selected" : "option-card"}
                style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", border: "none", borderRadius: "var(--radius-md)" }}
              >
                <span style={{ fontSize: "2rem" }}>{l.flag}</span>
                <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{l.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === "availability" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DAILY_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => update("dailyMinutes", o.value)}
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${state.dailyMinutes === o.value ? "rgba(139,92,246,0.6)" : "var(--surface-border)"}`,
                  background: state.dailyMinutes === o.value ? "rgba(139,92,246,0.12)" : "var(--surface-1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>{o.label}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{o.description}</span>
                </div>
                {o.recommended && (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: "var(--radius-full)", background: "rgba(139,92,246,0.2)", color: "var(--brand-400)" }}>
                    Recomendado
                  </span>
                )}
              </button>
            ))}
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
                Horário preferencial de estudo: {state.preferredHour}h
              </label>
              <input
                type="range"
                min={5}
                max={23}
                value={state.preferredHour}
                onChange={(e) => update("preferredHour", Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--brand-500)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                <span>5h (manhã cedo)</span>
                <span>23h (noite)</span>
              </div>
            </div>
          </div>
        )}

        {step === "plan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="glass" style={{ padding: "24px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: 16 }}>
              <PlanItem icon="🎯" label="Objetivo" value={GOALS.find((g) => g.value === state.learningGoal)?.label ?? "—"} />
              <PlanItem icon="🌍" label="Idioma" value={LANGUAGES.find((l) => l.value === state.targetLanguage)?.label ?? "—"} />
              <PlanItem icon="⏱" label="Meta diária" value={`${state.dailyMinutes} minutos/dia`} />
              <PlanItem icon="🕐" label="Horário" value={`${state.preferredHour}h`} />
            </div>
            {error && <div className="feedback-incorrect">{error}</div>}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12 }}>
          {currentIndex > 0 && (
            <button onClick={back} className="btn-secondary" style={{ flex: 1 }}>
              Voltar
            </button>
          )}
          {step !== "plan" ? (
            <button
              onClick={next}
              disabled={
                (step === "goal" && !state.learningGoal) ||
                (step === "language" && !state.targetLanguage)
              }
              className="btn-primary"
              style={{ flex: 2 }}
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleCreatePlan}
              disabled={saving}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {saving ? "Salvando…" : "Iniciar Avaliação"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  icon,
  label,
  description,
  selected,
  onSelect,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
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
      }}
      role="radio"
      aria-checked={selected}
    >
      <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{label}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{description}</div>
      </div>
      <div
        style={{
          marginLeft: "auto",
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

function PlanItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: "1.25rem", width: 28, textAlign: "center" }}>{icon}</span>
      <div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</div>
        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}
