"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface UserSettings {
  name: string;
  dailyGoalMinutes: number;
  preferredStudyHour: number;
  notificationFrequency: "never" | "once" | "twice" | "thrice";
}

const FREQ_OPTIONS: { value: UserSettings["notificationFrequency"]; label: string }[] = [
  { value: "never", label: "Nunca" },
  { value: "once", label: "1x por dia" },
  { value: "twice", label: "2x por dia" },
  { value: "thrice", label: "3x por dia" },
];

export default function SettingsPage() {
  const { accessToken, clearAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UserSettings>({
    name: "",
    dailyGoalMinutes: 10,
    preferredStudyHour: 8,
    notificationFrequency: "once",
  });
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery<UserSettings>({
    queryKey: ["settings"],
    queryFn: () => apiFetch("/users/me/settings", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch("/users/me", {
        method: "PATCH",
        token: accessToken ?? undefined,
        body: JSON.stringify({
          name: form.name,
          dailyGoalMinutes: form.dailyGoalMinutes,
          preferredStudyHour: form.preferredStudyHour,
          notificationFrequency: form.notificationFrequency,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>Configurações</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Personalize sua experiência de aprendizado.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: "var(--radius-md)" }} />
          ))}
        </div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Section: Profile */}
          <Section title="Perfil">
            <FieldRow label="Nome">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
                placeholder="Seu nome"
              />
            </FieldRow>
          </Section>

          {/* Section: Learning */}
          <Section title="Aprendizado">
            <FieldRow label={`Meta diária: ${form.dailyGoalMinutes} min`}>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={form.dailyGoalMinutes}
                onChange={(e) => setForm((f) => ({ ...f, dailyGoalMinutes: Number(e.target.value) }))}
                style={{ width: "100%", accentColor: "var(--brand-500)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span>5 min</span><span>60 min</span>
              </div>
            </FieldRow>

            <FieldRow label={`Horário preferencial: ${form.preferredStudyHour}h`}>
              <input
                type="range"
                min={5}
                max={23}
                value={form.preferredStudyHour}
                onChange={(e) => setForm((f) => ({ ...f, preferredStudyHour: Number(e.target.value) }))}
                style={{ width: "100%", accentColor: "var(--brand-500)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span>5h</span><span>23h</span>
              </div>
            </FieldRow>
          </Section>

          {/* Section: Notifications */}
          <Section title="Notificações">
            <FieldRow label="Frequência de lembretes">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {FREQ_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, notificationFrequency: value }))}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-full)",
                      border: `1px solid ${form.notificationFrequency === value ? "rgba(139,92,246,0.6)" : "var(--surface-border)"}`,
                      background: form.notificationFrequency === value ? "rgba(139,92,246,0.15)" : "transparent",
                      color: form.notificationFrequency === value ? "var(--brand-300)" : "var(--text-secondary)",
                      fontSize: "0.85rem",
                      fontWeight: form.notificationFrequency === value ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </FieldRow>
          </Section>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {saved && (
              <div className="feedback-correct" style={{ textAlign: "center" }}>
                ✅ Configurações salvas!
              </div>
            )}
            {saveMutation.isError && (
              <div className="feedback-incorrect">
                {saveMutation.error instanceof Error ? saveMutation.error.message : "Erro ao salvar."}
              </div>
            )}
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary" style={{ width: "100%" }}>
              {saveMutation.isPending ? "Salvando…" : "Salvar configurações"}
            </button>
          </div>

          {/* Legal & Logout */}
          <div style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 20, fontSize: "0.8rem" }}>
              <a href="#" style={{ color: "var(--brand-400)", textDecoration: "none" }}>Termos de Uso</a>
              <a href="#" style={{ color: "var(--brand-400)", textDecoration: "none" }}>Política de Privacidade</a>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{ padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}
            >
              Sair da Conta
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
        {title}
      </h2>
      <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
