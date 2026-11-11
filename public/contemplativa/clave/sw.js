const VERSION="dfa4af6bff036a0ad40d";
const PRECACHE=["/contemplativa/clave/","/contemplativa/clave/assets/dm-mono-400-mu0k-7m0.ttf","/contemplativa/clave/assets/dm-mono-500-BzMgDRs4.ttf","/contemplativa/clave/assets/index-BOMoZXA0.css","/contemplativa/clave/assets/index-CSrjKG9n.js","/contemplativa/clave/assets/logo-iris-curva-CB-n3Mwn.png","/contemplativa/clave/assets/manrope-300-DIagOGV4.ttf","/contemplativa/clave/assets/manrope-400-BEIO-tX3.ttf","/contemplativa/clave/assets/manrope-500-C3q1kWH5.ttf","/contemplativa/clave/icons/apple-touch-icon.png","/contemplativa/clave/icons/favicon-32.png","/contemplativa/clave/icons/icon-192.png","/contemplativa/clave/icons/icon-512.png","/contemplativa/clave/icons/icon-maskable-512.png","/contemplativa/clave/index.html","/contemplativa/clave/licenses/DM-Mono-OFL.txt","/contemplativa/clave/licenses/Manrope-OFL.txt","/contemplativa/clave/manifest.webmanifest","/contemplativa/clave/starter.js"];
const INTEGRITY={"/contemplativa/clave/assets/dm-mono-400-mu0k-7m0.ttf":"sha256-yX/Ngi+CXp5zGGe2UKOe5ni2Cb6tKTheMgFxtXPsCRA=","/contemplativa/clave/assets/dm-mono-500-BzMgDRs4.ttf":"sha256-3WDQhho+/VQO/D8vheen/Wmn7Ofq30Sq/6X8XIat2g4=","/contemplativa/clave/assets/index-BOMoZXA0.css":"sha256-IVqkm/D7Vo6A1UIm+Dpnqipn/jgbSLOeZpm5MB5dKcw=","/contemplativa/clave/assets/index-CSrjKG9n.js":"sha256-kzA7DqctqrBLWMGGnaj4WmfrXaGAtuGud5O65xKg0Us=","/contemplativa/clave/assets/logo-iris-curva-CB-n3Mwn.png":"sha256-z4zlUflyJE8DuZd8gdmGRD+eC5xetilFsO8HsEANgwY=","/contemplativa/clave/assets/manrope-300-DIagOGV4.ttf":"sha256-is9BbFWuNzYBYaboT9kUibMhH/5VC6F991DijQaFu5M=","/contemplativa/clave/assets/manrope-400-BEIO-tX3.ttf":"sha256-oT2bQbCkcc5Y8ORtN3+jzHZhXkYyw7Fes5fKrfehPwo=","/contemplativa/clave/assets/manrope-500-C3q1kWH5.ttf":"sha256-9DPl0zO+ESjY7IoouKrdAxTRDhTkEFQGB2ZmvIMPwV0=","/contemplativa/clave/icons/apple-touch-icon.png":"sha256-Z75XivNyO1TjEUOs/ZUjNuWO2/6pBhFxc6VfFZwztgA=","/contemplativa/clave/icons/favicon-32.png":"sha256-5CZJICMs4iwGDQpkO0MhveMJWwKmRMUMq2Amryst9QY=","/contemplativa/clave/icons/icon-192.png":"sha256-zMnschtwY9yT+R/OMTuRcX36WdQeYoOgKlvkPOUaais=","/contemplativa/clave/icons/icon-512.png":"sha256-S3mq+Z3dTu2YxzrtWkoFrKPUnR53npJu7MzKY+4WWuQ=","/contemplativa/clave/icons/icon-maskable-512.png":"sha256-4ABwDcN+8caES1YRd5vRyQ/Dk/amtEnsLoMNM/XdMaA=","/contemplativa/clave/index.html":"sha256-WQL7J077dgokhvnsNpW/giHNW71TZNRMsfltu5uUctA=","/contemplativa/clave/licenses/DM-Mono-OFL.txt":"sha256-K62l6kXDxjt/HqH4jOlnLJ5PDEKyw7c3iUkIT+VaMGY=","/contemplativa/clave/licenses/Manrope-OFL.txt":"sha256-WBcuDA+sLNqKN7NIFku1XkSw5pBR5VfpKx0/aRAUH3s=","/contemplativa/clave/manifest.webmanifest":"sha256-naBG17BL6NBIxKnomc3KrGB9uoylzu24h1/c0LSrdiM=","/contemplativa/clave/starter.js":"sha256-VayKW6HoRzQ7YgclotB85RtHYHdBBYbCgVtz/aYKi3g=","/contemplativa/clave/":"sha256-WQL7J077dgokhvnsNpW/giHNW71TZNRMsfltu5uUctA="};
/* Build inserts VERSION and PRECACHE. This worker controls Clave exclusively. */
const PREFIX = 'portfolio-contemplativa-clave-pwa-';
const CACHE_NAME = PREFIX + VERSION;
const ASSETS = new Set(PRECACHE);
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            await cache.addAll(PRECACHE.map(url => new Request(url, {cache: 'reload', integrity: INTEGRITY[url]})));
        } catch (error) {
            await caches.delete(CACHE_NAME);
            throw error;
        }
    })());
    // Deliberately do not call skipWaiting: an open artwork keeps its version.
});
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const name of await caches.keys()) {
            if (name.startsWith(PREFIX) && name !== CACHE_NAME) await caches.delete(name);
        }
        await self.clients.claim();
    })());
});
self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin || !url.pathname.startsWith('/contemplativa/clave/')) return;
    if (!ASSETS.has(url.pathname)) return;
    // Serve the entire installed build consistently, including its HTML, until activation.
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(url.pathname) || fetch(request);
    })());
});
