# Ouedna — حزمة الإنتاج

هذه النسخة تتضمن تحسينات أمنية وSEO وحماية للـ API مع الحفاظ على منطق المشروع الحالي.

## قبل النشر

1. أنشئ ملف `.env.local` بالقيم الصحيحة لـ Supabase وأي متغيرات OSRM.
2. نفّذ `npm install` ثم `npm run lint` و `npm run build`.
3. اربط النطاق `myeloued.com` بشهادة HTTPS صحيحة.
4. راجع سياسات Supabase RLS قبل فتح لوحة الإدارة.
5. في الاستضافة متعددة النسخ، استبدل rate limiter المحلي في `/app/api/route/route.ts` بـ Redis/edge limiter.

## ما تم تحسينه

- Canonical رئيسي صحيح على `/` بدلاً من إعلان مسارات لغات غير موجودة.
- Structured Data على مستوى `WebSite` و`TouristDestination` و`Organization`.
- إزالة `unsafe-eval` من CSP.
- إضافة HSTS وCOOP وCORP وX-Permitted-Cross-Domain-Policies.
- حماية `/api/route` من الإغراق البسيط بمعدل 30 طلباً/دقيقة لكل عنوان عميل.
- الإبقاء على صفحات المعالم الديناميكية وبياناتها المنظمة.
- الإبقاء على PWA وSitemap وRSS وSupabase.

## ملاحظة

لم يتم تضمين `node_modules` أو الأسرار داخل الحزمة. لا تضع مفاتيح Supabase الخاصة أو كلمات المرور في Git.
