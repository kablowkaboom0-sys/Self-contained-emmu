const C="self-contained-gba-v38";
const ASSETS=["./","index.html","style.css","sw.js","js/arm.js","js/audio.js","js/core.js","js/gba.js","js/gpio.js","js/io.js","js/irq.js","js/keypad.js","js/mmu.js","js/savedata.js","js/sio.js","js/thumb.js","js/util.js","js/video.js","js/video/proxy.js","js/video/software.js","js/video/worker.js","resources/biosbin.js"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;

  // Always try the network first for page navigations so a new deployment
  // cannot be hidden indefinitely by an older cached index.html.
  if(e.request.mode==="navigate"){
    e.respondWith(
      fetch(e.request)
        .then(r=>{
          const copy=r.clone();
          caches.open(C).then(c=>c.put(e.request,copy));
          return r;
        })
        .catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});