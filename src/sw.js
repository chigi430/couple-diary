import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// 브라우저가 푸시 구독을 갱신/폐기하면(갤럭시 배터리 최적화 등으로 흔히 발생)
// 즉시 새 구독을 만들고, 열려있는 앱 화면에 알려서 DB에 새 endpoint 를 저장하게 한다.
self.addEventListener("pushsubscriptionchange", (event) => {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) })
      .then(() => self.clients.matchAll({ includeUncontrolled: true, type: "window" }))
      .then((list) => list.forEach((c) => c.postMessage({ type: "push-subscription-changed" })))
      .catch((e) => console.warn("pushsubscriptionchange 재구독 실패:", e))
  );
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "오늘의 우리", {
      body: data.body || "",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
