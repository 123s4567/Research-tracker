// MCA Research Tracker – Service Worker
// Strategy:
//   - Static assets (JS/CSS/fonts): Cache-first
//   - API requests: Network-first with 5s timeout, no offline fallback
//   - Navigation (HTML): Network-first, fallback to /offline

const CACHE_NAME    = 'mca-tracker-v1'
const OFFLINE_URL   = '/offline'
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
]

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and non-same-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) return

  // API: network-first, no caching
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ success: false, error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
    return
  }

  // Static assets (_next/static): cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => cached ?? fetchAndCache(request))
    )
    return
  }

  // Navigation: network-first, fallback to /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached ?? (await caches.match(OFFLINE_URL)) ?? new Response('Offline', { status: 503 })
        })
    )
    return
  }
})

async function fetchAndCache(request) {
  const cache    = await caches.open(CACHE_NAME)
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}
