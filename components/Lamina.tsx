// Encabezado de sección con estética de lámina de plano.
type Props = { n: number; titulo: string; cursiva?: string; oscuro?: boolean; children?: React.ReactNode };

export function Lamina({ n, titulo, cursiva, oscuro, children }: Props) {
  const tenue = oscuro ? 'text-crema/70' : 'text-espresso/70';
  return (
    <header className={`mb-12 grid gap-6 border-t pt-6 md:grid-cols-[200px_1fr] ${oscuro ? 'border-crema/25' : 'border-linea'}`}>
      <p className={`font-mono text-xs tracking-[0.2em] ${tenue}`}>LÁMINA {String(n).padStart(2, '0')} / 07</p>
      <div>
        <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">
          {titulo} {cursiva && <em className={oscuro ? 'text-crema/60' : 'text-espresso/60'}>{cursiva}</em>}
        </h2>
        {children && <div className={`mt-5 max-w-2xl text-lg leading-relaxed ${oscuro ? 'text-crema/80' : 'text-espresso/80'}`}>{children}</div>}
      </div>
    </header>
  );
}
