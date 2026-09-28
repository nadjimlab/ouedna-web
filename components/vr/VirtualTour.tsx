"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, ChevronLeft, ChevronRight, Maximize2, Minimize2, MapPin, Minus, Pause, Play, Plus, Smartphone, View, X,
} from "lucide-react";
import Pano360Viewer from "@/components/platform/Pano360Viewer";
import { useLanguage } from "@/lib/i18n";
import "./vr.css";

export type Stop = { id: number; name: string; place: string; category: string; description: string; photos: string[]; pano: string | null };
type Scene = { kind: "photo" | "pano"; src: string };

const BASE = 1.25; // تكبير أساسي يترك هامشاً للتجول داخل الصورة
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// طبقتان: الصورة السابقة تبقى تحت الجديدة أثناء التلاشي فلا يظهر وميض أسود.
function Eye({ src, setRef }: { src: string; setRef: (el: HTMLDivElement | null) => void }) {
  const [prev, setPrev] = useState<string | null>(null);
  const last = useRef(src);
  useEffect(() => {
    if (last.current === src) return;
    setPrev(last.current);
    last.current = src;
    const id = window.setTimeout(() => setPrev(null), 1100);
    return () => window.clearTimeout(id);
  }, [src]);
  return (
    <div className="vr__move" ref={setRef}>
      {prev && <img className="vr__img" src={prev} alt="" draggable={false} />}
      <img key={src} className="vr__img vr__img--in" src={src} alt="" draggable={false} />
    </div>
  );
}

