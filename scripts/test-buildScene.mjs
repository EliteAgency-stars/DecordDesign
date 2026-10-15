// Prueba de buildScene. Uso: node scripts/test-buildScene.mjs (Node >= 23 ejecuta .ts directamente)
import assert from 'node:assert/strict';
import { buildScene } from '../lib/buildScene.ts';

const base = { metros: 60, prioridades: [] };

// Sin servicio no hay maqueta.
assert.equal(buildScene(base).vista, 'vacia');

// Construcción sin tipo de espacio: lote vacío con estacas, sin muros.
const lote = buildScene({ ...base, servicio: 'construccion' });
assert.ok(lote.lote && lote.cajas.every((c) => c.tipo === 'estaca'));

// Planimetría: vista de plano, muros casi planos y sin muebles.
const plano = buildScene({ ...base, servicio: 'planimetria', espacio: 'oficina' });
assert.equal(plano.vista, 'plano');
assert.ok(plano.cajas.every((c) => c.tipo === 'muro' && c.h < 0.1));

// Las zonas pedidas aparecen todas, con su nombre, y caben dentro del espacio.
for (let n = 1; n <= 8; n++) {
  const e = buildScene({ ...base, servicio: 'interior', espacio: 'restaurante', zonas: n });
  assert.equal(e.zonas.length, n, `zonas=${n}`);
  assert.equal(new Set(e.zonas.map((z) => z.nombre)).size, n);
  for (const c of e.cajas) {
    assert.ok(Math.abs(c.x) <= e.W / 2 + 0.01 && Math.abs(c.z) <= e.D / 2 + 0.2, `${c.id} fuera del espacio`);
  }
  assert.equal(new Set(e.cajas.map((c) => c.id)).size, e.cajas.length, 'ids únicos');
}

// Los metros cambian la profundidad y las cotas; se limitan a 10..1000.
const chico = buildScene({ ...base, servicio: 'interior', metros: 10 });
const grande = buildScene({ ...base, servicio: 'interior', metros: 5000 });
assert.ok(grande.ancho > chico.ancho);
assert.equal(Math.round(grande.ancho * grande.fondo), 1000);

// Cada prioridad agrega algo visible.
const sin = buildScene({ ...base, servicio: 'remodelacion', espacio: 'local' });
for (const p of ['iluminacion', 'mobiliario', 'fachada', 'cocina', 'banos', 'almacenamiento', 'senaletica']) {
  const con = buildScene({ ...base, servicio: 'remodelacion', espacio: 'local', prioridades: [p] });
  assert.ok(con.cajas.length > sin.cajas.length, `prioridad ${p} no agrega nada`);
}

// El estilo cambia la paleta; remodelación sin estilo se ve desgastada.
assert.notEqual(sin.paleta.muro, buildScene({ ...base, servicio: 'remodelacion', espacio: 'local', estilo: 'lujo' }).paleta.muro);

console.log('buildScene: ok');
