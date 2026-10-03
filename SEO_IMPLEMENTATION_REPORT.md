# SEO IMPLEMENTATION REPORT — Ouedna

**تاريخ التقرير:** 2026-10-03  
**النطاق:** checkpoint SEO تقني قابل للفهرسة، مبني على المشروع الحالي دون إعادة بناء أو تغيير مخطط Supabase.  
**آخر commit منشور:** `c803d4c`

## الملخص

تم تحسين أساس SEO للموقع مع الحفاظ على الصفحة الرئيسية، Supabase، PWA، الخريطة، المفضلة، خط الرحلة، الأرشيف، المجتمع، الجولات الافتراضية، وواجهات API الحالية. تم تنفيذ العمل تدريجياً، والتحقق من build والـHTML الخام والنشر على `https://myeloued.com`.

## مؤشرات التنفيذ المتحقق منها

| المؤشر | النتيجة |
| --- | ---: |
| صفحات التطبيق الموجودة في source | 20 |
| URLs ظاهرة في sitemap الحي | 22 |
| صفحات معالم منشورة في sitemap الحي | 12 |
| صفحات التفاصيل ذات metadata ديناميكية | جميع `/place/[id]` المنشورة |
| لغات الواجهة الحالية | AR / FR / EN عبر نظام اللغة الحالي |
| مسارات تم فحصها حياً | `/`, `/explore`, `/map`, `/itinerary`, `/archive`, `/guide`, `/place/66`, `/favorites`, `/suggest-place`, `/sitemap.xml`, `/robots.txt` |
| حالة البناء | `pnpm build` ناجح |
| lint للملفات المتغيرة | ناجح؛ بقيت تحذيرات غير مانعة في خط الصفحة/تحسينات قديمة فقط |
| حالة Git | نظيف ومتزامن مع `origin/main` |

## ما تم تنفيذه

### 1. Metadata Architecture

- إضافة `pageMetadata()` مركزي في `app/metadata.ts` لبناء title وdescription وcanonical المطلق وOpen Graph وTwitter/X.
- إضافة metadata مخصصة لمسارات الخريطة، خط الرحلة، الأرشيف، الدليل، المجتمع، التنزيل، والتحديثات.
- إضافة canonical مطلق للصفحات العامة التي كانت تستخدم canonical نسبيًا.
- إزالة hreflang الذي كان يعلن نفس URL للعربية والفرنسية والإنجليزية دون وجود مسارات لغة مستقلة؛ لا يتم ادعاء وجود صفحات locale غير موجودة.
- metadata ديناميكية لكل معلم منشور من اسمه ووصفه ورقمه.

### 2. Crawlable content وInternal Linking

- إضافة مقدمة نصية مرئية للخريطة داخل HTML الأولي.
- إضافة دليل Server-rendered أسفل الخريطة يحتوي **12 رابطاً حقيقياً** إلى `/place/[id]` من الأماكن المنشورة.
- صفحة المعلم تربط إلى: الرئيسية، دليل المعالم، الخريطة، خط الرحلة، الأماكن المرتبطة، والمجتمع.
- إضافة قسم الأماكن المرتبطة بناءً على البلدية أو التصنيف الفعلي من البيانات.
- الحفاظ على SSR للصفحة الرئيسية والاستكشاف والأرشيف والجولة الافتراضية وصفحات المعالم.

### 3. Structured Data و404

- الإبقاء على `WebSite` و`TouristDestination` و`Organization` العامة.
- الإبقاء على `TouristAttraction` و`BreadcrumbList` الديناميكية للمعالم مع الاسم والوصف والصورة والعنوان والإحداثيات والهاتف عند توفرها فقط.
- Breadcrumbs مرئية ومتطابقة مع البيانات المنظمة.
- المعلم غير الموجود أو غير المنشور يعيد 404 حقيقية بدلاً من soft-404.
- إزالة صياغة «تقييم موثّق» غير المثبتة واستبدالها بـ«التقييم المتاح».
- ضبط `/itinerary` كأداة شخصية `noindex, follow` وإزالته من sitemap حتى لا ينافس صفحات الهبوط العامة.

### 4. Sitemap وRobots وUtility pages

- sitemap ديناميكي يضيف المعالم المنشورة ويستبعد الفئات الصحية المحددة.
- استبعاد `/favorites` و`/suggest-place` من sitemap لأنهما utility/noindex.
- `robots.txt` يسمح بالصفحات وCSS/JS الضرورية ويمنع `/api/` و`/admin/` فقط.
- `/favorites` و`/suggest-place` يعيدان `noindex, follow` مع canonical خاص بهما، وليس canonical الصفحة الرئيسية.

### 5. Image SEO

