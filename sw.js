/* Copia offline del sito: prima la rete, senza rete l'ultima versione salvata (che resta cifrata). */
const CACHE = 'portafoglio-d23ee2ca23b5';
const FILE = ["./", "./costo-del-giro.html", "./fineco/allocazione.html", "./fineco/radiografia.html", "./fineco/report.html", "./fineco/schede.html", "./index.html", "./termometro-inflazione.html", "./assets/home.css", "./assets/app-shell.css", "./assets/app.js", "./sblocca.js", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => Promise.allSettled(FILE.map(file => cache.add(file))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(nomi => Promise.all(nomi.filter(nome => nome.startsWith('portafoglio-') && nome !== CACHE).map(nome => caches.delete(nome))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const richiesta = event.request;
  if (richiesta.method !== 'GET') return;
  const interna = new URL(richiesta.url).origin === self.location.origin;
  event.respondWith(caches.open(CACHE).then(async cache => {
    if (interna) {
      try {
        const risposta = await fetch(richiesta);
        if (risposta.ok) cache.put(richiesta, risposta.clone());
        return risposta;
      } catch (_) {
        const salvata = await cache.match(richiesta, {ignoreSearch: true});
        if (salvata) return salvata;
        return (richiesta.mode === 'navigate' && await cache.match('./index.html')) || Response.error();
      }
    }
    // librerie (cdnjs) e caratteri (Google Fonts): dalla copia salvata, se c'è
    const salvata = await cache.match(richiesta);
    if (salvata) return salvata;
    const risposta = await fetch(richiesta);
    if (risposta.ok || risposta.type === 'opaque') cache.put(richiesta, risposta.clone());
    return risposta;
  }));
});
