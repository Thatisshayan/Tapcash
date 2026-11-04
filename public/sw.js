// TapCash service worker.
//
// Scope on purpose: push notifications + offline caching of static,
// content-hashed assets only. It must NEVER handle page navigations or HTML.
//
// v1 (until 2026-11-04) pre-cached "/" and "/dashboard" at install time and
// served cached responses first. "/dashboard" was cached while logged out, so
// the stored response was a redirect to /auth/signin; serving a redirected
// response to a navigation makes the browser fail with net::ERR_FAILED, which
// broke every refresh/direct load of signed-in pages. Caching user pages is
// also unsafe for a financial app (stale balances, shared devices).
// Bumping CACHE_NAME makes `activate` delete the v1 cache on existing devices.
const CACHE_NAME = "tapcash-static-v2";
const PRECACHE = ["/manifest.json", "/icon.jpg"];

function isCacheableAsset(url, request) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/fonts/")) return true;
  if (url.pathname.startsWith("/images/")) return true;
  return ["image", "font", "style", "script"].includes(request.destination);
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  // Let the browser handle every page load (and its redirects) natively.
  if (request.mode === "navigate" || request.destination === "document") return;

  const url = new URL(request.url);
  if (!isCacheableAsset(url, request)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Only store plain successful same-origin responses, never redirects.
        if (response.ok && !response.redirected && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "TapCash", body: event.data.text() };
  }

  const options = {
    body: payload.body || "You have a new notification",
    icon: "/icon.jpg",
    badge: "/icon.jpg",
    tag: payload.tag || "tapcash-default",
    data: { url: payload.url || "/dashboard" },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(payload.title || "TapCash", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
