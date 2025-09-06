// Nombre de la caché de nuestra aplicación
const CACHE_NAME = 'gestor-financiero-cache-v1';

// Archivos que queremos guardar en la caché para que la app funcione sin conexión
const urlsToCache = [
  '/',
  '/index.html',
  // NOTA: Si añades archivos CSS o JS locales, deberás agregarlos aquí también.
  // Por ahora, como usas CDNs, solo necesitamos los básicos.
  'https://res.cloudinary.com/datwdagbf/image/upload/v1756514685/proyeccion_hh3xyt.png'
];

// Evento "install": se dispara cuando el Service Worker se instala por primera vez.
self.addEventListener('install', event => {
  // Esperamos a que la promesa de abrir la caché y añadir los archivos se complete.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché abierta, guardando archivos...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento "fetch": se dispara cada vez que la página pide un recurso (una imagen, un archivo, etc.).
self.addEventListener('fetch', event => {
  event.respondWith(
    // Buscamos primero en la caché si tenemos el recurso.
    caches.match(event.request)
      .then(response => {
        // Si lo encontramos en la caché, lo devolvemos.
        if (response) {
          return response;
        }
        // Si no, lo pedimos a la red (a internet).
        return fetch(event.request);
      }
    )
  );
});