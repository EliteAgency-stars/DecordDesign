'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { useConfigurador, TOTAL_PASOS, type Estado } from '@/lib/configurador';
import { buildScene, NOMBRES_ZONAS, ZONAS_POR_DEFECTO, type Estilo } from '@/lib/buildScene';
import { ESPACIOS, ESTILOS, PLAZOS, PRESUPUESTOS, PRIORIDADES, SERVICIOS, datosSchema, leadSchema, resumen } from '@/lib/lead';
import { waLink } from '@/lib/marca';
import type { Imagen } from '@/lib/imagen';
import { Foto } from '../Foto';
import { Plano2D } from './Plano2D';
import { Turnstile } from './Turnstile';

const Escena3D = dynamic(() => import('./Escena3D'), { ssr: false, loading: () => null });

const PREGUNTAS = [
  '¿Qué quieres hacer?',
  '¿Qué tipo de espacio?',
  '¿Cuántos metros cuadrados aproximados?',
  '¿Cuántas zonas o ambientes necesitas?',
  '¿Qué estilo te representa?',
  '¿Qué es prioridad para ti?',
  '¿Cuál es tu rango de inversión?',
  '¿Para cuándo lo necesitas?',
  '¿En qué ciudad está el espacio?',
  'Tus datos',
];

