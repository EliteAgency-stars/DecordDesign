'use client';
import { useRef, useState } from 'react';

// Cursor con coordenadas sutiles sobre el hero (solo con mouse).
export function Coordenadas({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState<{ x: number; y: number } | null>(null);
  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = ref.current!.getBoundingClientRect();
        setP({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onPointerLeave={() => setP(null)}
    >
      {children}
      {p && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 font-mono text-[10px] tracking-widest text-espresso/60"
          style={{ left: p.x + 14, top: p.y + 14 }}
        >
          X {String(Math.round(p.x)).padStart(4, '0')} · Y {String(Math.round(p.y)).padStart(4, '0')}
        </div>
      )}
    </div>
  );
}
