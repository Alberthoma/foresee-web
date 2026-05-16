// Importa los scripts de Firebase (esto es necesario en el service worker)
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

// ¡IMPORTANTE! Usa la misma configuración que en tu index.html
const firebaseConfig = {
  apiKey: 'AIzaSyCTicX5tqqVr3pK_RFqgvqpRavsUuTvS2g',
  authDomain: 'wittfinances-282f1.firebaseapp.com',
  projectId: 'wittfinances-282f1',
  storageBucket: 'wittfinances-282f1.firebasestorage.app',
  messagingSenderId: '998192322959',
  appId: '1:998192322959:web:e2afcdd7f47da3767853fa',
};

// Inicializa Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Este es el evento clave: se dispara cuando llega una notificación y la app no está en primer plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano ', payload);

  // Extrae la información de la notificación del payload
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://res.cloudinary.com/datwdagbf/image/upload/v1756514685/proyeccion_hh3xyt.png' // Puedes usar el ícono de tu app
  };

  // Muestra la notificación en el dispositivo
  self.registration.showNotification(notificationTitle, notificationOptions);
});