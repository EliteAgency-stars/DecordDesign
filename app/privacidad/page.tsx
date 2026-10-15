import type { Metadata } from 'next';
import { MARCA } from '@/lib/marca';

export const metadata: Metadata = { title: 'Tratamiento de datos personales', robots: { index: false } };

// [COMPLETAR: versión definitiva revisada por Decord Design / asesor legal]
export default function Privacidad() {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-32 leading-relaxed md:px-8 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_p]:mt-4">
      <p className="font-mono text-xs tracking-widest text-espresso/70">VERSIÓN PROVISIONAL</p>
      <h1 className="mt-3 font-display text-5xl">Tratamiento de datos personales</h1>
      <p>
        {MARCA.razonSocial} es responsable del tratamiento de los datos que nos compartes en este sitio, conforme a la Ley 1581 de 2012 y
        sus decretos reglamentarios.
      </p>
      <h2>Qué datos y para qué</h2>
      <p>
        Nombre, empresa, WhatsApp, correo, ciudad y la información de tu proyecto. Los usamos únicamente para responder tu solicitud,
        contactarte, preparar una propuesta y hacer seguimiento comercial a tu proyecto. No los vendemos ni los compartimos con terceros
        para fines distintos.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar esta autorización en cualquier momento, escribiendo a{' '}
        <a className="underline" href={`mailto:${MARCA.email}`}>{MARCA.email}</a> o al WhatsApp {MARCA.telefono}.
      </p>
    </article>
  );
}
