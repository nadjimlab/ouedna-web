"use client";

// عارض الجولة الافتراضية 360° لمعالم وادنا. يحمّل مكتبة Pannellum من CDN
// عند الحاجة فقط (بنفس أسلوب تحميل Leaflet في نماذج الإدارة)، بلا أي تبعية
// إضافية في package.json.
import { useEffect, useRef, useState } from "react";
import { Maximize2, RotateCw, View } from "lucide-react";

declare global {
  interface Window {
    pannellum?: any;
  }
}

const CSS_ID = "pannellum-css";
const JS_ID = "pannellum-js";
const CSS_URL = "https://unpkg.com/pannellum@2.5.6/build/pannellum.css";
const JS_URL = "https://unpkg.com/pannellum@2.5.6/build/pannellum.js";

export default function Pano360Viewer({ src, title, className }: { src?: string | null; title?: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    setStatus("loading");

    function init() {
      if (cancelled || !containerRef.current || !window.pannellum) return;
      try {
        viewerRef.current?.destroy?.();
        viewerRef.current = window.pannellum.viewer(containerRef.current, {
          type: "equirectangular",
          panorama: src,
          autoLoad: true,
          autoRotate: -2,
          compass: false,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          friction: 0.15,
          hfov: 110,
          hotSpotDebug: false,
        });
        viewerRef.current.on("load", () => !cancelled && setStatus("ready"));
        viewerRef.current.on("error", () => !cancelled && setStatus("failed"));
      } catch {
        if (!cancelled) setStatus("failed");
      }
    }

    if (window.pannellum) {
      init();
    } else {
      if (!document.getElementById(CSS_ID)) {
        const link = document.createElement("link");
        link.id = CSS_ID;
        link.rel = "stylesheet";
        link.href = CSS_URL;
        document.head.appendChild(link);
      }
      const existingScript = document.getElementById(JS_ID) as HTMLScriptElement | null;
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = JS_ID;
        script.src = JS_URL;
        script.async = true;
        script.onload = init;
        script.onerror = () => !cancelled && setStatus("failed");
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", init);
      }
    }

    return () => {
      cancelled = true;
      try {
        viewerRef.current?.destroy?.();
      } catch {}
      viewerRef.current = null;
    };
  }, [src]);

  if (!src) return null;

  return (
    <div className={`pano360 ${className || ""}`.trim()}>
      <div
        ref={containerRef}
        className="pano360__stage"
        role="img"
        aria-label={title ? `جولة افتراضية 360° داخل ${title}` : "جولة افتراضية 360°"}
      />
      {status === "loading" && (
        <div className="pano360__overlay">
          <RotateCw size={18} className="pano360__spin" />
          <span>جارٍ تحميل الجولة الافتراضية 360°…</span>
        </div>
      )}
      {status === "failed" && (
        <div className="pano360__overlay pano360__overlay--error">
          <View size={18} />
          <span>تعذّر تحميل الجولة الافتراضية حالياً. حاول لاحقاً.</span>
        </div>
      )}
      {status === "ready" && (
        <span className="pano360__hint">
          <Maximize2 size={12} /> اسحب للاستكشاف بزاوية 360°
        </span>
      )}
    </div>
  );
}