function hayWebGL() {
  if (location.search.includes('plano2d')) return false; // para probar el respaldo 2D
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function Configurador({ miniaturas }: { miniaturas: Partial<Record<Estilo, Imagen>> }) {
  const st = useConfigurador();
  const { paso, set, ir } = st;
  const [listo, setListo] = useState(false); // tras hidratar desde localStorage
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [token, setToken] = useState('');
  const raiz = useRef<HTMLDivElement>(null);
  const captura = useRef<() => string>(null);
  const onCaptura = useCallback((fn: () => string) => (captura.current = fn), []);

  useEffect(() => {
    setListo(true);
    setWebgl(hayWebGL());
    // Servicio preseleccionado desde las tarjetas de servicios (?servicio=...).
    const s = new URLSearchParams(location.search).get('servicio');
    if (s && s in SERVICIOS && !useConfigurador.getState().servicio) set({ servicio: s as Estado['servicio'], paso: 1 });
  }, [set]);

  // El canvas solo se carga cuando la sección entra a la pantalla (tras hidratar, cuando ya existe el contenedor real).
  useEffect(() => {
    if (!listo || visible) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setVisible(true), io.disconnect()), { rootMargin: '300px' });
    io.observe(raiz.current!);
    return () => io.disconnect();
  }, [listo, visible]);

  const escena = useMemo(
    () => buildScene({ servicio: st.servicio, espacio: st.espacio, metros: st.metros, zonas: st.zonas, estilo: st.estilo, prioridades: st.prioridades }),
    [st.servicio, st.espacio, st.metros, st.zonas, st.estilo, st.prioridades],
  );

  const valido = [
    !!st.servicio, !!st.espacio, st.metros >= 10 && st.metros <= 1000, true, !!st.estilo, true,
    !!st.presupuesto, !!st.plazo, st.ciudad.trim().length >= 2, true,
  ][paso];

  function siguiente() {
    setError('');
    if (!valido) return setError('Elige una opción para continuar.');
    if (paso === 0) track('configurador_inicio');
    track('configurador_paso', { paso: paso + 1 }); // embudo de abandono, sin datos personales
    if (paso < TOTAL_PASOS - 1) ir(paso + 1);
    else enviar();
  }

  const datosLead = () => ({
    servicio: st.servicio, espacio: st.espacio, metros: st.metros, zonas: st.zonas ?? (st.espacio ? ZONAS_POR_DEFECTO[st.espacio] : 1),
    estilo: st.estilo, prioridades: st.prioridades, presupuesto: st.presupuesto, plazo: st.plazo, ciudad: st.ciudad, datos: st.datos,
  });

  async function enviar() {
    const r = leadSchema.safeParse(datosLead());
    if (!r.success) return setError(r.error.issues[0]?.message ?? 'Revisa tus datos.');
    setEnviando(true);
    try {
      const q = new URLSearchParams(location.search);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lead: r.data,
          imagen: captura.current?.() ?? null,
          utm: { source: q.get('utm_source'), medium: q.get('utm_medium'), campaign: q.get('utm_campaign') },
          turnstile: token,
          sitio: (document.getElementById('sitio-web') as HTMLInputElement | null)?.value ?? '',
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      track('configurador_envio');
      set({ enviado: j.id });
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'No pudimos enviar tu proyecto. Escríbenos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
  }

  const textoWa = () => {
    const l = datosLead() as Parameters<typeof resumen>[0];
    const filas = l.servicio && l.espacio && l.estilo ? resumen(l).map(([k, v]) => `${k}: ${v}`) : [];
    return [`Hola Decord Design, soy ${st.datos.nombre || ''}. Armé mi proyecto en la web:`, ...filas].join('\n');
  };

  const lienzo = (
    <div className="relative h-[45svh] overflow-hidden border border-linea bg-crema lg:h-[640px]">
      {webgl && visible ? <Escena3D escena={escena} girar={!!st.enviado} onCaptura={onCaptura} /> : webgl === false ? <Plano2D escena={escena} /> : <div className="reticula-suave h-full" />}
      <p className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] tracking-widest text-espresso/70">
        {escena.vista === 'vacia' ? 'TU ESPACIO EMPIEZA AQUÍ' : `MAQUETA · ${escena.ancho.toFixed(1)} × ${escena.fondo.toFixed(1)} M`}
      </p>
      {webgl && escena.vista !== 'vacia' && (
        <p className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] tracking-widest text-espresso/60">ARRASTRA PARA GIRAR</p>
      )}
    </div>
  );

  if (!listo) return <div ref={raiz} className="min-h-[640px]" />;

  if (st.enviado) {
    const l = datosLead() as Parameters<typeof resumen>[0];
    return (
      <div ref={raiz} className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <div className="aparecer order-2 lg:order-1">
          <p className="font-mono text-xs tracking-widest text-espresso/70">FICHA TÉCNICA · Nº {st.enviado.slice(0, 8).toUpperCase()}</p>
          <h3 className="mt-3 font-display text-4xl leading-tight">Ya empezamos a diseñar tu espacio, {st.datos.nombre.split(' ')[0]}.</h3>
          <p className="mt-3 text-espresso/80">Recibimos tu maqueta. Te escribimos muy pronto por WhatsApp o al correo.</p>
          <dl className="mt-6 grid grid-cols-2 border-t border-linea">
            {resumen(l).map(([k, v]) => (
              <div key={k} className="border-b border-linea py-3 pr-3">
                <dt className="font-mono text-[10px] tracking-widest text-espresso/70">{k.toUpperCase()}</dt>
                <dd className="mt-1 text-sm">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={waLink(textoWa())} onClick={() => track('whatsapp_clic', { origen: 'ficha' })} className="rounded-full bg-espresso px-6 py-3 text-crema">
              Hablar ahora por WhatsApp
            </a>
            <button onClick={() => st.reiniciar()} className="rounded-full border border-espresso px-6 py-3">Armar otro proyecto</button>
          </div>
        </div>
        <div className="order-1 lg:order-2">{lienzo}</div>
      </div>
    );
  }

  const zonasN = st.zonas ?? (st.espacio ? ZONAS_POR_DEFECTO[st.espacio] : 3);
  return (
    <div ref={raiz} className="grid gap-8 lg:grid-cols-[2fr_3fr]">
      <form
        className="order-2 flex flex-col lg:order-1"
        onSubmit={(e) => {
          e.preventDefault();
          siguiente();
        }}
        noValidate
      >
        {/* Progreso como cota de plano */}
        <div aria-hidden className="relative mb-8 h-6">
          <div className="absolute inset-x-0 top-3 h-px bg-espresso/25" />
          <div className="absolute left-0 top-3 h-px bg-espresso transition-all duration-500" style={{ width: `${((paso + 1) / TOTAL_PASOS) * 100}%` }} />
          {Array.from({ length: TOTAL_PASOS }, (_, i) => (
            <span key={i} className={`absolute top-1.5 h-3 w-px ${i <= paso ? 'bg-espresso' : 'bg-espresso/30'}`} style={{ left: `${(i / (TOTAL_PASOS - 1)) * 100}%` }} />
          ))}
        </div>
        <p className="font-mono text-xs tracking-widest text-espresso/70" aria-live="polite">
          PASO {String(paso + 1).padStart(2, '0')} / {TOTAL_PASOS}
        </p>
        <fieldset key={paso} className="aparecer mt-3 min-h-[300px]">
          <legend className="font-display text-4xl leading-tight md:text-5xl">{PREGUNTAS[paso]}</legend>
          <div className="mt-6">
            {paso === 0 && <Opciones nombre="servicio" opciones={SERVICIOS} valor={st.servicio} onChange={(v) => set({ servicio: v as Estado['servicio'] })} />}
            {paso === 1 && <Opciones nombre="espacio" opciones={ESPACIOS} valor={st.espacio} onChange={(v) => set({ espacio: v as Estado['espacio'], zonas: undefined })} />}
            {paso === 2 && (
              <div className="grid gap-5">
                <input type="range" min={10} max={1000} step={5} value={st.metros} onChange={(e) => set({ metros: Number(e.target.value) })} aria-label="Metros cuadrados" className="w-full accent-espresso" />
                <label className="flex items-baseline gap-3">
                  <input type="number" min={10} max={1000} value={st.metros} onChange={(e) => set({ metros: Math.min(1000, Math.max(0, Number(e.target.value) || 0)) })} className="w-32 border-b border-espresso bg-transparent font-display text-5xl focus:outline-none" />
                  <span className="text-xl">m²</span>
                </label>
                <p className="text-sm text-espresso/70">Un cálculo aproximado basta; lo medimos juntos en la visita.</p>
              </div>
            )}
            {paso === 3 && (
              <div>
                <div role="radiogroup" aria-label="Número de zonas" className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                    <button type="button" role="radio" aria-checked={zonasN === n} key={n} onClick={() => set({ zonas: n })} className={`h-12 w-12 rounded-full border text-lg transition ${zonasN === n ? 'border-espresso bg-espresso text-crema' : 'border-linea hover:border-espresso'}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-5 text-sm text-espresso/80">{NOMBRES_ZONAS[st.espacio ?? 'otro'].slice(0, zonasN).join(' · ')}</p>
              </div>
            )}
            {paso === 4 && (
              <div role="radiogroup" aria-label="Estilo" className="grid grid-cols-2 gap-3">
                {Object.entries(ESTILOS).map(([k, t]) => {
                  const img = miniaturas[k as Estilo];
                  return (
                    <button type="button" role="radio" aria-checked={st.estilo === k} key={k} onClick={() => set({ estilo: k as Estilo })} className={`overflow-hidden border text-left transition ${st.estilo === k ? 'border-espresso ring-1 ring-espresso' : 'border-linea hover:border-espresso'} ${img ? '' : 'col-span-2'}`}>
                      {img && <Foto img={img} sizes="200px" className="aspect-[4/3] w-full object-cover" />}
                      <span className="block p-3 text-sm">{t}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {paso === 5 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRIORIDADES).map(([k, t]) => {
                  const on = st.prioridades.includes(k as never);
                  return (
                    <button type="button" aria-pressed={on} key={k} onClick={() => {
                      const actual = useConfigurador.getState().prioridades;
                      set({ prioridades: actual.includes(k as never) ? actual.filter((p) => p !== k) : [...actual, k as never] });
                    }} className={`rounded-full border px-4 py-2.5 transition ${on ? 'border-espresso bg-espresso text-crema' : 'border-linea hover:border-espresso'}`}>
                      {on ? '✓ ' : '+ '}
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
            {paso === 6 && (
              <>
                <Opciones nombre="presupuesto" opciones={Object.fromEntries(PRESUPUESTOS.map((p) => [p, p]))} valor={st.presupuesto} onChange={(v) => set({ presupuesto: v })} />
                <p className="mt-4 text-sm text-espresso/70">Sea cual sea tu inversión, te proponemos la mejor forma de aprovecharla, por etapas si hace falta.</p>
              </>
            )}
            {paso === 7 && <Opciones nombre="plazo" opciones={Object.fromEntries(PLAZOS.map((p) => [p, p]))} valor={st.plazo} onChange={(v) => set({ plazo: v })} />}
            {paso === 8 && (
              <label className="grid gap-2 text-sm">
                Ciudad o municipio
                <input autoFocus value={st.ciudad} onChange={(e) => set({ ciudad: e.target.value })} autoComplete="address-level2" className="border-b border-espresso bg-transparent py-2 font-display text-3xl focus:outline-none" />
              </label>
            )}
            {paso === 9 && <Datos onToken={setToken} />}
          </div>
        </fieldset>
        {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {paso > 0 && (
            <button type="button" onClick={() => ir(paso - 1)} className="rounded-full border border-espresso px-6 py-3">
              Atrás
            </button>
          )}
          <button disabled={enviando} className="rounded-full bg-espresso px-7 py-3 text-crema transition hover:bg-tinta disabled:opacity-60">
            {paso === TOTAL_PASOS - 1 ? (enviando ? 'Enviando…' : 'Enviar mi proyecto') : 'Siguiente'}
          </button>
          {paso === TOTAL_PASOS - 1 && (
            <a href={waLink(textoWa())} onClick={() => track('whatsapp_clic', { origen: 'configurador' })} className="rounded-full border border-espresso px-6 py-3">
              Hablar ahora por WhatsApp
            </a>
          )}
          <span className="hidden text-xs text-espresso/60 md:inline">o presiona Enter ↵</span>
        </div>
      </form>
      <div className="order-1 lg:order-2">{lienzo}</div>
    </div>
  );
}

function Opciones({ nombre, opciones, valor, onChange }: { nombre: string; opciones: Record<string, string>; valor?: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Object.entries(opciones).map(([k, t]) => (
        <label key={k} className={`flex cursor-pointer items-center gap-3 border px-4 py-3.5 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 ${valor === k ? 'border-espresso bg-espresso text-crema' : 'border-linea hover:border-espresso'}`}>
          <input type="radio" name={nombre} value={k} checked={valor === k} onChange={() => onChange(k)} className="sr-only" />
          <span aria-hidden className={`h-3 w-3 rounded-full border ${valor === k ? 'border-crema bg-crema' : 'border-espresso'}`} />
          {t}
        </label>
      ))}
    </div>
  );
}

function Datos({ onToken }: { onToken: (t: string) => void }) {
  const datos = useConfigurador((s) => s.datos);
  const set = useConfigurador((s) => s.set);
  const errores = datosSchema.safeParse(datos).error?.flatten().fieldErrors ?? {};
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const campo = (k: 'nombre' | 'empresa' | 'whatsapp' | 'email', label: string, extra: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        {...extra}
        value={datos[k]}
        onChange={(e) => set({ datos: { ...datos, [k]: e.target.value } })}
        onBlur={() => setTocado((t) => ({ ...t, [k]: true }))}
        aria-invalid={!!(tocado[k] && errores[k])}
        className="border-b border-linea bg-transparent py-2 text-base focus:border-espresso focus:outline-none aria-[invalid=true]:border-red-800"
      />
      {tocado[k] && errores[k] && <span className="text-xs text-red-800">{errores[k]![0]}</span>}
    </label>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {campo('nombre', 'Nombre', { autoComplete: 'name', required: true })}
      {campo('empresa', 'Empresa o marca (opcional)', { autoComplete: 'organization' })}
      {campo('whatsapp', 'WhatsApp', { autoComplete: 'tel', inputMode: 'tel', placeholder: '300 123 4567', required: true })}
      {campo('email', 'Correo', { autoComplete: 'email', type: 'email', required: true })}
      {/* Honeypot: invisible para personas */}
      <input id="sitio-web" name="sitio-web" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <label className="flex items-start gap-3 text-sm sm:col-span-2">
        <input type="checkbox" checked={datos.acepta} onChange={(e) => set({ datos: { ...datos, acepta: e.target.checked } })} className="mt-1 accent-espresso" />
        <span>
          Autorizo a Decord Design S.A.S. a tratar mis datos para responder esta solicitud, según la Ley 1581 de 2012 y su{' '}
          <a href="/privacidad" target="_blank" className="underline">política de tratamiento de datos</a>.
        </span>
      </label>
      <div className="sm:col-span-2">
        <Turnstile onToken={onToken} />
      </div>
    </div>
  );
}
