import { Foto } from './Foto';
import { Coordenadas } from './Coordenadas';
import { imagen } from '@/lib/portafolio';

export function Hero() {
  const real = imagen('p239-2');
  return (
    <Coordenadas className="reticula-suave relative min-h-svh overflow-hidden pt-16">
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:px-8 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="aparecer font-mono text-xs tracking-[0.2em] text-espresso/70">
            LÁMINA 00 / 07 · DISEÑO Y CONSTRUCCIÓN
          </p>
          <h1 className="aparecer mt-6 font-display text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.9]" style={{ '--d': '0.15s' } as React.CSSProperties}>
            Diseñamos espacios que <em className="text-espresso/60">hacen crecer</em> tu negocio.
          </h1>
          <p className="aparecer mt-8 max-w-xl text-lg leading-relaxed text-espresso/80" style={{ '--d': '0.35s' } as React.CSSProperties}>
            Remodelación, planimetría, diseño interior y obra civil para locales, oficinas, restaurantes y hogares. Del
            primer trazo a la entrega, con un solo equipo.
          </p>
          <div className="aparecer mt-10 flex flex-wrap gap-4" style={{ '--d': '0.5s' } as React.CSSProperties}>
            <a href="#contacto" className="rounded-full bg-espresso px-7 py-4 text-crema transition hover:bg-tinta">
              Construye tu proyecto
            </a>
            <a href="#portafolio" className="rounded-full border border-espresso px-7 py-4 transition hover:bg-espresso hover:text-crema">
              Ver portafolio
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl p-8">
          {/* Cotas y ejes de plano alrededor de la foto real */}
          <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible text-espresso" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="0.25" vectorEffect="non-scaling-stroke">
            <path className="trazo" style={{ '--l': 100 } as React.CSSProperties} d="M8 3 H92" vectorEffect="non-scaling-stroke" />
            <path className="trazo" style={{ '--l': 100, '--d': '0.3s' } as React.CSSProperties} d="M3 8 V92" vectorEffect="non-scaling-stroke" />
            <path className="trazo" style={{ '--l': 10, '--d': '0.2s' } as React.CSSProperties} d="M8 0 V6 M92 0 V6 M0 8 H6 M0 92 H6" vectorEffect="non-scaling-stroke" />
            <path className="trazo" style={{ '--l': 200, '--d': '0.6s' } as React.CSSProperties} d="M97 20 V100 M20 97 H100" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="absolute left-1/2 top-0 -translate-x-1/2 bg-crema px-2 font-mono text-[10px] tracking-widest">EJE A — B</span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 bg-crema px-2 font-mono text-[10px] tracking-widest">EJE 1 — 2</span>
          <div className="aparecer relative overflow-hidden" style={{ '--d': '0.4s' } as React.CSSProperties}>
            <Foto img={real} sizes="(min-width: 1024px) 40vw, 90vw" prioridad className="aspect-[4/3] w-full object-cover" />
          </div>
          <p className="mt-3 flex justify-between font-mono text-[10px] tracking-widest text-espresso/70">
            <span>OBRA TERMINADA · OFICINA GERENCIAL · BOGOTÁ</span>
            <span>N+0.00</span>
          </p>
        </div>
      </section>
      <a href="#realidad" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-widest text-espresso/70 md:flex">
        DESLIZA
        <span className="h-10 w-px bg-espresso/50" />
      </a>
    </Coordenadas>
  );
}
