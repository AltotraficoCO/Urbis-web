# Urbis EU · Landing

Landing de captación de leads de Urbis EU (Torices, Cartagena), construida con Next.js (App Router).

## Desarrollo

```bash
npm install
cp .env.example .env.local   # configura LEAD_WEBHOOK_URL
npm run dev
```

## Estructura

- `app/page.tsx`: página principal.
- `components/Landing.tsx`: hero con el formulario y el CTA fijo en móvil.
- `app/api/lead/route.ts`: valida el formulario y reenvía el lead a `LEAD_WEBHOOK_URL`. Si la variable no está definida, responde 503 y el formulario muestra el aviso de "no conectado".
- `lib/lead.ts`: validación compartida entre cliente y servidor.
- `public/assets/`: imágenes usadas por la landing.
- `design/`: fuente original del diseño (`Urbis EU Landing v2.dc.html` es la versión que se implementó; `export/` es la exportación standalone).

## Analítica

Los eventos se envían a `window.dataLayer` (Google Tag Manager): `form_submit_success` y `cta_primary_click`.
