import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./lib/supabase/config";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/reset-password"];
// --- Maintenance-mode flag -------------------------------------------------
// Cached in memory for a few seconds so public pages do not pay a database
// round-trip on every request. Toggling maintenance takes effect within TTL.
const MAINTENANCE_TTL_MS = 20_000;
let maintenanceCache: { value: boolean; expires: number } = { value: false, expires: 0 };

async function isMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (now < maintenanceCache.expires) return maintenanceCache.value;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=maintenance_mode&id=eq.1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) throw new Error(String(res.status));
    const rows = (await res.json()) as Array<{ maintenance_mode?: boolean }>;
    maintenanceCache = { value: rows[0]?.maintenance_mode === true, expires: now + MAINTENANCE_TTL_MS };
  } catch {
    // Fail open: a database hiccup must never take the public site down.
    maintenanceCache = { value: maintenanceCache.value, expires: now + 5_000 };
  }
  return maintenanceCache.value;
}

function hasDashboardPermission(profile: { role?: string | null; permissions?: unknown } | null) {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "supervisor") return true;
  if (!profile.permissions || typeof profile.permissions !== "object") return false;
  const permissions = profile.permissions as Record<string, unknown>;
  // A feature permission such as add_place must not grant access to the
  // entire dashboard. Require an explicit dashboard capability instead.
  return ["dashboard", "dashboard_access", "admin", "manage_dashboard"].some(
    (key) => permissions[key] === true,
  );
}

export async function middleware(request: NextRequest) {
  const hostname = (request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.hostname).split(":")[0].toLowerCase();
  if (hostname === "ouedna.myeloued.com") {
    const canonicalUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, "https://myeloued.com");
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  // ---- Public pages: only the (cached) maintenance flag, no auth round-trip ----
  if (!isAdminRoute) {
    if (pathname !== "/maintenance" && (await isMaintenanceMode())) {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
    return NextResponse.next();
  }

  // ---- Admin pages: refresh the session and enforce dashboard access ----
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPath = PUBLIC_ADMIN_PATHS.includes(pathname);
  let hasAdminAccess = false;

  if (user) {
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("role,permissions")
      .eq("id", user.id)
      .maybeSingle();
    hasAdminAccess = hasDashboardPermission(profile);
  }

  if (!isLoginPath && (!user || !hasAdminAccess)) {
    const loginUrl = new URL("/admin/login", request.url);
    if (user) loginUrl.searchParams.set("reason", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath && user && hasAdminAccess) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api/|_next/static|_next/image|favicon|icon-|images/|sw\\.js|manifest\\.webmanifest|offline\\.html|feed\\.xml|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|webp|ico|xml|txt|json|js|css|woff2?)$).*)",
  ],
};
