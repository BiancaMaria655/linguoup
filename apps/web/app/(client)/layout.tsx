"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Notification } from "@/app/hooks/useNotificationsScreen";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Início", icon: HomeIcon },
  { href: "/lessons", label: "Trilhas", icon: BookIcon },
  { href: "/reviews", label: "Revisões", icon: RefreshIcon },
  { href: "/progress", label: "Progresso", icon: ChartIcon },
  { href: "/profile", label: "Perfil", icon: UserIcon },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    } else if (user && !user.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [accessToken, user, router]);

  // Badge: use same ["notifications"] key as NotificationsPage — TanStack Query deduplicates the request
  const { data: notificationsData = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => apiFetch("/notifications", { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });
  const unreadCount = notificationsData.filter((n) => !n.read).length;

  if (!accessToken) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-0)" }}>
      {/* Sidebar (desktop) */}
      <aside
        style={{
          width: "var(--nav-width)",
          flexShrink: 0,
          background: "var(--surface-1)",
          borderRight: "1px solid var(--surface-border)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          overflowY: "auto",
        }}
        className="desktop-sidebar"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 4 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <path d="M4 8C4 5.79 5.79 4 8 4h12c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4h-4l-6 4v-4H8c-2.21 0-4-1.79-4-4V8z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="gradient-text" style={{ fontWeight: 700, fontSize: "1rem" }}>LinguoUp</span>
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            const isProfile = href === "/profile";
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <span style={{ position: "relative", display: "inline-flex" }}>
                  <Icon size={18} />
                  {isProfile && unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -6,
                        minWidth: 14,
                        height: 14,
                        borderRadius: "var(--radius-full)",
                        background: "var(--brand-500)",
                        color: "white",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {user && (
          <div
            style={{
              marginTop: "auto",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-2)",
              border: "1px solid var(--surface-border)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "white",
                marginBottom: 8,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main
        style={{ flex: 1, marginLeft: "var(--nav-width)", paddingBottom: 80 }}
        className="client-main"
      >
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav" role="navigation" aria-label="Navegação principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const isProfile = href === "/profile";
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 12px",
                color: active ? "var(--brand-400)" : "var(--text-muted)",
                textDecoration: "none",
                fontSize: "0.65rem",
                fontWeight: active ? 600 : 400,
              }}
            >
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Icon size={20} />
                {isProfile && unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -6,
                      minWidth: 14,
                      height: 14,
                      borderRadius: "var(--radius-full)",
                      background: "var(--brand-500)",
                      color: "white",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────
function HomeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function RefreshIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function ChartIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
