import { siteConfig } from "../metadata";

const entries = [
  ["استكشف معالم وادي سوف", "/explore", "تصفح المعالم والوجهات المنشورة في دليل وادنا."],
  ["خريطة وادي سوف والمسارات", "/map", "افتح الخريطة التفاعلية وخطط مسارك القادم."],
  ["ذاكرة الوادي", "/archive", "اكتشف الصور والقصص التراثية من ولاية الوادي."],
  ["صوت الزوار", "/community", "شارك تجربة أو صورة أو اقتراحاً مع مجتمع وادنا."],
  ["مخطط الرحلة", "/itinerary", "أنشئ برنامجاً سريعاً أو يوماً كاملاً لاكتشاف سوف."],
] as const;

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] || character);
}

export function GET() {
  const updated = new Date().toUTCString();
  const items = entries.map(([title, path, description]) => `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${siteConfig.url}${path}</link>
      <guid isPermaLink="true">${siteConfig.url}${path}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${updated}</pubDate>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ar-DZ</language>
    <lastBuildDate>${updated}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
