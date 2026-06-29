"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/lessons", label: "Lições", icon: "📚" },
  { href: "/admin/achievements", label: "Conquistas", icon: "🏆" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) { router.push("/login"); return; }
    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [accessToken, user, router]);

  if (!accessToken || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-0)" }}>
      {/* Admin sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: "var(--surface-1)",
          borderRight: "1px solid var(--surface-border)",
          padding: "24px 16px",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
              <path d="M4 8C4 5.79 5.79 4 8 4h12c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4h-4l-6 4v-4H8c-2.21 0-4-1.79-4-4V8z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <div>
            <div className="gradient-text" style={{ fontWeight: 700, fontSize: "0.9rem" }}>LinguoUp</div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: -2 }}>Admin</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {ADMIN_NAV.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <Link href="/dashboard" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          ← Portal do Aluno
        </Link>
      </aside>

      <main style={{ flex: 1, marginLeft: 220, padding: "32px 28px" }}>
        {children}
      </main>
    </div>
  );
}
