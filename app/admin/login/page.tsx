"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Archive, Eye, EyeOff, LockKeyhole, Mail, MapPinned, Route, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import styles from "../admin.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("role,permissions")
        .eq("id", data.user.id)
        .maybeSingle();
      const permissions = profile?.permissions;
      const hasPermission = profile?.role === "admin" || profile?.role === "supervisor" || (
        permissions && typeof permissions === "object" &&
        ["dashboard", "dashboard_access", "admin", "manage_dashboard"].some(
          (key) => (permissions as Record<string, unknown>)[key] === true,
        )
      );

      if (profileError || !hasPermission) {
        await supabase.auth.signOut();
        setErrorMsg("هذا الحساب لا يملك صلاحية الوصول إلى بوابة الإدارة.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("تعذر الاتصال حالياً. تحقق من اتصال الإنترنت وحاول مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <main className={styles.loginScene}>
      <div className={styles.loginBackdrop} aria-hidden="true" />
      <div className={styles.loginGlow} aria-hidden="true" />
      <header className={styles.loginBrand}>
        <Link href="/" aria-label="العودة إلى وادنا" className={styles.loginBrandLink}>
          <span className={styles.loginBrandMark}><span /></span>
          <span><strong>OUEDNA</strong><small>وادنا · WADI SOUF</small></span>
        </Link>
      </header>

      <section className={styles.loginLayout} aria-labelledby="login-title">
        <div className={styles.loginWelcome}>
          <span className={styles.loginEyebrow}><i /> المنصة الرقمية للسياحة بالوادي</span>
          <h1>وادنا<br /><em>قلب الصحراء ينبض هنا.</em></h1>
          <p>مرحباً بك في وادنا، منصتك لاكتشاف كنوز وادي سوف؛ من القباب التاريخية إلى الواحات الخضراء وسط الرمال الذهبية.</p>
          <div className={styles.loginValues}>
            <span><i><Route size={16} /></i> خط رحلتي</span>
            <span><i><Archive size={16} /></i> أرشيف وذكريات وادي سوف</span>
            <span><i><MapPinned size={16} /></i> خرائط تفاعلية ومسارات دقيقة</span>
          </div>
          <div className={styles.loginMeta}><span><ShieldCheck size={15} /> وصول محمي</span><span>Wadi Souf · Algeria</span></div>
        </div>

        <div className={styles.loginPanel}>
          <div className={styles.loginPanelTop}><span className={styles.loginPanelIcon}><LockKeyhole size={17} /></span><span>بوابة الإدارة</span></div>
          <h2 id="login-title">تسجيل الدخول</h2>
          <p className={styles.loginPanelIntro}>تسجيل الدخول إلى لوحة التحكم</p>

          {errorMsg ? <div className={styles.loginError} role="alert">{errorMsg}</div> : null}

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <label>
              <span>البريد الإلكتروني</span>
              <span className={styles.loginInputWrap}><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@ouedna.dz" autoComplete="email" dir="ltr" required /></span>
            </label>
            <label>
              <span>كلمة المرور</span>
              <span className={styles.loginInputWrap}><LockKeyhole size={16} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" dir="ltr" required /><button type="button" className={styles.passwordToggle} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>
            </label>
            <button type="submit" disabled={loading} className={styles.loginSubmit}>{loading ? "جاري تسجيل الدخول..." : <>دخول آمن <ArrowLeft size={16} /></>}</button>
          </form>
          <Link href="/admin/reset-password" className={styles.loginForgot}>نسيت كلمة المرور؟</Link>
          <small className={styles.loginPrivacy}>بيانات الدخول محمية عبر Supabase Authentication</small>
        </div>
      </section>
      <div className={styles.loginFooter}><span>وادنا · منصة السياحة الرقمية لولاية الوادي</span><span>01 / AUTHENTICATED ACCESS</span></div>
    </main>
  );
}
