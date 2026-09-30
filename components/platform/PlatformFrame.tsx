// Shared frame keeps public platform pages visually consistent with Ouedna's calm-sands system.
import type { ReactNode } from "react";
import PlatformFooter from "./PlatformFooter";
import PlatformHeader from "./PlatformHeader";

export default function PlatformFrame({ children, active, immersive = false }: { children: ReactNode; active?: string; immersive?: boolean }) {
  return (
    <div className={`platform-shell${immersive ? " platform-shell--immersive" : ""}`}>
      {!immersive && <PlatformHeader active={active} />}
      <main className="platform-main">{children}</main>
      {!immersive && <PlatformFooter />}
    </div>
  );
}
