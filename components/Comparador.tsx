'use client';
import { useState } from 'react';
import { Foto } from './Foto';
import type { Imagen } from '@/lib/imagen';

type Par = { diseno: Imagen; realidad: Imagen };

// Deslizador render ↔ obra terminada. El input range nativo da teclado y lector de pantalla gratis.
export function Comparador({ pares }: { pares: Par[] }) {
  const [i, setI] = useState(0);
  const [v, setV] = useState(50);
  const par = pares[i];
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
      <div>
        <div className="relative aspect-[4/3] select-none overflow-hidden bg-arena">
          <Foto img={par.realidad} sizes="(min-width: 1024px) 70vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>
            <Foto img={par.diseno} sizes="(min-width: 1024px) 70vw, 100vw" className="h-full w-full object-cover" />
          </div>
          <div className="pointer-events-none absolute inset-y-0 w-px bg-crema" style={{ left: `${v}%` }}>
            <span className="absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-crema bg-espresso/80 text-crema">
              ↔
            </span>
          </div>
          <span className="absolute left-3 top-3 bg-crema/90 px-2 py-1 font-mono text-[10px] tracking-widest">DISEÑO · RENDER</span>
          <span className="absolute right-3 top-3 bg-espresso/90 px-2 py-1 font-mono text-[10px] tracking-widest text-crema">REALIDAD · OBRA</span>
          <input
            type="range"
            min={0}
            max={100}
            value={v}
            onChange={(e) => setV(Number(e.target.value))}
            aria-label="Deslizar entre el diseño y la obra terminada"
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        <p className="mt-3 font-mono text-xs tracking-widest text-espresso/70">
          {String(i + 1).padStart(2, '0')} / {String(pares.length).padStart(2, '0')} · {par.realidad.espacio.toUpperCase()}
        </p>
      </div>
      <ul className="grid grid-cols-4 gap-2 lg:grid-cols-2 lg:content-start" aria-label="Elegir espacio">
        {pares.map((p, k) => (
          <li key={p.diseno.id}>
            <button
              onClick={() => {
                setI(k);
                setV(50);
              }}
              aria-pressed={k === i}
              aria-label={p.realidad.espacio}
              className={`block w-full overflow-hidden outline-offset-2 transition ${k === i ? 'ring-2 ring-espresso' : 'opacity-60 hover:opacity-100'}`}
            >
              <Foto img={p.realidad} sizes="120px" className="aspect-square w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
