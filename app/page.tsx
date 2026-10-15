import { Hero } from '@/components/Hero';
import { Lamina } from '@/components/Lamina';
import { Comparador } from '@/components/Comparador';
import { Portafolio } from '@/components/Portafolio';
import { Contacto } from '@/components/Contacto';
import { CATEGORIAS, imagenesDe, pares, portada, proyectos, totalImagenes } from '@/lib/portafolio';
import { MARCA, waLink } from '@/lib/marca';

// Servicios tal como aparecen en el portafolio (página 5).
const SERVICIOS = [
  ['Remodelaciones', 'Transformamos locales, oficinas y viviendas para que trabajen mejor y comuniquen tu marca desde la entrada.'],
  ['Planimetría', 'Planos arquitectónicos y técnicos claros, listos para cotizar, construir y tramitar.'],
  ['Visualización arquitectónica', 'Renders fotorrealistas para que veas tu espacio terminado antes de mover un solo ladrillo.'],
  ['Asesoría de diseño', 'Diseño interior, mobiliario arquitectónico y carpintería a medida, con criterio y presupuesto.'],
  ['Licencias de construcción', 'Te acompañamos en el trámite para que tu obra arranque en regla y sin sorpresas.'],
  ['Obra civil', 'Ejecutamos con nuestro propio equipo: lo que diseñamos es lo que entregamos.'],
];

const PROCESO = [
  ['Diagnóstico', 'Escuchamos tu negocio, visitamos el espacio y definimos qué tiene que lograr.'],
  ['Diseño y planimetría', 'Planos, distribución y renders hasta que el espacio sea exactamente lo que necesitas.'],
  ['Presupuesto', 'Cantidades y costos claros, por etapas, sin letra pequeña.'],
  ['Ejecución', 'Obra civil, carpintería y acabados con seguimiento constante.'],
  ['Entrega', 'Tu espacio listo para abrir sus puertas y empezar a vender.'],
];

export default function Inicio() {
  const tarjetas = proyectos.map((p) => ({ ...p, portada: portada(p.slug), total: imagenesDe(p.slug).length }));
  return (
    <>
      <Hero />

      <section id="realidad" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <Lamina n={1} titulo="De plano" cursiva="a realidad">
          Lo que diseñamos es lo que construimos. Desliza para comparar el render con la obra terminada.
        </Lamina>
        <Comparador pares={pares} />
      </section>

      <section id="servicios" className="bg-espresso text-crema">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <Lamina n={2} titulo="Servicios" cursiva="integrales" oscuro>
            Un solo equipo desde la idea hasta la entrega: diseñamos, tramitamos y construimos.
          </Lamina>
          <ol className="grid gap-px bg-crema/20 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICIOS.map(([t, d], i) => (
              <li key={t} className="group bg-espresso p-8">
                <span className="font-mono text-xs tracking-widest text-crema/60">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 font-display text-3xl">{t}</h3>
                <span className="mt-4 block h-px w-10 bg-crema/50 transition-all duration-500 group-hover:w-full" />
                <p className="mt-4 leading-relaxed text-crema/80">{d}</p>
                <a href="#contacto" className="mt-6 inline-block text-sm underline underline-offset-4 opacity-80 hover:opacity-100">
                  Cotizar {t.toLowerCase()} →
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="portafolio" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <Lamina n={3} titulo="Portafolio">
          {proyectos.length} proyectos y {totalImagenes} imágenes: oficinas, locales, restaurantes, sedes educativas, proyectos turísticos y hogares.
        </Lamina>
        <Portafolio tarjetas={tarjetas} categorias={CATEGORIAS} />
      </section>

      <section id="proceso" className="reticula-suave border-y border-linea">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <Lamina n={4} titulo="Cómo" cursiva="trabajamos" />
          <ol className="relative grid gap-10 md:grid-cols-5 md:gap-6">
            <span aria-hidden className="absolute left-0 right-0 top-[7px] hidden h-px bg-espresso/40 md:block" />
            {PROCESO.map(([t, d], i) => (
              <li key={t} className="relative">
                <span className="relative block h-4 w-4 rounded-full border border-espresso bg-crema" />
                <p className="mt-5 font-mono text-xs tracking-widest text-espresso/70">PASO {String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 font-display text-2xl">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-espresso/80">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="nosotros" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <Lamina n={5} titulo="Quiénes" cursiva="somos" />
        <div className="grid gap-12 md:grid-cols-2">
          <p className="font-display text-3xl leading-snug md:text-4xl">
            «Nuestra pasión por la innovación y la calidad garantiza resultados que superan tus expectativas.»
          </p>
          <div className="space-y-5 leading-relaxed text-espresso/85">
            <p>
              DECORDESIGN S.A.S. es constructora y comercializadora, con soluciones integrales en decoración de interiores, carpintería,
              obra civil y asesoría en arquitectura, ingeniería y jurídica.
            </p>
            <p>
              La lidera Valentina Pedraza, fundadora y diseñadora, especializada en la presentación de proyectos con Archicad, SketchUp,
              Enscape e Illustrator. La acompaña un equipo de atención al cliente, diseño de mobiliario arquitectónico y obra civil.
            </p>
            <p className="font-mono text-xs tracking-widest text-espresso/70">PROYECTOS EN {MARCA.ciudades.join(' · ').toUpperCase()}</p>
          </div>
        </div>
      </section>

      <section id="contacto" className="border-t border-linea bg-arena/40">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 md:px-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Lamina n={6} titulo="Construye tu" cursiva="proyecto" />
            <p className="-mt-6 text-lg leading-relaxed text-espresso/80">
              Cuéntanos qué tienes en mente y te respondemos por WhatsApp. Ese primer mensaje es el primer trazo de tu espacio.
            </p>
            <ul className="mt-10 space-y-3">
              <li><a className="underline underline-offset-4" href={waLink('Hola Decord Design, quiero información sobre un proyecto.')}>WhatsApp {MARCA.telefono}</a></li>
              <li><a className="underline underline-offset-4" href={`mailto:${MARCA.email}`}>{MARCA.email}</a></li>
              <li><a className="underline underline-offset-4" href={`https://instagram.com/${MARCA.instagram}`}>@{MARCA.instagram}</a></li>
            </ul>
          </div>
          <Contacto />
        </div>
      </section>
    </>
  );
}
