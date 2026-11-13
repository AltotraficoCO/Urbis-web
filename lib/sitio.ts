// Dominio público del sitio: con él salen la URL canónica, Open Graph, el
// sitemap y robots. Antes caía a urbis-web.vercel.app y las vistas previas
// apuntaban ahí.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.urbiseu.com';

// Google Tag Manager: se activa al poner NEXT_PUBLIC_GTM_ID en Vercel. GA4 y los
// píxeles se configuran dentro del contenedor, no en el código.
const gtm = process.env.NEXT_PUBLIC_GTM_ID ?? '';
// WhatsApp comercial: +57 316 767 9714 (dado por Victor, 2026-11-13). NEXT_PUBLIC_WHATSAPP lo reemplaza si se define.
const wa = (process.env.NEXT_PUBLIC_WHATSAPP || '573167679714').replace(/\D/g, '');
export const WHATSAPP: string | null = wa.length >= 10 ? wa : null;
export const WHATSAPP_MENSAJE = 'Hola, vi Urbis EU en la web y quiero recibir información de los apartamentos en Torices.';
export const WHATSAPP_URL: string | null = WHATSAPP && `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`;

export const GTM_ID: string | null = /^GTM-[A-Z0-9]+$/.test(gtm) ? gtm : null;
