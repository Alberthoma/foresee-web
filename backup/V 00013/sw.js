'use strict';

/* Service Worker — Calculadora de Salario Neto.
   CACHE_VERSION debe subir en cada release (junto con el footer #app-version);
   eso invalida automáticamente la caché anterior en el evento 'activate'. */
const CACHE_VERSION = 13;
const CACHE_NAME = `calculadora-salarial-cache-v${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  'index.html',
  'calculadora-salarial.css',
  'calculadora-salarial.js',
  'manifest.json',
  'logo.png',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const isDocument = event.request.destination === 'document' || event.request.url.endsWith('.html');

  if (isDocument) {
    // HTML: red primero, para que el usuario reciba siempre la última versión;
    // si no hay red, se sirve la copia cacheada.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('index.html'))),
    );
    return;
  }

  // Assets estáticos: caché primero, con actualización en segundo plano.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    }),
  );
});
