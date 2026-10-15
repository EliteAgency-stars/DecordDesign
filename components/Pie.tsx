import { MARCA, waLink } from '@/lib/marca';

// Pie con estética de cajetín (rótulo) de plano.
export function Pie() {
  const celdas = [
    ['PROYECTO', 'Tu espacio'],
    ['ESCALA', '1:1'],
    ['FECHA', String(new Date().getFullYear())],
    ['LÁMINA', '07 / 07'],
  ];
  return (
    <footer className="bg-espresso text-crema">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid border border-crema/30 md:grid-cols-[1.4fr_1fr]">
          <div className="flex items-center gap-5 border-b border-crema/30 p-6 md:border-b-0 md:border-r">
            <img src="/marca/logo-claro.png" alt="Decord Design" width={56} height={62} className="h-14 w-auto" />
            <div>
              <p className="tracking-[0.35em]">DECORDESIGN</p>
              <p className="text-sm text-crema/70">Empresa de diseño y construcción</p>
            </div>
          </div>
          <dl className="grid grid-cols-2">
            {celdas.map(([k, v], i) => (
              <div key={k} className={`p-4 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b' : ''} border-crema/30`}>
                <dt className="font-mono text-[10px] tracking-widest text-crema/60">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-6 text-sm text-crema/80 md:flex-row">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            <li><a className="hover:text-crema" href={waLink('Hola Decord Design, quiero información sobre un proyecto.')}>WhatsApp {MARCA.telefono}</a></li>
            <li><a className="hover:text-crema" href={`mailto:${MARCA.email}`}>{MARCA.email}</a></li>
            <li><a className="hover:text-crema" href={`https://instagram.com/${MARCA.instagram}`}>@{MARCA.instagram}</a></li>
          </ul>
          <p>© {new Date().getFullYear()} {MARCA.razonSocial}</p>
        </div>
      </div>
    </footer>
  );
}
