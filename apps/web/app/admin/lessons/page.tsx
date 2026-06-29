"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface AdminLesson {
  id: string;
  title: string;
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  isActive: boolean;
}

interface LessonForm {
  title: string;
  topic: string;
  level: AdminLesson["level"];
  durationMinutes: number;
  description: string;
}

const EMPTY_FORM: LessonForm = { title: "", topic: "", level: "beginner", durationMinutes: 5, description: "" };

const LEVEL_LABELS = { beginner: "Iniciante", intermediate: "Intermediário", advanced: "Avançado" };

export default function AdminLessonsPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [filterLevel, setFilterLevel] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminLesson | null>(null);
  const [form, setForm] = useState<LessonForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: lessons = [], isLoading } = useQuery<AdminLesson[]>({
    queryKey: ["admin-lessons", filterLevel],
    queryFn: () =>
      apiFetch(`/admin/lessons${filterLevel !== "all" ? `?level=${filterLevel}` : ""}`, {
        token: accessToken ?? undefined,
      }),
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: (body: LessonForm) =>
      apiFetch("/admin/lessons", {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      closeModal();
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Erro ao criar lição."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<LessonForm> }) =>
      apiFetch(`/admin/lessons/${id}`, {
        method: "PATCH",
        token: accessToken ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      closeModal();
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Erro ao atualizar lição."),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/lessons/${id}`, {
        method: "DELETE",
        token: accessToken ?? undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons"] }),
  });

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(lesson: AdminLesson) {
    setEditTarget(lesson);
    setForm({ title: lesson.title, topic: lesson.topic, level: lesson.level, durationMinutes: lesson.durationMinutes, description: "" });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.topic.trim()) { setFormError("Título e tópico são obrigatórios."); return; }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, body: form });
    } else {
      createMutation.mutate(form);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>Lições</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Gerenciar o catálogo de lições.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Nova Lição</button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "beginner", "intermediate", "advanced"].map((l) => (
          <button key={l} onClick={() => setFilterLevel(l)}
            style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", border: `1px solid ${filterLevel === l ? "rgba(139,92,246,0.6)" : "var(--surface-border)"}`, background: filterLevel === l ? "rgba(139,92,246,0.15)" : "transparent", color: filterLevel === l ? "var(--brand-300)" : "var(--text-secondary)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", fontWeight: filterLevel === l ? 600 : 400 }}>
            {l === "all" ? "Todos" : LEVEL_LABELS[l as AdminLesson["level"]]}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: "var(--radius-md)" }} />)}
        </div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>📚</div>
          <div>Nenhuma lição encontrada.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lessons.map((lesson) => (
            <div key={lesson.id} className="glass" style={{ borderRadius: "var(--radius-md)", padding: "16px", display: "flex", alignItems: "center", gap: 14, opacity: lesson.isActive ? 1 : 0.5 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 2 }}>{lesson.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {lesson.topic} · {lesson.durationMinutes}min · {LEVEL_LABELS[lesson.level]} · {lesson.isActive ? "Ativa" : "Inativa"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => openEdit(lesson)} style={{ background: "none", border: "none", color: "var(--brand-400)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit" }}>
                  Editar
                </button>
                {lesson.isActive && (
                  <button
                    onClick={() => { if (window.confirm(`Desativar "${lesson.title}"?`)) deactivateMutation.mutate(lesson.id); }}
                    style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit" }}
                  >
                    Desativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: "var(--surface-1)", borderRadius: "var(--radius-lg)", padding: "28px", width: "100%", maxWidth: 520, border: "1px solid var(--surface-border)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>{editTarget ? "Editar Lição" : "Nova Lição"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Título</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" required placeholder="Ex: Saudações básicas" />
              </div>
              <div>
                <label style={labelStyle}>Tópico</label>
                <input type="text" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} className="input-field" required placeholder="Ex: Vocabulário cotidiano" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nível</label>
                  <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as AdminLesson["level"] }))} className="input-field">
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Duração (min)</label>
                  <input type="number" min={1} max={60} value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} className="input-field" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field" rows={3} placeholder="Descrição da lição" style={{ resize: "vertical" }} />
              </div>
              {formError && <div className="feedback-incorrect">{formError}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={closeModal} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary" style={{ flex: 1 }}>
                  {createMutation.isPending || updateMutation.isPending ? "Salvando…" : editTarget ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: 6,
};
