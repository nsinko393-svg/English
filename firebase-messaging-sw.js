/* firebase-messaging-sw.js — service worker для фонових push-сповіщень
   WordMap. Має лежати в КОРЕНІ сайту (поруч з index.html), інакше його
   область дії (scope) не покриватиме всю сторінку.

   Конфіг тут навмисно продубльовано з index.html (DEFAULT_FIREBASE_CONFIG) —
   service worker виконується в окремому контексті й не бачить змінних
   сторінки. Це не секрет (ключ Firebase для веброзробки призначений бути
   публічним, захист лежить на правилах Firestore), але якщо ви підключите
   ІНШИЙ Firebase-проєкт у Налаштуваннях → Хмара, оновіть значення й тут. */

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB-j0NTweiy0q2KCUKVTFF106OlAO9napQ",
  authDomain: "english-ba621.firebaseapp.com",
  databaseURL: "https://english-ba621-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "english-ba621",
  storageBucket: "english-ba621.firebasestorage.app",
  messagingSenderId: "1055258408142",
  appId: "1:1055258408142:web:02e851b942533e08090c9f"
});

const messaging = firebase.messaging();

/* Показуємо системне сповіщення, коли push прийшов, а сайт (вкладка)
   закритий або не в фокусі. Поки сайт відкритий, повідомлення ловить
   сама сторінка (Push.enable() → onMessage у index.html) і показує тост
   замість системного сповіщення. */
messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || 'WordMap', {
    body: n.body || '',
    icon: 'https://em-content.zobj.net/source/apple/354/world-map_1f5fa-fe0f.png',
    badge: 'https://em-content.zobj.net/source/apple/354/world-map_1f5fa-fe0f.png',
    tag: 'wordmap-reminder',   // нове сповіщення замінює попереднє, а не накопичується
    data: { url: self.registration.scope }
  });
});

/* Клік по сповіщенню відкриває сайт (або фокусує вже відкриту вкладку) */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) if (c.url === url && 'focus' in c) return c.focus();
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
