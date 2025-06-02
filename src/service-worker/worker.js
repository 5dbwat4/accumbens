const CACHE_NAME = 'accumbens-cache-r1';

// 监听安装事件
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  // 跳过等待阶段，立即激活
  self.skipWaiting();
});

// 监听激活事件
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  // 清除旧缓存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  // 立即控制客户端
  return self.clients.claim();
});

// 监听fetch事件
self.addEventListener('fetch', event => {
  // 只处理同源的请求
  if (new URL(event.request.url).origin === self.origin) {
    event.respondWith(
      // 发送初始请求消息
      sendMessage('REQUEST_START', event.request.url)
        .then(() => {
          // 先从缓存中获取
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                // 发送缓存命中消息
                sendMessage('CACHE_HIT', event.request.url);
                return cachedResponse;
              }
              
              // 缓存未命中，发送请求并缓存
              return fetch(event.request.clone())
                .then(response => {
                  // 检查响应是否有效
                  if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                  }
                  
                  // 克隆响应用于缓存
                  const responseToCache = response.clone();
                  
                  // 发送缓存写入消息
                  sendMessage('CACHE_WRITE', event.request.url);
                  
                  // 将响应添加到缓存
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, responseToCache));
                  
                  // 发送请求完成消息
                  sendMessage('REQUEST_COMPLETE', event.request.url);
                  
                  return response;
                })
                .catch(error => {
                  // 发送请求错误消息
                  sendMessage('REQUEST_ERROR', event.request.url, error.message);
                  throw error;
                });
            });
        })
    );
  }
});

// 发送消息给客户端
function sendMessage(type, url, payload = {}) {
  return self.clients.matchAll()
    .then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type,
          url,
          payload,
          timestamp: Date.now()
        });
      });
    });
}