import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Galeria } from '@/components/Galeria';
import { Foto } from '@/components/Foto';
import { CATEGORIAS, imagenesDe, portada, proyectos } from '@/lib/portafolio';
import { waLink } from '@/lib/marca';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => proyectos.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = proyectos.find((x) => x.slug === slug);
  if (!p) return {};
  const img = portada(p.slug);
  return {
    title: `${p.nombre} en ${p.ciudad}`,
    description: `${p.nombre} en ${p.ciudad}: ${CATEGORIAS[p.categoria].toLowerCase()} ${p.estado === 'realizado' ? 'diseñado y construido' : 'diseñado'} por Decord Design.`,
    openGraph: { images: [{ url: `/portafolio/${img.id}-${img.anchos.at(-1)}.webp`, alt: img.alt }] },
  };
}

export default async function ProyectoPage({ params }: Props) {
  const { slug } = await params;
  const p = proyectos.find((x) => x.slug === slug);
  if (!p) notFound();
  const imgs = imagenesDe(p.slug);
  const orden = { 'obra-terminada': 0, render: 1, plano: 2 };
  imgs.sort((a, b) => orden[a.tipo] - orden[b.tipo]);
  const ficha = [
    ['Tipo de espacio', CATEGORIAS[p.categoria]],
    ['Ciudad', p.ciudad],
    ['Alcance', p.estado === 'realizado' ? 'Diseño, renders y construcción' : 'Diseño y visualización arquitectónica'],
    ...(p.cliente ? [['Cliente', p.cliente]] : []),
    ['Imágenes', String(imgs.length)],
  ];
  return (
    <article className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
      <Link href="/#portafolio" className="font-mono text-xs tracking-widest text-espresso/70 hover:text-espresso">
        ← PORTAFOLIO
      </Link>
      <header className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h1 className="font-display text-6xl leading-[0.95] md:text-8xl">{p.nombre}</h1>
          <dl className="mt-10 grid grid-cols-2 border-t border-linea">
            {ficha.map(([k, v]) => (
              <div key={k} className="border-b border-linea py-4 pr-4">
                <dt className="font-mono text-[10px] tracking-widest text-espresso/70">{k.toUpperCase()}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
          <a
            href={waLink(`Hola Decord Design, vi el proyecto «${p.nombre}» y quiero algo así para mi espacio.`)}
            className="mt-10 inline-block rounded-full bg-espresso px-7 py-4 text-crema transition hover:bg-tinta"
          >
            Quiero un proyecto así
          </a>
        </div>
        <Foto img={portada(p.slug)} sizes="(min-width: 1024px) 40vw, 100vw" prioridad className="aspect-[4/5] w-full object-cover" />
      </header>
      <section className="mt-20" aria-label="Galería del proyecto">
        <Galeria imagenes={imgs} />
      </section>
    </article>
  );
}
