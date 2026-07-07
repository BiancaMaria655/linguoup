"use client";

import { useOnboardingScreen } from "@/app/hooks/useOnboardingScreen";

const GOALS = [
  { value: "CAREER", label: "Trabalho", icon: "💼", description: "Reuniões e crescimento profissional" },
  { value: "TRAVEL", label: "Viagem", icon: "✈️", description: "Comunicação em outros países" },
  { value: "EXAM", label: "Estudos", icon: "🎓", description: "Intercâmbio e certificações" },
  { value: "CULTURE", label: "Hobby/Cultura", icon: "🎨", description: "Aprender por curiosidade e prazer" },
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
  const {
    step,
    state,
    update,
    next,
    back,
    handleCreatePlan,
    currentIndex,
    progress,
    steps,
    saving,
    error,
  } = useOnboardingScreen();



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
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Passo ${currentIndex + 1} de ${steps.length}`}
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
            {LANGUAGES.map((l) => {
              const selected = state.targetLanguage === l.value;
              return (
                <button
                  key={l.value}
                  onClick={() => update("targetLanguage", l.value)}
                  aria-pressed={selected}
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${selected ? "rgba(139,92,246,0.6)" : "var(--surface-border)"}`,
                    background: selected ? "rgba(139,92,246,0.12)" : "var(--surface-1)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{l.flag}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{l.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === "availability" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DAILY_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => update("dailyMinutes", o.value)}
                aria-pressed={state.dailyMinutes === o.value}
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
            <div style={{ marginTop: 16 }}>
              <label
                htmlFor="onboarding-period"
                style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}
              >
                Melhor horário para você
              </label>
              <select
                id="onboarding-period"
                value={state.preferredStudyTime}
                onChange={(e) => update("preferredStudyTime", e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--surface-border)",
                  background: "var(--surface-1)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(139,92,246,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                  backgroundSize: "16px",
                  paddingRight: "40px",
                  outline: "none",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                <option value="MORNING">Manhã (06:00 - 12:00)</option>
                <option value="AFTERNOON">Hora do almoço (12:00 - 14:00)</option>
                <option value="EVENING">Noite (18:00 - 24:00)</option>
              </select>
            </div>
          </div>
        )}

        {step === "plan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="glass" style={{ padding: "24px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: 16 }}>
              <PlanItem icon="🎯" label="Objetivo" value={GOALS.find((g) => g.value === state.learningGoal)?.label ?? "—"} />
              <PlanItem icon="🌍" label="Idioma" value={LANGUAGES.find((l) => l.value === state.targetLanguage)?.label ?? "—"} />
              <PlanItem icon="⏱" label="Meta diária" value={`${state.dailyMinutes} minutos/dia`} />
              <PlanItem icon="🕐" label="Horário" value={
                state.preferredStudyTime === "MORNING"
                  ? "Manhã (06:00 - 12:00)"
                  : state.preferredStudyTime === "AFTERNOON"
                  ? "Hora do almoço (12:00 - 14:00)"
                  : "Noite (18:00 - 24:00)"
              } />
            </div>
            {error && <div className="feedback-incorrect" role="alert">{error}</div>}
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
      }}
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
