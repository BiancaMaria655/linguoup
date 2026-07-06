import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register"];
const ADMIN_PATHS = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("linguoup-auth")?.value;
  let parsed: { state?: { accessToken?: string; user?: { role?: string; onboardingCompleted?: boolean } } } | null = null;
  try {
    parsed = token ? JSON.parse(token) : null;
  } catch {
    parsed = null;
  }

  const accessToken = parsed?.state?.accessToken ?? null;
  const role = parsed?.state?.user?.role ?? null;
  const onboardingCompleted = parsed?.state?.user?.onboardingCompleted ?? false;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  // Protect authenticated-only routes
  if (!accessToken && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Force onboarding flow if not completed
  if (accessToken && !onboardingCompleted && pathname !== "/onboarding" && !pathname.startsWith("/onboarding/") && pathname !== "/assessment" && !pathname.startsWith("/assessment/")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Redirect onboarded users away from onboarding pages
  if (accessToken && onboardingCompleted && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (accessToken && isPublic && pathname !== "/" && !pathname.startsWith("/onboarding") && !pathname.startsWith("/assessment")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect admin routes
  if (isAdmin && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
