"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

// Sample assessment questions (in production these come from the API)
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "What is the English translation of 'Obrigado'?",
    options: ["Please", "Thank you", "Sorry", "Hello"],
    correctIndex: 1,
  },
  {
    id: "q2",
    text: "Choose the correct sentence:",
    options: [
      "She don't like coffee.",
      "She doesn't likes coffee.",
      "She doesn't like coffee.",
      "She not like coffee.",
    ],
    correctIndex: 2,
  },
  {
    id: "q3",
    text: "What does 'Bom dia' mean in English?",
    options: ["Good afternoon", "Good evening", "Good night", "Good morning"],
    correctIndex: 3,
  },
  {
    id: "q4",
    text: "Fill in the blank: 'I ___ to the store yesterday.'",
    options: ["go", "gone", "went", "going"],
    correctIndex: 2,
  },
  {
    id: "q5",
    text: "Which word means 'rápido' in English?",
    options: ["Slow", "Fast", "Big", "Small"],
    correctIndex: 1,
  },
];

export default function AssessmentPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const question = SAMPLE_QUESTIONS[current];
  const isCorrect = selected === question?.correctIndex;
  const score = answers.filter((a, i) => a === SAMPLE_QUESTIONS[i]?.correctIndex).length;

  function handleSelect(idx: number) {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (current + 1 >= SAMPLE_QUESTIONS.length) {
      setDone(true);
      submitAssessment(newAnswers);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  }

  async function submitAssessment(finalAnswers: number[]) {
    if (!accessToken) return;
    setSaving(true);
    const finalScore = finalAnswers.filter((a, i) => a === SAMPLE_QUESTIONS[i]?.correctIndex).length;
    try {
      await apiFetch("/assessment/submit", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({
          answers: finalAnswers.map((a, i) => ({
            questionId: SAMPLE_QUESTIONS[i].id,
            selectedIndex: a,
          })),
          score: finalScore,
          total: SAMPLE_QUESTIONS.length,
        }),
      });
    } catch {
      // Assessment submission failure is non-blocking
    } finally {
      setSaving(false);
    }
  }

  const level = score >= 4 ? "Intermediário" : score >= 2 ? "Básico" : "Iniciante";
  const levelEmoji = score >= 4 ? "🚀" : score >= 2 ? "📚" : "🌱";

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
          <div style={{ fontSize: "4rem" }}>{levelEmoji}</div>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>
              Avaliação concluída!
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Você acertou <strong style={{ color: "var(--text-primary)" }}>{score}</strong> de{" "}
              <strong>{SAMPLE_QUESTIONS.length}</strong> questões.
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
            onClick={() => router.push("/dashboard")}
            disabled={saving}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            {saving ? "Salvando…" : "Iniciar Aprendizado →"}
          </button>
          <button onClick={() => router.push("/dashboard")} className="btn-secondary" style={{ width: "100%" }}>
            Pular por enquanto
          </button>
        </div>
      </div>
    );
  }

  const progress = ((current) / SAMPLE_QUESTIONS.length) * 100;

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
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "var(--surface-2)", zIndex: 10 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)", transition: "width 0.4s ease" }} />
      </div>

      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6 }}>
            Questão {current + 1} de {SAMPLE_QUESTIONS.length}
          </p>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.4 }}>
            {question.text}
          </h2>
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
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
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
          <div className={isCorrect ? "feedback-correct" : "feedback-incorrect"}>
            {isCorrect ? "✅ Correto!" : `❌ Incorreto. A resposta correta é: "${question.options[question.correctIndex]}"`}
          </div>
        )}

        {showFeedback && (
          <button onClick={handleNext} className="btn-primary" style={{ width: "100%" }}>
            {current + 1 < SAMPLE_QUESTIONS.length ? "Próxima questão →" : "Ver resultado →"}
          </button>
        )}

        <button
          onClick={() => router.push("/dashboard")}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", alignSelf: "center" }}
        >
          Pular avaliação
        </button>
      </div>
    </div>
  );
}
