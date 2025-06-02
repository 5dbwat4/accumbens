if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}


navigator.serviceWorker.addEventListener('message', event => {
  console.log('收到Service Worker消息:', event.data);
  // 根据消息类型更新UI或执行其他操作
  switch (event.data.type) {
    case 'REQUEST_START':
      // 显示加载状态
      break;
    case 'CACHE_HIT':
      // 使用缓存数据
      break;
    case 'CACHE_WRITE':
      // 更新缓存状态
      break;
    case 'REQUEST_COMPLETE':
      // 更新UI显示新数据
      break;
    case 'REQUEST_ERROR':
      // 显示错误信息
      break;
  }
});