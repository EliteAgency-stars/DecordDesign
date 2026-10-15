import type { Escena } from '@/lib/buildScene';

// Respaldo sin WebGL: la misma escena vista en planta, con transiciones CSS.
const RELLENO = { muro: '#362b25', mueble: '#bdb2a0', luminaria: '#f3d58a', vidrio: '#9ec3cc', aviso: '#b8925a', estaca: '#362b25' };

export function Plano2D({ escena }: { escena: Escena }) {
  const { W, D } = escena;
  const m = 1.4;
  const anim = { transition: 'all 0.7s cubic-bezier(.2,.8,.2,1)' };
  return (
    <svg viewBox={`${-W / 2 - m} ${-D / 2 - m} ${W + 2 * m} ${D + 2 * m}`} className="reticula-suave h-full w-full" role="img" aria-label="Plano en planta de tu proyecto">
      {escena.vista !== 'vacia' && (
        <rect style={{ ...anim, x: -W / 2, y: -D / 2, width: W, height: D }} fill={escena.paleta.piso} opacity={escena.lote ? 0.3 : 0.6} />
      )}
      {escena.cajas.map((c) => (
        <rect
          key={c.id}
          style={{ ...anim, x: c.x - c.w / 2, y: c.z - c.d / 2, width: Math.max(c.w, 0.05), height: Math.max(c.d, 0.05) }}
          fill={RELLENO[c.tipo]}
          opacity={c.tipo === 'luminaria' ? 0.8 : 1}
        />
      ))}
      {escena.zonas.map((z, i) => (
        <text key={i} x={z.x} y={z.z} fontSize={0.32} textAnchor="middle" fill="#362b25" style={anim}>
          {z.nombre}
        </text>
      ))}
      {escena.vista !== 'vacia' && (
        <g fontSize={0.3} fill="#362b25" fontFamily="monospace">
          <line x1={-W / 2} x2={W / 2} y1={D / 2 + 0.7} y2={D / 2 + 0.7} stroke="#362b25" strokeWidth={0.03} />
          <text x={0} y={D / 2 + 1.1} textAnchor="middle">{escena.ancho.toFixed(2)} m</text>
          <text x={-W / 2 - 0.5} y={0} textAnchor="middle" transform={`rotate(-90 ${-W / 2 - 0.5} 0)`}>{escena.fondo.toFixed(2)} m</text>
        </g>
      )}
    </svg>
  );
}
