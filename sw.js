const C='artofie-v5';
const CDN=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com)\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html']).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||/script\.google(usercontent)?\.com/.test(r.url))return;
if(r.cache==='only-if-cached'&&r.mode!=='same-origin')return;
// Hanya same-origin dan CDN yang di-cache; gambar/situs lain (respons opaque besar) dibiarkan lewat
if(new URL(r.url).origin!==self.location.origin&&!CDN.test(r.url))return;
// Halaman pelanggan (QR: index.html?c=..&m=..&k=..) tidak ditangani service worker
if(/\/pesan\.html/.test(r.url)||(/[?&]k=/.test(r.url)&&/[?&]m=/.test(r.url)&&/[?&]c=/.test(r.url)))return;
// Pustaka/ikon dari CDN jarang berubah: cache dulu agar aplikasi terbuka cepat, perbarui di latar belakang
if(CDN.test(r.url)){e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{if(res&&(res.status===200||res.type==='opaque')){const cp=res.clone();e.waitUntil(caches.open(C).then(c=>c.put(r,cp)).catch(()=>{}));}return res;}).catch(()=>m||Response.error());if(m)e.waitUntil(net.catch(()=>{}));return m||net;}));return;}
e.respondWith(fetch(r).then(res=>{if(res&&(res.status===200||res.type==='opaque')){const cp=res.clone();e.waitUntil(caches.open(C).then(c=>c.put(r,cp)).catch(()=>{}));}return res;}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('index.html').then(x=>x||caches.match('./')):null)).then(m=>m||Response.error())));});
