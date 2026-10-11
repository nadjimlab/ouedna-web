import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type AdminRole = "admin" | "supervisor";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || !SUPABASE_URL) return null;
  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getActor() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const cookieStore = await cookies();
  const response = NextResponse.next();
  const sessionClient = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sessionClient
    .from("admin_profiles")
    .select("id,role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin" ? { id: user.id } : null;
}

function parseRole(value: unknown): AdminRole | null {
  return value === "admin" || value === "supervisor" ? value : null;
}

export async function POST(request: NextRequest) {
  const actor = await getActor();
  if (!actor) return errorResponse("غير مصرح بهذا الإجراء.", 403);
  const admin = await getAdminClient();
  if (!admin) return errorResponse("إعدادات الإدارة الخادمية غير مكتملة.", 503);

  let body: { name?: unknown; email?: unknown; role?: unknown; active?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("بيانات الطلب غير صالحة.");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = parseRole(body.role);
  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role) {
    return errorResponse("الاسم أو البريد الإلكتروني أو الصلاحية غير صالحة.");
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name },
  });
  if (error || !data.user) return errorResponse(error?.message || "تعذر إنشاء دعوة المشرف.", 409);

  const { error: profileError } = await admin.from("admin_profiles").upsert({
    id: data.user.id,
    email,
    full_name: name,
    role,
    permissions: role === "admin"
      ? { add_place: true, maintenance: true, manage_users: true }
      : { add_place: true, maintenance: false, manage_users: false },
  }, { onConflict: "id" });
  if (profileError) {
    await admin.auth.admin.updateUserById(data.user.id, { ban_duration: "876000h" });
    return errorResponse("تم إنشاء الدعوة لكن تعذر حفظ صلاحيات المشرف.", 500);
  }

  if (body.active === false) {
    await admin.auth.admin.updateUserById(data.user.id, { ban_duration: "876000h" });
  }

  return NextResponse.json({
    id: data.user.id,
    name,
    email,
    role,
    active: body.active !== false,
  }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: NextRequest) {
  const actor = await getActor();
  if (!actor) return errorResponse("غير مصرح بهذا الإجراء.", 403);
  const admin = await getAdminClient();
  if (!admin) return errorResponse("إعدادات الإدارة الخادمية غير مكتملة.", 503);

  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("بيانات الطلب غير صالحة.");
  }
  const userId = typeof body.id === "string" ? body.id : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return errorResponse("معرّف المشرف غير صالح.");
  }
  if (userId === actor.id) return errorResponse("لا يمكنك تعطيل حسابك الحالي.");

  const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  if (banError) return errorResponse("تعذر تعطيل حساب المصادقة.", 500);
  const { error: profileError } = await admin.from("admin_profiles").delete().eq("id", userId);
  if (profileError) return errorResponse("تم تعطيل الحساب لكن تعذر حذف ملف الصلاحيات.", 500);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
