"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  xpReward: number;
  isActive: boolean;
}

interface AchievementForm {
  title: string;
  description: string;
  icon: string;
  criteria: string;
  xpReward: number;
}

const EMPTY_FORM: AchievementForm = { title: "", description: "", icon: "🏆", criteria: "", xpReward: 50 };

export default function AdminAchievementsPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Achievement | null>(null);
  const [form, setForm] = useState<AchievementForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ["admin-achievements"],
    queryFn: () => apiFetch("/admin/achievements", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: (body: AchievementForm) =>
      apiFetch("/admin/achievements", {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-achievements"] }); closeModal(); },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Erro ao criar."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AchievementForm> }) =>
      apiFetch(`/admin/achievements/${id}`, {
        method: "PATCH",
        token: accessToken ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-achievements"] }); closeModal(); },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Erro ao atualizar."),
  });

  function openCreate() { setEditTarget(null); setForm(EMPTY_FORM); setFormError(null); setModalOpen(true); }
  function openEdit(a: Achievement) { setEditTarget(a); setForm({ title: a.title, description: a.description, icon: a.icon, criteria: a.criteria, xpReward: a.xpReward }); setFormError(null); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditTarget(null); setFormError(null); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("Título é obrigatório."); return; }
    if (editTarget) { updateMutation.mutate({ id: editTarget.id, body: form }); }
    else { createMutation.mutate(form); }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>Conquistas</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Gerenciar as conquistas da plataforma.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Nova Conquista</button>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-md)" }} />)}
        </div>
      ) : achievements.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏆</div>
          <div>Nenhuma conquista cadastrada.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {achievements.map((a) => (
            <div key={a.id} className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", flexDirection: "column", gap: 8, opacity: a.isActive ? 1 : 0.5 }}>
              <div style={{ fontSize: "2.5rem", textAlign: "center" }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{a.title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", flex: 1 }}>{a.description}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--brand-400)", fontWeight: 600 }}>+{a.xpReward} XP</div>
              <button onClick={() => openEdit(a)} style={{ background: "none", border: "none", color: "var(--brand-400)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", textAlign: "left" }}>
                Editar →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: "var(--surface-1)", borderRadius: "var(--radius-lg)", padding: "28px", width: "100%", maxWidth: 480, border: "1px solid var(--surface-border)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>{editTarget ? "Editar Conquista" : "Nova Conquista"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, alignItems: "end" }}>
                <div>
                  <label style={labelStyle}>Ícone</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="input-field" style={{ textAlign: "center", fontSize: "1.5rem" }} maxLength={2} />
                </div>
                <div>
                  <label style={labelStyle}>Título</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" required placeholder="Ex: Primeira Lição" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field" rows={2} placeholder="Descrição da conquista" style={{ resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Critério (como desbloquear)</label>
                <input type="text" value={form.criteria} onChange={(e) => setForm((f) => ({ ...f, criteria: e.target.value }))} className="input-field" placeholder="Ex: Complete 1 lição" />
              </div>
              <div>
                <label style={labelStyle}>XP Recompensa</label>
                <input type="number" min={0} max={1000} value={form.xpReward} onChange={(e) => setForm((f) => ({ ...f, xpReward: Number(e.target.value) }))} className="input-field" />
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
