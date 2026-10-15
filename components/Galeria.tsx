'use client';
import { useEffect, useRef, useState } from 'react';
import { Foto } from './Foto';
import type { Imagen } from '@/lib/imagen';

const ETIQUETA = { render: 'Render', plano: 'Plano', 'obra-terminada': 'Obra terminada' };

// Galería masonry + lightbox con <dialog> nativo (Esc, foco atrapado) y flechas del teclado.
export function Galeria({ imagenes }: { imagenes: Imagen[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState<number | null>(null);
  const mover = (d: number) => setI((x) => (x === null ? x : (x + d + imagenes.length) % imagenes.length));

  useEffect(() => {
    if (i === null) return;
    if (!dlg.current!.open) dlg.current!.showModal();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [i]);

  const actual = i === null ? null : imagenes[i];
  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {imagenes.map((img, k) => (
          <li key={img.id} className="mb-4 break-inside-avoid">
            <button onClick={() => setI(k)} className="group block w-full text-left" aria-label={`Ampliar: ${img.alt}`}>
              <Foto img={img} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className={`w-full transition duration-500 group-hover:opacity-90 ${img.tipo === 'plano' ? 'bg-white p-3' : ''}`} />
              <span className="mt-2 flex justify-between font-mono text-[10px] tracking-widest text-espresso/70">
                <span>{ETIQUETA[img.tipo].toUpperCase()}</span>
                <span>{img.espacio.toUpperCase()}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dlg}
        onClose={() => setI(null)}
        onClick={(e) => e.target === dlg.current && dlg.current.close()}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-tinta/90"
      >
        {actual && (
          <figure className="flex max-h-[92svh] w-[min(94vw,1100px)] flex-col items-center">
            <Foto img={actual} sizes="94vw" prioridad className="max-h-[80svh] w-auto object-contain" />
            <figcaption className="mt-4 flex w-full items-center justify-between gap-4 text-sm text-crema">
              <button onClick={() => mover(-1)} className="rounded-full border border-crema/40 px-4 py-2" aria-label="Anterior">←</button>
              <span className="text-center">{actual.alt}</span>
              <button onClick={() => mover(1)} className="rounded-full border border-crema/40 px-4 py-2" aria-label="Siguiente">→</button>
            </figcaption>
            <button onClick={() => dlg.current!.close()} className="absolute right-4 top-4 rounded-full bg-crema px-4 py-2 text-sm" aria-label="Cerrar">
              Cerrar ✕
            </button>
          </figure>
        )}
      </dialog>
    </>
  );
}
