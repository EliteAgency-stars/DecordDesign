'use client';
import { useState } from 'react';
import { waLink } from '@/lib/marca';

const SERVICIOS = ['Remodelación', 'Construcción desde cero', 'Diseño interior', 'Planimetría y licencias', 'Render / visualización'];
const ESPACIOS = ['Local comercial', 'Consultorio o clínica estética', 'Oficina', 'Restaurante o café', 'Vivienda', 'Otro'];
const PLAZOS = ['Lo antes posible', '1–3 meses', '3–6 meses', 'Estoy explorando'];

// Primera versión del contacto: arma la solicitud y la abre en WhatsApp.
// ponytail: sin backend todavía; Supabase + Resend + configurador 3D llegan en la fase 5.
export function Contacto() {
  const [enviado, setEnviado] = useState(false);
  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
        const texto = [
          `Hola Decord Design, soy ${d.nombre}${d.empresa ? ` (${d.empresa})` : ''}.`,
          `Quiero: ${d.servicio} · Espacio: ${d.espacio}${d.metros ? ` · ${d.metros} m² aprox.` : ''}`,
          `Ciudad: ${d.ciudad} · Plazo: ${d.plazo}`,
          d.mensaje && `Detalles: ${d.mensaje}`,
        ].filter(Boolean).join('\n');
        window.open(waLink(texto), '_blank', 'noopener');
        setEnviado(true);
      }}
    >
      <Campo label="Nombre" name="nombre" required autoComplete="name" />
      <Campo label="Empresa o marca (opcional)" name="empresa" autoComplete="organization" />
      <Selector label="¿Qué quieres hacer?" name="servicio" opciones={SERVICIOS} />
      <Selector label="Tipo de espacio" name="espacio" opciones={ESPACIOS} />
      <Campo label="Metros cuadrados aproximados" name="metros" type="number" inputMode="numeric" min={1} />
      <Campo label="Ciudad" name="ciudad" required autoComplete="address-level2" />
      <Selector label="¿Para cuándo lo necesitas?" name="plazo" opciones={PLAZOS} />
      <label className="grid gap-2 text-sm sm:col-span-2">
        Cuéntanos de tu espacio
        <textarea name="mensaje" rows={4} className="border border-linea bg-transparent p-3 text-base focus:border-espresso focus:outline-none" />
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button className="rounded-full bg-espresso px-8 py-4 text-crema transition hover:bg-tinta">Enviar por WhatsApp</button>
        {enviado && <p role="status" className="text-sm">¡Listo! Abrimos WhatsApp con tu solicitud.</p>}
      </div>
    </form>
  );
}

function Campo({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <input {...p} className="border-b border-linea bg-transparent py-2 text-base focus:border-espresso focus:outline-none" />
    </label>
  );
}

function Selector({ label, name, opciones }: { label: string; name: string; opciones: string[] }) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <select name={name} required className="border-b border-linea bg-transparent py-2 text-base focus:border-espresso focus:outline-none">
        {opciones.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
