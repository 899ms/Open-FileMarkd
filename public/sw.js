// 这是一个简单的Service Worker文件，用于支持离线功能和加快加载速度

const CACHE_NAME = 'pdf2md-cache-v1';

// 需要缓存的关键资源
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/logo-192x192.png',
  '/logo-512x512.png',
  '/manifest.json',
  '/og-image.png',
  '/favicon.ico'
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('已打开缓存');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        // 强制激活新的Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 确保控制客户端
      return self.clients.claim();
    })
  );
});

// 处理网络请求
self.addEventListener('fetch', (event) => {
  // 不处理POST请求和API请求
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') ||
    event.request.url.includes('chrome-extension://')
  ) {
    return;
  }

  // 网络优先策略
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果网络请求成功，克隆响应并缓存
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
        return response;
      })
      .catch(() => {
        // 如果网络请求失败，尝试从缓存中获取
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 如果缓存中也没有，返回默认的离线页面
            return caches.match('/');
          });
      })
  );
});

// 监听推送通知
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '有新消息',
      icon: '/logo-192x192.png',
      badge: '/logo-192x192.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'PDF2MD 通知', options)
    );
  } catch (error) {
    console.error('处理推送通知时出错:', error);
  }
});

// 点击通知事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
}); 