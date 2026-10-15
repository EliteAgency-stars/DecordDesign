import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Encabezado } from '@/components/Encabezado';
import { Pie } from '@/components/Pie';
import { MARCA } from '@/lib/marca';
import './globals.css';

const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(MARCA.web),
  title: { default: 'Decord Design · Diseño, remodelación y construcción', template: '%s · Decord Design' },
  description:
    'Remodelación de locales comerciales, oficinas y viviendas, planimetría, licencias, renders y obra civil en Bogotá y Colombia. Del plano a la realidad con un solo equipo.',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Decord Design',
    images: [{ url: '/portafolio/p239-2-800.webp', width: 800, height: 600, alt: 'Oficina gerencial temática de aviación construida por Decord Design' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GeneralContractor',
  name: 'Decord Design S.A.S.',
  url: MARCA.web,
  telephone: '+57 305 896 7904',
  email: MARCA.email,
  logo: `${MARCA.web}/marca/logo-oscuro.png`,
  sameAs: [`https://instagram.com/${MARCA.instagram}`],
  areaServed: MARCA.ciudades.map((c) => ({ '@type': 'City', name: c })),
  founder: { '@type': 'Person', name: 'Valentina Pedraza' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${instrument.variable} ${inter.variable}`}>
      <body>
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-crema focus:p-3">
          Saltar al contenido
        </a>
        <Encabezado />
        <main id="contenido">{children}</main>
        <Pie />
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
