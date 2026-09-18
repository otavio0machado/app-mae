/* Only a generic offline response: authenticated pages and Supabase data are never cached. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate' || event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hora Clara — Sem conexão</title><body style="font:16px Arial;padding:48px 24px;text-align:center;background:#f7f9fc;color:#243247"><h1>Você está sem conexão</h1><p>Conecte-se à internet para acessar e salvar seus registros.</p><a href="/">Tentar novamente</a></body></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  )));
});
