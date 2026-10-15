'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Foto } from './Foto';
import type { Imagen } from '@/lib/imagen';

export type Tarjeta = {
  slug: string;
  nombre: string;
  categoria: string;
  ciudad: string;
  estado: string;
  portada: Imagen;
  total: number;
};

export function Portafolio({ tarjetas, categorias }: { tarjetas: Tarjeta[]; categorias: Record<string, string> }) {
  const [f, setF] = useState('todos');
  const visibles = f === 'todos' ? tarjetas : tarjetas.filter((t) => t.categoria === f);
  const filtros = [['todos', 'Todos'], ...Object.entries(categorias).filter(([k]) => tarjetas.some((t) => t.categoria === k))];
  return (
    <>
      <div role="group" aria-label="Filtrar por tipo de espacio" className="mb-10 flex flex-wrap gap-2">
        {filtros.map(([k, t]) => (
          <button
            key={k}
            onClick={() => setF(k)}
            aria-pressed={f === k}
            className={`rounded-full border px-4 py-2 text-sm transition ${f === k ? 'border-espresso bg-espresso text-crema' : 'border-linea hover:border-espresso'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((t, k) => (
          <li key={t.slug} className={k % 3 === 1 ? 'lg:mt-16' : ''}>
            <Link href={`/proyectos/${t.slug}`} className="group block">
              <div className="overflow-hidden">
                <Foto img={t.portada} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-linea pt-3">
                <h3 className="font-display text-2xl">{t.nombre}</h3>
                <span className="font-mono text-[10px] tracking-widest text-espresso/70">{String(t.total).padStart(2, '0')} IMG</span>
              </div>
              <p className="mt-1 text-sm text-espresso/70">
                {categorias[t.categoria]} · {t.ciudad} · {t.estado === 'realizado' ? 'Diseñado y construido' : 'Diseño y render'}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
