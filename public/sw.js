/*
 * Coliseu das IAs: funcionar sem internet.
 * Depois da primeira visita, o jogo inteiro (página, código, sons sintetizados,
 * fontes e ícones) fica guardado no aparelho e abre mesmo sem conexão.
 * - Página: tenta a internet primeiro (para pegar a versão nova) e, sem conexão, usa a guardada.
 * - Código e imagens (/assets/, com nome que muda a cada versão): guardados para sempre.
 * - Fontes do Google: usa a guardada e atualiza por trás.
 * - Dropbox (a conta): nunca guarda; sem internet, o progresso espera e sincroniza depois.
 */
const CACHE = 'coliseu-v1';
const BASE = new URL('./', self.location).pathname;
const ESSENCIAIS = ['./', './index.html', './manifest.webmanifest', './logo.svg', './icone-192.png', './icone-512.png', './icone-180.png'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(ESSENCIAIS);
      // Guarda também o código e o estilo que a página usa (os nomes mudam a cada versão).
      try {
        const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
        const arquivos = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map((m) => m[1]);
        await cache.addAll(arquivos);
      } catch {
        /* sem conexão na instalação: guarda na próxima visita */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      await Promise.all(nomes.filter((n) => n.startsWith('coliseu-') && n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

async function guardar(pedido, resposta) {
  if (resposta && (resposta.ok || resposta.type === 'opaque')) {
    const cache = await caches.open(CACHE);
    await cache.put(pedido, resposta.clone());
  }
  return resposta;
}

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);

  // A conta do Dropbox nunca passa pelo que está guardado.
  if (url.hostname.endsWith('dropboxapi.com') || url.hostname.endsWith('dropbox.com')) return;

  // A página: internet primeiro; sem conexão, a guardada.
  if (pedido.mode === 'navigate') {
    evento.respondWith(
      (async () => {
        try {
          return await guardar(new Request(BASE + 'index.html'), await fetch(pedido));
        } catch {
          return (await caches.match(BASE + 'index.html')) || (await caches.match(BASE)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Fontes do Google: a guardada na hora e uma nova por trás.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    evento.respondWith(
      (async () => {
        const guardada = await caches.match(pedido);
        const nova = fetch(pedido)
          .then((r) => guardar(pedido, r))
          .catch(() => guardada);
        return guardada || nova;
      })(),
    );
    return;
  }

  // Arquivos do próprio jogo: o guardado primeiro; se não tiver, busca e guarda.
  if (url.origin === self.location.origin && url.pathname.startsWith(BASE)) {
    evento.respondWith(
      (async () => {
        const guardado = await caches.match(pedido);
        if (guardado) return guardado;
        try {
          return await guardar(pedido, await fetch(pedido));
        } catch {
          return Response.error();
        }
      })(),
    );
  }
});