export default function VirtualTour({ stops }: { stops: Stop[] }) {
  const { t, dir } = useLanguage();
  const [si, setSi] = useState(0);
  const [pi, setPi] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [vr, setVr] = useState(false);
  const [fs, setFs] = useState(false);
  const [gyro, setGyro] = useState(false);
  const [gyroOk, setGyroOk] = useState(false);
  const [hint, setHint] = useState(true);

  const m = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, zoom: 1, cz: 1, drag: false, idle: 0, gyro: false, gx: 0, gy: 0 });
  const eyes = useRef<(HTMLDivElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const stop = stops[si];
  const scenes: Scene[] = useMemo(() => {
    if (!stop) return [];
    return [...(stop.pano ? [{ kind: "pano" as const, src: stop.pano }] : []), ...stop.photos.map((src) => ({ kind: "photo" as const, src }))];
  }, [stop]);
  const scene = scenes[Math.min(pi, scenes.length - 1)];

  const go = useCallback((delta: 1 | -1) => {
    if (!stops.length) return;
    const count = scenes.length;
    if (delta === 1) {
      if (pi < count - 1) setPi(pi + 1);
      else { setSi((si + 1) % stops.length); setPi(0); }
    } else if (pi > 0) setPi(pi - 1);
    else {
      const prevIdx = (si - 1 + stops.length) % stops.length;
      const prevStop = stops[prevIdx];
      setSi(prevIdx);
      setPi(Math.max(0, prevStop.photos.length + (prevStop.pano ? 1 : 0) - 1));
    }
  }, [pi, scenes.length, si, stops]);

  // حلقة الحركة: تنعيم + جولة هادئة تلقائية عند عدم اللمس. تكتب مباشرة على العناصر دون إعادة رسم React.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const loop = (now: number) => {
      const s = m.current;
      if (s.gyro) { s.tx = s.gx; s.ty = s.gy; }
      else if (!s.drag && !reduce && now - s.idle > 2500) { s.tx = Math.sin(now / 9000) * 0.7; s.ty = Math.sin(now / 13000) * 0.25; }
      s.cx += (s.tx - s.cx) * 0.1; s.cy += (s.ty - s.cy) * 0.1; s.cz += (s.zoom - s.cz) * 0.12;
      const sc = BASE * s.cz;
      eyes.current.forEach((el) => {
        const p = el?.parentElement;
        if (!el || !p) return;
        el.style.transform = `translate3d(${s.cx * ((sc - 1) / 2) * p.clientWidth}px,${s.cy * ((sc - 1) / 2) * p.clientHeight}px,0) scale(${sc})`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // السحب: الصورة تتبع الإصبع
  const onDown = (e: React.PointerEvent) => { m.current.drag = true; m.current.idle = performance.now(); setHint(false); (e.target as Element).setPointerCapture?.(e.pointerId); };
  const onMove = (e: React.PointerEvent) => {
    const s = m.current;
    if (!s.drag) return;
    const p = e.currentTarget as HTMLElement;
    const eye = vr ? p.clientWidth / 2 : p.clientWidth;
    const mx = Math.max(1, ((BASE * s.zoom - 1) / 2) * eye), my = Math.max(1, ((BASE * s.zoom - 1) / 2) * p.clientHeight);
    s.tx = clamp(s.tx + e.movementX / mx, -1, 1); s.ty = clamp(s.ty + e.movementY / my, -1, 1); s.idle = performance.now();
  };
  const onUp = () => { m.current.drag = false; m.current.idle = performance.now(); };
  const onWheel = (e: React.WheelEvent) => { m.current.zoom = clamp(m.current.zoom - e.deltaY * 0.002, 1, 2.4); };
  const zoomBy = (d: number) => { m.current.zoom = clamp(m.current.zoom + d, 1, 2.4); };

  // حساس الحركة في الهاتف (يحتاج إذناً صريحاً في iOS)
  useEffect(() => { setGyroOk("DeviceOrientationEvent" in window && window.matchMedia("(pointer: coarse)").matches); }, []);
  const enableGyro = useCallback(async () => {
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    try { if (DOE?.requestPermission && (await DOE.requestPermission()) !== "granted") return; } catch { return; }
    setGyro(true); setHint(false);
  }, []);
  useEffect(() => {
    if (!gyro) return;
    const s = m.current;
    let base: { a: number; b: number; g: number } | null = null;
    s.gyro = true;
    const on = (e: DeviceOrientationEvent) => {
      if (e.alpha == null) return;
      if (!base) base = { a: e.alpha, b: e.beta ?? 0, g: e.gamma ?? 0 };
      const ang = screen.orientation?.angle ?? 0;
      const land = ang === 90 || ang === 270;
      const da = ((e.alpha - base.a + 540) % 360) - 180;
      const dv = land ? ((e.gamma ?? 0) - base.g) * (ang === 90 ? -1 : 1) : (e.beta ?? 0) - base.b;
      s.gx = clamp(da / 35, -1, 1); s.gy = clamp(dv / 25, -1, 1);
    };
    window.addEventListener("deviceorientation", on);
    return () => { s.gyro = false; window.removeEventListener("deviceorientation", on); };
  }, [gyro]);

  // ملء الشاشة + وضع النظارة (شاشة مقسومة لعينين، أفقياً)
  const toggleFs = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await rootRef.current?.requestFullscreen(); } catch { /* غير مدعوم */ } };
  const enterVr = async () => {
    setVr(true);
    try { await rootRef.current?.requestFullscreen(); await (screen.orientation as unknown as { lock?: (o: string) => Promise<void> }).lock?.("landscape"); } catch { /* اختياري */ }
    if (gyroOk && !gyro) void enableGyro();
  };
  const exitVr = async () => { setVr(false); try { screen.orientation.unlock(); if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* اختياري */ } };
  useEffect(() => {
    const onFs = () => { const on = Boolean(document.fullscreenElement); setFs(on); if (!on) setVr(false); };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const next = dir === "rtl" ? "ArrowLeft" : "ArrowRight", prev = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      if (e.key === next) go(1); else if (e.key === prev) go(-1); else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dir, go]);

  // تحميل مسبق للصورة التالية
  useEffect(() => { const n = scenes[pi + 1]; if (n?.kind === "photo") new Image().src = n.src; }, [scenes, pi]);

  if (!stop || !scene) {
    return (
      <div className="vr vr--empty">
        <View size={44} aria-hidden="true" />
        <p>{t("vrEmpty")}</p>
        <Link href="/explore" className="vr__cta">{t("explore")}</Link>
      </div>
    );
  }

  const Prev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const Next = dir === "rtl" ? ChevronLeft : ChevronRight;
  const isPano = scene.kind === "pano";

  return (
    <div ref={rootRef} className={`vr${vr ? " vr--goggles" : ""}${playing ? "" : " vr--paused"}`}>
      <div className="vr__stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}>
        {isPano ? (
          <div className="vr__eye vr__eye--pano"><Pano360Viewer src={scene.src} title={stop.name} className="vr__pano" /></div>
        ) : (vr ? [0, 1] : [0]).map((i) => (
          <div className="vr__eye" key={i}><Eye src={scene.src} setRef={(el) => { eyes.current[i] = el; }} /></div>
        ))}
      </div>
      <div className="vr__shade" aria-hidden="true" />

      <div className="vr__top">
        <Link href="/" className="vr__btn" aria-label={t("home")}><ArrowRight size={20} /></Link>
        <strong className="vr__brand">{t("vrTour")}</strong>
        <div className="vr__tools">
          {gyroOk && !isPano && <button type="button" className={`vr__btn${gyro ? " is-on" : ""}`} onClick={() => (gyro ? setGyro(false) : enableGyro())} aria-pressed={gyro} aria-label={t("vrGyro")} title={t("vrGyro")}><Smartphone size={19} /></button>}
          {!isPano && <button type="button" className="vr__btn" onClick={enterVr} aria-label={t("vrGoggles")} title={t("vrGoggles")}><View size={20} /></button>}
          <button type="button" className="vr__btn" onClick={toggleFs} aria-label={t("vrFullscreen")}>{fs ? <Minimize2 size={19} /> : <Maximize2 size={19} />}</button>
        </div>
      </div>

      {vr && <button type="button" className="vr__exit" onClick={exitVr}><X size={16} />{t("vrExit")}</button>}
      {!isPano && !vr && (
        <div className="vr__zoom">
          <button type="button" className="vr__btn" onClick={() => zoomBy(0.3)} aria-label={t("vrZoomIn")}><Plus size={18} /></button>
          <button type="button" className="vr__btn" onClick={() => zoomBy(-0.3)} aria-label={t("vrZoomOut")}><Minus size={18} /></button>
        </div>
      )}
      {hint && !isPano && !vr && <p className="vr__hint">{t("vrHint")}</p>}

      <div className="vr__panel">
        <div className="vr__segs" aria-hidden="true">
          {scenes.map((_, i) => (
            <span key={i} className={`vr__seg${i < pi ? " is-done" : ""}${i === pi ? " is-now" : ""}`}>
              <i onAnimationEnd={i === pi && playing ? () => go(1) : undefined} />
            </span>
          ))}
        </div>
        <div className="vr__info">
          <div>
            <h1>{stop.name}</h1>
            <p className="vr__loc">
              {stop.place && <span><MapPin size={14} />{stop.place}</span>}
              {isPano && <span className="vr__tag">{t("vrPano")}</span>}
            </p>
            {stop.description && <p className="vr__desc">{stop.description}</p>}
          </div>
          <Link href={`/place/${stop.id}`} className="vr__cta">{t("vrDetails")}</Link>
        </div>
        <div className="vr__ctrl">
          <button type="button" className="vr__btn" onClick={() => go(-1)} aria-label={t("vrPrev")}><Prev size={22} /></button>
          <button type="button" className="vr__btn vr__btn--main" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t("vrPause") : t("vrPlay")}>{playing ? <Pause size={22} /> : <Play size={22} />}</button>
          <button type="button" className="vr__btn" onClick={() => go(1)} aria-label={t("vrNext")}><Next size={22} /></button>
        </div>
        <div className="vr__rail" role="tablist" aria-label={t("landmarks")}>
          {stops.map((s, i) => (
            <button key={s.id} type="button" role="tab" aria-selected={i === si} className={`vr__thumb${i === si ? " is-on" : ""}`} onClick={() => { setSi(i); setPi(0); }} title={s.name}>
              {s.photos[0] ? <img src={s.photos[0]} alt="" loading="lazy" draggable={false} /> : <View size={22} />}
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
