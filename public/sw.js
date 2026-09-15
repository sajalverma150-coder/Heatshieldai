// HeatShield AI Service Worker for OS-Level Push Notifications
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/1684/1684375.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/1684/1684375.png',
        tag: 'heatshield-push-' + Date.now(),
        renotify: true,
        vibrate: [300, 100, 300, 100, 400],
        requireInteraction: true,
        silent: false,
        actions: [
          { action: 'open_guidance', title: '🚨 Open Safety Guidance' }
        ]
      };
      event.waitUntil(self.registration.showNotification(data.title || '🚨 HeatShield Alert', options));
    } catch (e) {
      console.error('Push notification JSON parse error:', e);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          client.postMessage({ type: 'HEATSHIELD_NOTIFICATION_CLICKED' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
