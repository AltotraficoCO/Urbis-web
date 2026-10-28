import { initBotId } from 'botid/client/core';

// Vercel BotID: clasifica de forma invisible las peticiones al formulario.
initBotId({
  protect: [{ path: '/api/lead', method: 'POST' }],
});
