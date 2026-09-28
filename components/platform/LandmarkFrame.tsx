"use client";

import type { ReactNode } from "react";
import { View } from "lucide-react";

type LandmarkFrameProps = {
  src?: string;
  alt: string;
  variant?: "card" | "feature" | "thumb";
  category?: string;
  tour?: boolean;
  index?: number;
  children?: ReactNode;
};

function FallbackArt({ hidden = false }: { hidden?: boolean }) {
  return <svg className={`landmark-frame__fallback${hidden ? " is-hidden" : ""}`} viewBox="0 0 320 220" role="img" aria-label="صورة احتياطية لمعْلم من وادي سوف"><rect width="320" height="220" fill="#e8efe7" /><path d="M0 170 Q80 120 160 166 T320 155V220H0Z" fill="#c79752" opacity=".7" /><path d="M92 168V112a68 68 0 0 1 136 0v56" fill="#17483d" /><path d="M106 166V113a54 54 0 0 1 108 0v53" fill="#d7a35a" /><path d="M150 166v-49a10 10 0 0 1 20 0v49" fill="#17483d" /><path d="M52 178c8-44 18-62 29-81m-29 81c-2-42 4-71 14-91m-14 50-27-17m34 1 26-26" stroke="#235941" strokeWidth="6" strokeLinecap="round" fill="none" /></svg>;
}

export default function LandmarkFrame({ src, alt, variant = "card", category, tour, index, children }: LandmarkFrameProps) {
  return <div className={`landmark-frame landmark-frame--${variant}`}>
    <div className="landmark-frame__art">{src ? <img src={src} alt={alt} loading={variant === "feature" ? "eager" : "lazy"} onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling?.classList.remove("is-hidden"); }} /> : null}<FallbackArt hidden={Boolean(src)} /><span className="landmark-frame__gold-line" /></div>
    {category ? <span className="landmark-frame__category">{category}</span> : null}
    {tour ? <span className="landmark-frame__tour"><View size={12} /> 360°</span> : null}
    {typeof index === "number" ? <span className="landmark-frame__index">{String(index + 1).padStart(2, "0")}</span> : null}
    {children}
  </div>;
}
