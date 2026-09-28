"use client";

import { useState } from "react";
import { Maximize2, View } from "lucide-react";
import Pano360Viewer from "./Pano360Viewer";

export default function LazyPano360({ src, title }: { src: string; title: string }) {
  const [started, setStarted] = useState(false);
  if (!started) return <div className="lazy-pano360"><div><View size={28} /><strong>استكشف المكان بزاوية 360°</strong><p>اسحب، كبّر، واستكشف التفاصيل من كل الجهات.</p><button type="button" className="platform-button platform-button--amber" onClick={() => setStarted(true)}><Maximize2 size={16} /> ابدأ الجولة</button></div></div>;
  return <Pano360Viewer src={src} title={title} className="place-detail-tour__stage" />;
}
