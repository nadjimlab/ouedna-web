import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./lib/supabase/config";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/reset-password"];
const EXCLUDED_PUBLIC_CATEGORIES = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);

function missingPlaceResponse() {
  return new NextResponse(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>المعلم غير موجود | وادنا</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b121f;color:#fff;font-family:Arial,sans-serif;text-align:center"><main style="max-width:520px;padding:40px"><strong style="font-size:64px;color:#f59e0b">404</strong><h1>المعلم غير موجود</h1><p style="line-height:1.8;color:#cbd5e1">يبدو أن هذا المعلم غير منشور أو لم يعد متاحاً في دليل وادنا.</p><a href="/explore" style="display:inline-block;margin-top:18px;padding:13px 22px;border-radius:999px;background:#f59e0b;color:#0b121f;text-decoration:none;font-weight:700">العودة إلى الدليل</a></main></body></html>`,
    { status: 404, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

function hasDashboardPermission(profile: { role?: string | null; permissions?: unknown } | null) {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  if (!profile.permissions || typeof profile.permissions !== "object") return false;
  return Object.values(profile.permissions as Record<string, unknown>).some((value) => value === true);
}

export async function middleware(request: NextRequest) {
  const hostname = (request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.hostname).split(":")[0].toLowerCase();
  if (hostname === "ouedna.myeloued.com") {
    const canonicalUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, "https://myeloued.com");
    return NextResponse.redirect(canonicalUrl, 308);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
    }
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/place/")) {
    const rawId = pathname.split("/")[2] || "";
    if (/^\d+$/.test(rawId)) {
      const { data: place } = await supabase
        .from("places")
        .select("id,status,main_category")
        .eq("id", Number(rawId))
        .maybeSingle();
      if (!place || place.status !== "منشور" || EXCLUDED_PUBLIC_CATEGORIES.has(place.main_category || "")) {
        return missingPlaceResponse();
      }
    }
  }
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPath = PUBLIC_ADMIN_PATHS.includes(pathname);
  let hasAdminAccess = false;

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("role,permissions")
      .eq("id", user.id)
      .maybeSingle();
    hasAdminAccess = hasDashboardPermission(profile);
  }

  if (isAdminRoute && !isLoginPath && (!user || !hasAdminAccess)) {
    const loginUrl = new URL("/admin/login", request.url);
    if (user) loginUrl.searchParams.set("reason", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath && user && hasAdminAccess) {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // وضع الصيانة: يُستثنى /admin (يبقى متاحاً للمدير/المشرف لإيقاف الصيانة)
  // ومسار /maintenance نفسه لتفادي حلقة تحويل لا نهائية.
  const isMaintenancePage = pathname === "/maintenance";
  if (!isAdminRoute && !isMaintenancePage) {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .single();

    if (settings?.maintenance_mode) {
      const maintenanceUrl = new URL("/maintenance", request.url);
      return NextResponse.rewrite(maintenanceUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon|icon-|images/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|xml|txt)$).*)",
  ],
};
