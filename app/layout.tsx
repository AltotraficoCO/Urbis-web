import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Archivo, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { seoDe } from '@/lib/atos-seo';
import { GTM_ID, SITE_URL } from '@/lib/sitio';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
});

// Título y descripción de la portada: los mantiene AT OS en atos/seo.json
const portada = seoDe('/');
const title = portada.titulo ?? 'Urbis EU · Apartamentos en Torices, Cartagena';
const description = portada.descripcion ?? 'Urbis EU, proyecto residencial en Torices, Cartagena. Apartamentos VIS de 2 habitaciones, hasta 150 SMLV. Solicita información.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title,
  description,
  openGraph: { title, description, siteName: 'Urbis EU', locale: 'es_CO', type: 'website', url: '/' },
  twitter: { card: 'summary_large_image', title, description },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#14403E',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${archivo.variable} ${cormorant.variable}`}>
      <body>
        {GTM_ID && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
          </noscript>
        )}
        {children}
        {GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
      </body>
    </html>
  );
}
