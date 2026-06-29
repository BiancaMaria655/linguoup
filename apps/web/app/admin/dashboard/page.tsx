"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface AdminMetrics {
  totalUsers: number;
  activeToday: number;
  totalLessons: number;
  lessonsCompletedToday: number;
  totalAchievements: number;
}

export default function AdminDashboardPage() {
  const { accessToken } = useAuthStore();

  const { data: metrics, isLoading } = useQuery<AdminMetrics>({
    queryKey: ["admin-metrics"],
    queryFn: () => apiFetch("/admin/metrics", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });

  const cards = [
    { icon: "👥", label: "Total de Usuários", value: metrics?.totalUsers ?? 0, sub: `${metrics?.activeToday ?? 0} ativos hoje` },
    { icon: "📚", label: "Total de Lições", value: metrics?.totalLessons ?? 0, sub: `${metrics?.lessonsCompletedToday ?? 0} concluídas hoje` },
    { icon: "🏆", label: "Conquistas", value: metrics?.totalAchievements ?? 0, sub: "Cadastradas no sistema" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Visão geral da plataforma.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {cards.map(({ icon, label, value, sub }) => (
          <div
            key={label}
            className="glass"
            style={{ borderRadius: "var(--radius-lg)", padding: "20px" }}
          >
            <div style={{ fontSize: "1.75rem", marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--brand-300)" }}>
              {isLoading ? "—" : value.toLocaleString("pt-BR")}
            </div>
            <div style={{ fontWeight: 600, marginTop: 2, fontSize: "0.9rem" }}>{label}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { href: "/admin/lessons", icon: "📚", label: "Gerenciar Lições", desc: "Criar, editar e desativar lições" },
          { href: "/admin/achievements", icon: "🏆", label: "Gerenciar Conquistas", desc: "Criar e editar conquistas" },
        ].map(({ href, icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            style={{
              textDecoration: "none",
              padding: "20px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--surface-border)",
              background: "var(--surface-1)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>{icon}</div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{label}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
