"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface ReviewItem {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  dueDate: string;
  topic: string;
}

interface ReviewsData {
  items: ReviewItem[];
  total: number;
  overdue: number;
}

export default function ReviewsPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionItems, setSessionItems] = useState<ReviewItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);

  const { data, isLoading } = useQuery<ReviewsData>({
    queryKey: ["reviews"],
    queryFn: () => apiFetch("/reviews/pending", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const postponeMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/reviews/${id}/postpone`, { method: "POST", token: accessToken ?? undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });

  const completeMutation = useMutation({
    mutationFn: (body: { itemId: string; correct: boolean }) =>
      apiFetch(`/reviews/${body.itemId}/complete`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ correct: body.correct }),
      }),
  });

  function startSession() {
    const items = data?.items.slice(0, 10) ?? [];
    setSessionItems(items);
    setSessionIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setScores([]);
    setSessionActive(true);
  }

  function handleSelect(answer: string) {
    if (showFeedback) return;
    const item = sessionItems[sessionIndex];
    const isCorrect = answer.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase();
    setSelected(answer);
    setShowFeedback(true);
    setScores((s) => [...s, isCorrect]);
    completeMutation.mutate({ itemId: item.id, correct: isCorrect });
  }

  function handleNext() {
    const next = sessionIndex + 1;
    if (next >= sessionItems.length) {
      setSessionActive(false);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    } else {
      setSessionIndex(next);
      setSelected(null);
      setShowFeedback(false);
    }
  }

  if (sessionActive) {
    const item = sessionItems[sessionIndex];
    const total = sessionItems.length;
    const progress = (sessionIndex / total) * 100;
    const isCorrect = showFeedback && selected?.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase();

    if (sessionIndex >= total) {
      const correct = scores.filter(Boolean).length;
      return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
          <div style={{ fontSize: "3rem" }}>🎯</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Revisão concluída!</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Você acertou <strong style={{ color: "var(--text-primary)" }}>{correct}</strong> de{" "}
            <strong>{total}</strong> itens.
          </p>
          <button onClick={() => setSessionActive(false)} className="btn-primary" style={{ width: "100%", maxWidth: 320 }}>
            Voltar para Revisões
          </button>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", background: "var(--surface-0)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--surface-border)", display: "flex", alignItems: "center", gap: 16, background: "var(--surface-1)" }}>
          <button onClick={() => setSessionActive(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem", fontFamily: "inherit" }}>✕</button>
          <div className="progress-bar-track" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", flexShrink: 0 }}>{sessionIndex + 1}/{total}</span>
        </div>
        <div style={{ flex: 1, maxWidth: 600, width: "100%", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Revisão — {item.topic}</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.4 }}>{item.question}</h2>

          {item.options ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {item.options.map((opt, idx) => {
                let bg = "var(--surface-1)"; let border = "var(--surface-border)";
                if (showFeedback) {
                  if (opt === item.correctAnswer) { bg = "rgba(34,197,94,0.12)"; border = "rgba(34,197,94,0.5)"; }
                  else if (opt === selected) { bg = "rgba(239,68,68,0.12)"; border = "rgba(239,68,68,0.5)"; }
                } else if (opt === selected) { bg = "rgba(139,92,246,0.12)"; border = "rgba(139,92,246,0.6)"; }
                return (
                  <button key={idx} onClick={() => handleSelect(opt)} disabled={showFeedback} style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", border: `1px solid ${border}`, background: bg, color: "var(--text-primary)", textAlign: "left", fontSize: "0.95rem", cursor: showFeedback ? "default" : "pointer", transition: "all 0.15s ease", fontFamily: "inherit" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <input type="text" value={selected ?? ""} onChange={(e) => setSelected(e.target.value)} disabled={showFeedback} placeholder="Digite a resposta…" className="input-field" onKeyDown={(e) => { if (e.key === "Enter" && selected?.trim()) handleSelect(selected); }} autoFocus />
              {!showFeedback && selected?.trim() && (
                <button onClick={() => handleSelect(selected)} className="btn-primary" style={{ width: "100%", marginTop: 12 }}>Verificar</button>
              )}
            </div>
          )}

          {showFeedback && (
            <>
              <div className={isCorrect ? "feedback-correct" : "feedback-incorrect"}>
                {isCorrect ? "✅ Correto!" : <>❌ Resposta: <strong>{item.correctAnswer}</strong></>}
              </div>
              <button onClick={handleNext} className="btn-primary" style={{ width: "100%" }}>
                {sessionIndex + 1 < total ? "Próximo →" : "Ver resultado →"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>Revisões</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Repetição espaçada — reforce o que você aprendeu.
        </p>
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)" }} />
      ) : (
        <>
          {/* Summary card */}
          <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: data?.overdue ? "var(--status-error)" : "var(--brand-400)" }}>
                {data?.total ?? 0}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {data?.overdue ? `${data.overdue} vencidos` : "itens para revisar"}
              </div>
            </div>
            <button
              onClick={startSession}
              disabled={!data?.total}
              className="btn-primary"
              style={{ opacity: !data?.total ? 0.5 : 1 }}
            >
              Revisar agora →
            </button>
          </div>

          {/* Item list */}
          {data && data.items.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.items.map((item) => {
                const isOverdue = new Date(item.dueDate) < new Date();
                return (
                  <div
                    key={item.id}
                    className="glass"
                    style={{ borderRadius: "var(--radius-md)", padding: "16px", display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>
                        {item.question.length > 60 ? item.question.slice(0, 60) + "…" : item.question}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: isOverdue ? "var(--status-error)" : "var(--text-muted)" }}>
                        {item.topic} · {isOverdue ? "Vencido" : `Vence ${new Date(item.dueDate).toLocaleDateString("pt-BR")}`}
                      </div>
                    </div>
                    <button
                      onClick={() => postponeMutation.mutate(item.id)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", flexShrink: 0 }}
                    >
                      Adiar
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
              <div>Sem revisões pendentes! Continue aprendendo.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