- alt وصفي للصورة الحقيقية في Hero الصفحة الرئيسية.
- صور معرض المعلم تستخدم `next/image` بأبعاد و`loading="lazy"` و`unoptimized` للروابط الخارجية الحالية.
- الحفاظ على alt الوصفي للبطاقات والصور التي تحمل معنى فعلياً.

## Keyword Map

| الكلمة / المجموعة | الصفحة | نوع intent |
| --- | --- | --- |
| الوادي، وادي سوف، ولاية الوادي، El Oued | `/` | Navigational / Local |
| السياحة في الوادي، أماكن سياحية في وادي سوف، معالم الوادي | `/explore` | Informational / Travel |
| خريطة الوادي، خريطة وادي سوف، معالم الوادي على الخريطة | `/map` | Utility / Local |
| خط رحلة الوادي، برنامج سياحي، رحلة يوم واحد | `/itinerary` | Planning / Travel |
| جولة افتراضية الوادي، 360 وادي سوف | `/virtual-tour` | Exploratory / Visual |
| تراث الوادي، تاريخ وادي سوف، عمارة الوادي | `/archive` | Informational / Heritage |
| دليل زيارة الوادي، ماذا تفعل في الوادي | `/guide` | Informational / Assistant |
| اسم المعلم + الوادي، زيارة اسم المعلم، صور اسم المعلم | `/place/[id]` | Local / Informational |
| تجارب زوار وادي سوف | `/community` | Informational / Community |

## التحقق الحي

- `https://myeloued.com/map` يعيد `200`، ويحتوي H1: **خريطة الوادي السياحية**، وcanonical خاصاً بالخريطة، و12 رابطاً لخدمات المعالم في HTML الخام.
- `https://myeloued.com/place/66` يعيد `200` مع title وH1 وcanonical خاصين بفندق ترونزات التاريخي.
- `https://myeloued.com/sitemap.xml` يعيد `200` ويحتوي 22 URL، منها 12 صفحة معلم منشورة.
- `https://myeloued.com/robots.txt` يعيد `200` ويمنع `/api/` و`/admin/` ويعلن sitemap.
- `/favorites` و`/suggest-place` يعيدان `noindex, follow` وcanonical خاصاً بهما.

## ما يحتاج بيانات أو قراراً من مالك الموقع

1. **اللغات القابلة للفهرسة:** الواجهة تبدّل العربية/الفرنسية/الإنجليزية على نفس URL عبر cookie. إنشاء `/ar` و`/fr` و`/en` يحتاج قراراً منتجياً وترجمة SSR فعلية، لذلك لم تتم إضافة hreflang وهمي.
2. **الصور:** بعض صور Supabase خارجية وروابطها legacy؛ تستخدم صفحة المعلم الآن صورة المكان الفعلية في OG عند توفرها، ويمكن نقل الصور أو توحيدها إلى WebP/AVIF بعد اعتماد مصدر التخزين وسياسة الملفات.
3. **التاريخ والمصادر:** الأرشيف يعرض فقط البيانات الموجودة؛ يلزم توفير مصادر موثوقة قبل إضافة تاريخ أو سياق ثقافي تفصيلي.
4. **التقييمات:** لا يوجد في الكود مصدر مستقل يثبت أن التقييمات «موثقة»؛ لذلك تستخدم الصفحة صياغة محايدة.
5. **المرشدون السياحيون:** البنية قابلة للإضافة مستقبلاً، لكن لا توجد سجلات حقيقية مصرح بها لإنشاء صفحات قابلة للفهرسة.
6. **الـsitemap:** تم إيقاف `lastModified` المتغير للمسارات الثابتة، والعدد الحالي أقل من حد 5000؛ عند النمو يجب إضافة pagination أو sitemap index.

## التحذيرات غير المانعة

- Next.js يحذر من convention قديم باسم `middleware` ويوصي مستقبلاً بـ`proxy`.
- يوجد تحذير قديم متعلق بتحميل الخطوط من `layout.tsx`.
- أي تحسين إضافي لـCore Web Vitals يحتاج قياساً ميدانياً على أجهزة وشبكات حقيقية، وليس تخميناً من build فقط.

## الملفات الرئيسية المعدلة

- `app/metadata.ts`
- `app/layout.tsx`
- `app/map/layout.tsx`
- `app/map/page.tsx`
- `app/app-shell.css`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/page.tsx`
- `app/place/[id]/page.tsx`
- `app/itinerary/page.tsx`
- `app/archive/page.tsx`
- `app/guide/page.tsx`
- `app/community/page.tsx`
- `app/download/page.tsx`
- `app/updates/page.tsx`
- `app/favorites/page.tsx`
- `app/suggest-place/page.tsx`
- `app/about/page.tsx`
- `app/privacy/page.tsx`
- `app/explore/page.tsx`
- `components/home/HomeHero.tsx`
- `plan.md`
