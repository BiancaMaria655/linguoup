"use client";

import { useAssessmentScreen } from "@/app/hooks/useAssessmentScreen";

export default function AssessmentPage() {
  const {
    questions,
    current,
    selected,
    showFeedback,
    done,
    question,
    isCorrect,
    score,
    progress,
    level,
    levelEmoji,
    saving,
    handleSelect,
    handleNext,
    handleSkip,
    handleGoToDashboard,
  } = useAssessmentScreen();

  if (done) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "var(--surface-0)",
        }}
      >
        <div
          className="animate-fade-in-up"
          style={{
            maxWidth: 480,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem" }} aria-hidden="true">{levelEmoji}</div>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>
              Avaliação concluída!
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Você acertou <strong style={{ color: "var(--text-primary)" }}>{score}</strong> de{" "}
              <strong>{questions.length}</strong> questões.
            </p>
          </div>

          <div
            className="glass"
            style={{
              width: "100%",
              padding: "24px",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 4 }}>
              Seu nível detectado
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {level}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {score >= 4
                ? "Impressionante! Você já tem um bom domínio. Vamos aprimorar ainda mais."
                : score >= 2
                ? "Bom começo! Você já conhece o básico. Vamos construir em cima disso."
                : "Perfeito! Começaremos do início, com uma base sólida."}
            </div>
          </div>

          <button
            id="assessment-start-learning"
            onClick={handleGoToDashboard}
            disabled={saving}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            {saving ? "Salvando…" : "Iniciar Aprendizado →"}
          </button>
          <button
            id="assessment-skip-result"
            onClick={handleGoToDashboard}
            className="btn-secondary"
            style={{ width: "100%" }}
          >
            Pular por enquanto
          </button>
        </div>
      </div>
    );
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
        background: "var(--surface-0)",
      }}
    >
      {/* Progress bar */}
      <div
        style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "var(--surface-2)", zIndex: 10 }}
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-label={`Questão ${current + 1} de ${questions.length}`}
      >
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)", transition: "width 0.4s ease" }} />
      </div>

      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6 }}>
            Questão {current + 1} de {questions.length}
          </p>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.4 }}>
            {question.text}
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map((opt, idx) => {
            let bg = "var(--surface-1)";
            let border = "var(--surface-border)";
            if (showFeedback) {
              if (idx === question.correctIndex) {
                bg = "rgba(34,197,94,0.12)";
                border = "rgba(34,197,94,0.5)";
              } else if (idx === selected) {
                bg = "rgba(239,68,68,0.12)";
                border = "rgba(239,68,68,0.5)";
              }
            } else if (idx === selected) {
              bg = "rgba(139,92,246,0.12)";
              border = "rgba(139,92,246,0.6)";
            }

            return (
              <button
                key={idx}
                id={`assessment-option-${idx}`}
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                aria-pressed={idx === selected}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${border}`,
                  background: bg,
                  color: "var(--text-primary)",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  cursor: showFeedback ? "default" : "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={isCorrect ? "feedback-correct" : "feedback-incorrect"} role="status">
            {isCorrect ? "✅ Correto!" : `❌ Incorreto. A resposta correta é: "${question.options[question.correctIndex]}"`}
          </div>
        )}

        {showFeedback && (
          <button id="assessment-next" onClick={handleNext} className="btn-primary" style={{ width: "100%" }}>
            {current + 1 < questions.length ? "Próxima questão →" : "Ver resultado →"}
          </button>
        )}

        <button
          id="assessment-skip"
          onClick={handleSkip}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", alignSelf: "center" }}
        >
          Pular avaliação
        </button>
      </div>
    </div>
  );
}
