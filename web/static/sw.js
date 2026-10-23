/* Service Worker - Bảng Điểm Học Tập
 * Chiến lược:
 *  - /api/*            : luôn đi thẳng mạng, không cache (dữ liệu người dùng)
 *  - Trang (navigate)  : network-first, rơi về cache khi offline
 *  - Tài nguyên cùng origin (JS/CSS/icon): network-first, rơi về cache khi offline
 *    (tránh phục vụ bản JS cũ sau khi deploy)
 *  - Thư viện CDN (xlsx, firebase, font): stale-while-revalidate
 */
const CACHE_VERSION = "v1";
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const CDN_CACHE = `cdn-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== CDN_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function networkFirst(request, cacheName) {
  return fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match("/");
        return Response.error();
      }),
    );
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === "opaque")) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Không bao giờ can thiệp vào API và các request xác thực của Firebase
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return;
  if (
    url.hostname.endsWith("googleapis.com") &&
    !url.hostname.startsWith("fonts.")
  )
    return;
  if (url.hostname.endsWith("firebaseio.com")) return;

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  // Thư viện/phông chữ từ CDN
  if (
    url.hostname === "cdnjs.cloudflare.com" ||
    url.hostname === "www.gstatic.com" ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(staleWhileRevalidate(request, CDN_CACHE));
  }
});
