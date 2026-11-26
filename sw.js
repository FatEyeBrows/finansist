// sw.js — офлайн для «Финансиста»: страница и Chart.js берутся из памяти телефона, в фоне обновляются.
// Запросы к Google (данные, записи) не кэшируются — их очередь держит сама страница.
const C='fin-v1',FILES=['./','https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.endsWith('google.com')||u.hostname.endsWith('googleusercontent.com'))return;
  const key=u.origin===location.origin&&u.pathname.endsWith('/')?'./':e.request;
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(key,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(key,r.clone());return r}).catch(()=>hit);
    return hit||net;
  }));
});
