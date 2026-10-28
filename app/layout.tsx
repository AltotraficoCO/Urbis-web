import type { Metadata, Viewport } from 'next';
import { Archivo, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

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

const title = 'Urbis EU · Apartamentos en Torices, Cartagena';
const description = 'Urbis EU, proyecto residencial en Torices, Cartagena. Apartamentos desde $275 millones COP en 10 tipologías. Solicita información.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://urbis-web.vercel.app'),
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
      <body>{children}</body>
    </html>
  );
}
