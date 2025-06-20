// 数据库相关常量
const DB_NAME: string = 'accumbens:readingProgressDB';
const DB_VERSION: number = 1;
const STORE_NAME: string = 'accumbens:readingPositions';

// 阅读位置数据接口
interface ReadingPosition {
  pageUrl: string;
  position: number;
  timestamp: Date;
}

// 初始化IndexedDB
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
      // 创建对象存储并指定索引
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore: IDBObjectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'pageUrl'
        });
        objectStore.createIndex('position', 'position', { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      reject(new Error(`IndexedDB错误: ${(event.target as IDBOpenDBRequest).error?.message}`));
    };
  });
}

// 保存当前阅读位置
async function saveReadingPosition(position: number): Promise<void> {
  try {
    const db: IDBDatabase = await initDB();
    const transaction: IDBTransaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore: IDBObjectStore = transaction.objectStore(STORE_NAME);
    
    const pageUrl: string = window.location.href;
    const positionData: ReadingPosition = {
      pageUrl,
      position,
      timestamp: new Date()
    };
    
    return new Promise((resolve, reject) => {
      const request: IDBRequest = objectStore.put(positionData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('保存阅读位置失败'));
    });
  } catch (error) {
    console.error('保存阅读位置时出错:', error);
    throw error;
  }
}

// 获取上次阅读位置
async function getReadingPosition(): Promise<number> {
  try {
    const db: IDBDatabase = await initDB();
    const transaction: IDBTransaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore: IDBObjectStore = transaction.objectStore(STORE_NAME);
    
    const pageUrl: string = window.location.href;
    const request: IDBRequest = objectStore.get(pageUrl);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result: ReadingPosition | null = request.result;
        resolve(result?.position || 0);
      };
      request.onerror = () => reject(new Error('获取阅读位置失败'));
    });
  } catch (error) {
    console.error('获取阅读位置时出错:', error);
    throw error;
  }
}

// 页面加载时恢复阅读位置
async function restoreReadingPosition(): Promise<number> {
  try {
    const position: number = await getReadingPosition();
    window.scrollTo({
      top: position,
      behavior: 'smooth'
    });
    beginReadingProgressTracking(); // 恢复位置后开始跟踪阅读进度
    console.log(`恢复阅读位置到: ${position}`);
    return position;
  } catch (error) {
    console.error('恢复阅读位置失败:', error);
    return 0;
  }
}

// 初始化阅读进度跟踪相关变量
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
const SCROLL_DEBOUNCE_TIME: number = 1000;
let doProgressTracking: boolean = false;

function beginReadingProgressTracking() {
  doProgressTracking = true;
}

function stopReadingProgressTracking() {
  doProgressTracking = false;
}

function initReadingProgressTracking() {
  // 滚动时更新位置（防抖处理）
  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(async () => {
      if (!doProgressTracking) return; // 如果不需要跟踪，直接返回
      const currentPosition: number = window.scrollY;
      await saveReadingPosition(currentPosition);
    }, SCROLL_DEBOUNCE_TIME);
  });
}

// 初始化书签功能
initReadingProgressTracking();

// 导出模块（建议使用ES6模块化规范）
export {
  restoreReadingPosition,
  stopReadingProgressTracking,
  beginReadingProgressTracking // 建议将开始跟踪功能也导出
};