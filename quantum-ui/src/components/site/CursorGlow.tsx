import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div
      className="pointer-events-none fixed z-50 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 mix-blend-screen blur-3xl transition-transform"
      style={{
        left: pos.x,
        top: pos.y,
        background:
          "radial-gradient(circle, rgba(168,85,247,0.55), rgba(6,182,212,0.25) 40%, transparent 70%)",
      }}
    />
  );
}
