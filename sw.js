const CACHE_NAME = 'calendar-cache-v2'; // Обязательно поменяйте версию, чтобы браузер сбросил старый кэш
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Заставляет новый SW сразу активироваться, не дожидаясь закрытия всех вкладок
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Активация и удаление старых кэшей
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Удален старый кэш:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Заставляет SW сразу взять под контроль все открытые клиенты
});

// Стратегия: Сначала сеть, если нет интернета - кэш (Network First)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Если запрос успешен, кладем копию в кэш и отдаем пользователю
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Если нет интернета, пытаемся отдать из кэша
        return caches.match(e.request);
      })
  );
});
