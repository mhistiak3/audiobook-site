// Service Worker for PWA - Network First Strategy with Offline Fallback
// Version: Update this to force cache refresh
const CACHE_VERSION = "v2";
const CACHE_NAME = `audiobook-${CACHE_VERSION}`;

// Only cache essential offline assets
const OFFLINE_ASSETS = ["/offline.html", "/logo.png"];

// Install event - cache only essential offline assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  // Force immediate activation - don't wait for old service worker
  self.skipWaiting();
});

// Activate event - clean up old caches and take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim(),
    ])
  );
});

// Fetch event - Network First Strategy (only use cache when offline)
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests (API calls, YouTube, etc.)
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API routes and Supabase calls
  if (
    request.url.includes("/api/") ||
    request.url.includes("supabase") ||
    request.url.includes("_next/webpack")
  ) {
    return;
  }

  event.respondWith(
    // Always try network first
    fetch(request)
      .then((response) => {
        // If we got a valid response, return it (don't cache dynamically)
        if (response && response.status === 200) {
          return response;
        }
        return response;
      })
      .catch(async () => {
        // Network failed - we're offline
        // Try to get from cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests, show offline page
        if (request.mode === "navigate") {
          const offlinePage = await caches.match("/offline.html");
          if (offlinePage) {
            return offlinePage;
          }
        }

        // Return a simple offline response for other requests
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" }),
        });
      })
  );
});

// Listen for skip waiting message from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
