const CACHE_VERSION = "ouedna-shell-v5-20261010";
const SHELL_CACHE = CACHE_VERSION;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/shortcut-96.png",
];

function isPrivatePath(pathname) {
  return /^\/(admin|api|auth|account|profile|settings|login|logout)(\/|$)/i.test(pathname)
    || pathname === "/maintenance";
}

function mayStorePublicDocument(request, response) {
  const url = new URL(request.url);
  const cacheControl = response.headers.get("cache-control") || "";
  return url.origin === self.location.origin
    && !isPrivatePath(url.pathname)
    && !url.search
    && response.ok
    && response.type !== "opaque"
    && !/\b(private|no-store)\b/i.test(cacheControl);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("ouedna-") && key !== SHELL_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function offlineFallback(request, error) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const offline = await caches.match(OFFLINE_URL);
  if (offline) return offline;
  throw error;
}

async function networkFirst(request) {
  const url = new URL(request.url);
  // Private or personalised pages are never read from / written to the cache,
  // but a failed navigation still gets the friendly offline page.
  if (isPrivatePath(url.pathname) || url.search) {
    try {
      return await fetch(request);
    } catch (error) {
      if (isPrivatePath(url.pathname)) throw error;
      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
      throw error;
    }
  }

  try {
    const response = await fetch(request);
    if (mayStorePublicDocument(request, response)) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return offlineFallback(request, error);
  }
}

async function cacheFirst(request) {
  const url = new URL(request.url);
  if (isPrivatePath(url.pathname)) return fetch(request);

  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type !== "opaque" && !/\b(private|no-store)\b/i.test(response.headers.get("cache-control") || "")) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  const url = new URL(request.url);
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request));
  } else if (url.origin === self.location.origin && (request.mode === "navigate" || request.destination === "document")) {
    event.respondWith(networkFirst(request));
  }
});
