"use client";

import { useEffect } from "react";

export default function PwaRuntime() {
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    document.documentElement.classList.toggle("is-standalone", standalone);
    const media = window.matchMedia("(display-mode: standalone)");
    const onChange = (event: MediaQueryListEvent) => document.documentElement.classList.toggle("is-standalone", event.matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true);
    media.addEventListener?.("change", onChange);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => media.removeEventListener?.("change", onChange);
  }, []);
  return null;
}
