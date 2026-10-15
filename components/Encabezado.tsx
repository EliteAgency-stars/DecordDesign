import Link from 'next/link';

const NAV = [
  ['Plano a realidad', '/#realidad'],
  ['Servicios', '/#servicios'],
  ['Portafolio', '/#portafolio'],
  ['Proceso', '/#proceso'],
];

export function Encabezado() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-linea bg-crema/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Decord Design, inicio">
          <img src="/marca/logo-oscuro.png" alt="" width={36} height={40} className="h-10 w-auto" />
          <span className="hidden text-sm tracking-[0.35em] sm:inline">DECORDESIGN</span>
        </Link>
        <nav aria-label="Principal" className="hidden gap-7 text-sm lg:flex">
          {NAV.map(([t, h]) => (
            <a key={h} href={h} className="hover:underline underline-offset-4">
              {t}
            </a>
          ))}
        </nav>
        <a
          href="/#contacto"
          className="rounded-full bg-espresso px-5 py-2.5 text-sm text-crema transition hover:bg-tinta"
        >
          Construye tu proyecto
        </a>
      </div>
    </header>
  );
}
