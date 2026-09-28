import type { CSSProperties } from "react";

// مشهد صحراء متحرك بالكامل (SVG + CSS) — بلا مكتبات ولا JavaScript، ويحترم prefers-reduced-motion.
// طبقات: سماء متدرجة ونجوم + شمس متوهجة + غيوم + كثبان متوازية (parallax) + قافلة جمال + نخيل + ذرات رمل.

const W = 1440;

// كثيب متكرر بسلاسة: يبدأ وينتهي عند نفس الارتفاع فيمكن تكراره بلا خياطة ظاهرة.
function dune(y0: number, y1: number, y2: number, y3: number) {
  return `M0,${y0} Q180,${y0 - 70} 360,${y1} T720,${y2} T1080,${y3} T${W},${y0} L${W},700 L0,700 Z`;
}

const LAYERS = [
  { cls: "far", d: dune(250, 215, 260, 225), fill: "url(#dsFar)", dur: 240 },
  { cls: "mid", d: dune(300, 240, 310, 255), fill: "url(#dsMid)", dur: 170 },
  { cls: "near", d: dune(360, 290, 370, 300), fill: "url(#dsNear)", dur: 110 },
  { cls: "fore", d: dune(430, 380, 440, 390), fill: "url(#dsFore)", dur: 70 },
];

const STARS = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 34,
  size: 1 + (i % 3) * 0.7,
  delay: (i % 9) * 0.6,
}));

const SAND = Array.from({ length: 34 }, (_, i) => ({
  top: 38 + ((i * 29 + 5) % 58),
  size: 1.5 + (i % 4) * 0.9,
  dur: 9 + (i % 7) * 2.3,
  delay: -((i * 1.7) % 16),
  drift: 12 + (i % 5) * 9,
}));

function Camel({ x, s = 1, phase = 0 }: { x: number; s?: number; phase?: number }) {
  return (
    <g transform={`translate(${x},0) scale(${s})`} className="ds-camel">
      <g className="ds-camel__bob" style={{ animationDelay: `${phase}s` }}>
        <path d="M6,22 Q6,14 16,14 L40,14 Q47,14 47,21 L47,26 L6,26 Z" />
        <path d="M19,15 Q27,1 36,15 Z" />
        <path d="M41,17 Q49,11 51,3 L56,5 Q54,16 46,23 Z" />
        <ellipse cx="55" cy="4.5" rx="5" ry="2.8" />
        <path d="M5,20 Q0,24 2,32 L4,32 Q4,26 8,24 Z" />
        {[10, 17, 35, 42].map((lx, i) => (
          <g key={lx} className={`ds-leg ${i % 2 ? "ds-leg--b" : "ds-leg--a"}`} style={{ transformOrigin: `${lx + 1.5}px 26px` }}>
            <rect x={lx} y="26" width="3.2" height="16" rx="1.4" />
          </g>
        ))}
      </g>
    </g>
  );
}

function Palm({ className, height = 230 }: { className?: string; height?: number }) {
  const fronds = [-70, -42, -14, 14, 42, 70, 100, -100];
  return (
    <svg className={`ds-palm ${className || ""}`} viewBox="-120 -230 240 240" height={height} aria-hidden="true">
      <g className="ds-palm__sway">
        <path d="M0,10 C10,-60 -8,-130 2,-188" stroke="#1d130c" strokeWidth="9" fill="none" strokeLinecap="round" />
        <g transform="translate(2,-188)">
          {fronds.map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0,0 Q46,-34 96,6 Q50,-12 0,0Z" fill="#17301f" />
          ))}
          <circle r="6" fill="#0f1c14" />
        </g>
      </g>
    </svg>
  );
}

export default function DesertScene() {
  return (
    <div className="desert-scene" aria-hidden="true">
      <div className="ds-sky" />
      <div className="ds-stars">
        {STARS.map((s, i) => (
          <i key={i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
        ))}
      </div>
      <div className="ds-sun"><span className="ds-sun__glow" /><span className="ds-sun__disc" /></div>
      <div className="ds-cloud ds-cloud--1" />
      <div className="ds-cloud ds-cloud--2" />
      <div className="ds-haze" />

      {LAYERS.slice(0, 2).map((l) => (
        <svg key={l.cls} className={`ds-dune ds-dune--${l.cls}`} viewBox={`0 0 ${W * 2} 700`} preserveAspectRatio="none" style={{ animationDuration: `${l.dur}s` }}>
          <path d={l.d} fill={l.fill} />
          <path d={l.d} fill={l.fill} transform={`translate(${W},0)`} />
        </svg>
      ))}

      <svg className="ds-caravan" viewBox="0 0 260 44" aria-hidden="true">
        <Camel x={0} s={1} phase={0} />
        <Camel x={80} s={0.94} phase={0.35} />
        <Camel x={158} s={1.02} phase={0.7} />
      </svg>

      {LAYERS.slice(2).map((l) => (
        <svg key={l.cls} className={`ds-dune ds-dune--${l.cls}`} viewBox={`0 0 ${W * 2} 700`} preserveAspectRatio="none" style={{ animationDuration: `${l.dur}s` }}>
          <path d={l.d} fill={l.fill} />
          <path d={l.d} fill={l.fill} transform={`translate(${W},0)`} />
        </svg>
      ))}

      <Palm className="ds-palm--l" height={250} />
      <Palm className="ds-palm--r" height={170} />

      <div className="ds-sand">
        {SAND.map((p, i) => (
          <i key={i} style={{ top: `${p.top}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, "--drift": `${p.drift}px` } as CSSProperties} />
        ))}
      </div>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="dsFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0b96f" /><stop offset="1" stopColor="#e39a55" /></linearGradient>
          <linearGradient id="dsMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dd8f4b" /><stop offset="1" stopColor="#c46f36" /></linearGradient>
          <linearGradient id="dsNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9622f" /><stop offset="1" stopColor="#8f4626" /></linearGradient>
          <linearGradient id="dsFore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6e3a22" /><stop offset="1" stopColor="#3d2015" /></linearGradient>
        </defs>
      </svg>
    </div>
  );
}
