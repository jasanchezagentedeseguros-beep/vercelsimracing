const CACHE_NAME="spl-supabase-v1";
const ASSETS=["./","./index.html","./admin.html","./styles.css","./app.js","./admin.js","./manifest.json","./icon-192.png","./icon-512.png","./service-worker.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE_NAME?null:caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{ if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).catch(()=>caches.match("./index.html"))));
});