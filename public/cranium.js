/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
const CACHE_NAME = "accumbens-static-v1";
const EXCLUDED_PATHS = new Set(["/index.html"]);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (!shouldHandleRequest(event.request)) {
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  const type = data.type;

  if (!type) {
    return;
  }

  event.waitUntil((async () => {
    if (type === "PING") {
      replyToClient(event, {
        type: "PONG",
        payload: {
          running: true,
          cacheName: CACHE_NAME,
        },
      });
      return;
    }

    if (type === "GET_CACHE_STATUS") {
      const status = await getCacheStatus();
      replyToClient(event, {
        type: "CACHE_STATUS",
        payload: status,
      });
      return;
    }

    if (type === "CLEAR_CACHE") {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      await Promise.all(requests.map((request) => cache.delete(request)));

      const status = await getCacheStatus();
      replyToClient(event, {
        type: "CACHE_CLEARED",
        payload: status,
      });

      await broadcast({
        type: "CACHE_UPDATED",
        payload: status,
      });
    }
  })());
});

function shouldHandleRequest(request) {
  if (request.method !== "GET") {
    return false;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return false;
  }

  if (EXCLUDED_PATHS.has(url.pathname)) {
    return false;
  }

  return true;
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreVary: true });

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (isCacheableResponse(response)) {
    await cache.put(request, response.clone());
  }

  return response;
}

function isCacheableResponse(response) {
  if (!response) {
    return false;
  }

  if (response.status !== 200) {
    return false;
  }

  if (response.type !== "basic") {
    return false;
  }

  const cacheControl = response.headers.get("cache-control") || "";
  if (cacheControl.includes("no-store")) {
    return false;
  }

  return true;
}

async function getCacheStatus() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  let totalBytes = 0;

  for (const request of requests) {
    const response = await cache.match(request);
    if (!response) {
      continue;
    }

    try {
      const buffer = await response.clone().arrayBuffer();
      totalBytes += buffer.byteLength;
    } catch {
      // Ignore non-readable responses.
    }
  }

  return {
    running: true,
    cacheName: CACHE_NAME,
    resourceCount: requests.length,
    totalBytes,
    updatedAt: Date.now(),
  };
}

function replyToClient(event, message) {
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage(message);
    return;
  }

  if (event.source && "postMessage" in event.source) {
    event.source.postMessage(message);
  }
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  clients.forEach((client) => client.postMessage(message));
}
/******/ })()
;