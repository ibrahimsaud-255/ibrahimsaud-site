/* نظام الجمعيات الشبابية — عامل الخدمة: يستقبل الإشعارات الحقيقيّة (الأذان، النشاط القادم، الأخبار، العملات) ويفتح التطبيق على الشاشة المناسبة */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let m = {}; try { m = e.data ? e.data.json() : {}; } catch (er) { m = { title: 'نظام الجمعيات الشبابية', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(m.title || 'نظام الجمعيات الشبابية', {
    body: m.body || '', tag: m.tag || undefined, renotify: !!m.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
    dir: 'rtl', lang: 'ar', requireInteraction: !!m.adhan, vibrate: m.adhan ? [400, 200, 400, 200, 800] : [200], data: { url: m.url || './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.startsWith(self.registration.scope)) { c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
