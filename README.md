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

## Protección anti-spam

`app/api/lead/route.ts` filtra los envíos en capas antes de reenviarlos al webhook:

1. **Origen**: solo acepta peticiones hechas desde la propia web (cabecera `Origin`).
2. **Vercel BotID** (`instrumentation-client.ts`): bloquea scripts y navegadores automatizados sin captcha. En producción, las peticiones con `curl` o hechas directamente al endpoint se rechazan.
3. **Campo trampa** oculto (`company`) y **tiempo mínimo** de llenado de 3 s.
4. **Contenido**: nombres con enlaces o letras sin sentido, correos desechables y teléfonos con dígitos repetidos (`lib/spam.ts`).
5. **Límite por IP**: máximo 3 envíos válidos cada 10 minutos.

Los envíos descartados por las capas 3 y 4 reciben una respuesta de éxito falsa (para no dar pistas al bot) y quedan registrados en los logs de Vercel como `Lead descartado como spam: <motivo>`.

## Analítica

Los eventos se envían a `window.dataLayer` (Google Tag Manager): `form_submit_success` y `cta_primary_click`.
