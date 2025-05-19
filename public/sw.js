/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clear: () => (/* binding */ clear),
/* harmony export */   createStore: () => (/* binding */ createStore),
/* harmony export */   del: () => (/* binding */ del),
/* harmony export */   delMany: () => (/* binding */ delMany),
/* harmony export */   entries: () => (/* binding */ entries),
/* harmony export */   get: () => (/* binding */ get),
/* harmony export */   getMany: () => (/* binding */ getMany),
/* harmony export */   keys: () => (/* binding */ keys),
/* harmony export */   promisifyRequest: () => (/* binding */ promisifyRequest),
/* harmony export */   set: () => (/* binding */ set),
/* harmony export */   setMany: () => (/* binding */ setMany),
/* harmony export */   store: () => (/* binding */ store),
/* harmony export */   update: () => (/* binding */ update),
/* harmony export */   values: () => (/* binding */ values)
/* harmony export */ });

// Originally https://github.com/jakearchibald/idb-keyval
// Modified by 5dbwat4 to support multiple databases and stores




const DBMap = new Map();

function store(dbName,storeName){
    const mapName = dbName +':'+ storeName;
    if(!DBMap.has(mapName)){
        DBMap.set(mapName,createStore(mapName,storeName));
    }
    return {
        get:(key)=>get(key,DBMap.get(mapName)),
        set:(key,value)=>set(key,value,DBMap.get(mapName)),
        setMany:(entries)=>setMany(entries,DBMap.get(mapName)),
        getMany:(keys)=>getMany(keys,DBMap.get(mapName)),
        update:(key,updater)=>update(key,updater,DBMap.get(mapName)),
        del:(key)=>del(key,DBMap.get(mapName)),
        delMany:(keys)=>delMany(keys,DBMap.get(mapName)),
        clear:()=>clear(DBMap.get(mapName)),
        keys:()=>keys(DBMap.get(mapName)),
        values:()=>values(DBMap.get(mapName)),
        entries:()=>entries(DBMap.get(mapName)),
    }
}




function promisifyRequest(request) {
    return new Promise((resolve, reject) => {
        // @ts-ignore - file size hacks
        request.oncomplete = request.onsuccess = () => resolve(request.result);
        // @ts-ignore - file size hacks
        request.onabort = request.onerror = () => reject(request.error);
    });
}
function createStore(dbName, storeName) {
    const request = indexedDB.open(dbName);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    const dbp = promisifyRequest(request);
    return (txMode, callback) => dbp.then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)));
}
// let defaultGetStoreFunc;
// function defaultGetStore() {
//     if (!defaultGetStoreFunc) {
//         defaultGetStoreFunc = createStore('keyval-store', 'keyval');
//     }
//     return defaultGetStoreFunc;
// }
/**
 * Get a value by its key.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function get(key, customStore) {
    return customStore('readonly', (store) => promisifyRequest(store.get(key)));
}
/**
 * Set a value with a key.
 *
 * @param key
 * @param value
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function set(key, value, customStore) {
    return customStore('readwrite', (store) => {
        store.put(value, key);
        return promisifyRequest(store.transaction);
    });
}
/**
 * Set multiple values at once. This is faster than calling set() multiple times.
 * It's also atomic – if one of the pairs can't be added, none will be added.
 *
 * @param entries Array of entries, where each entry is an array of `[key, value]`.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function setMany(entries, customStore) {
    return customStore('readwrite', (store) => {
        entries.forEach((entry) => store.put(entry[1], entry[0]));
        return promisifyRequest(store.transaction);
    });
}
/**
 * Get multiple values by their keys
 *
 * @param keys
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function getMany(keys, customStore) {
    return customStore('readonly', (store) => Promise.all(keys.map((key) => promisifyRequest(store.get(key)))));
}
/**
 * Update a value. This lets you see the old value and update it as an atomic operation.
 *
 * @param key
 * @param updater A callback that takes the old value and returns a new value.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function update(key, updater, customStore) {
    return customStore('readwrite', (store) => 
    // Need to create the promise manually.
    // If I try to chain promises, the transaction closes in browsers
    // that use a promise polyfill (IE10/11).
    new Promise((resolve, reject) => {
        store.get(key).onsuccess = function () {
            try {
                store.put(updater(this.result), key);
                resolve(promisifyRequest(store.transaction));
            }
            catch (err) {
                reject(err);
            }
        };
    }));
}
/**
 * Delete a particular key from the store.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function del(key, customStore) {
    return customStore('readwrite', (store) => {
        store.delete(key);
        return promisifyRequest(store.transaction);
    });
}
/**
 * Delete multiple keys at once.
 *
 * @param keys List of keys to delete.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function delMany(keys, customStore) {
    return customStore('readwrite', (store) => {
        keys.forEach((key) => store.delete(key));
        return promisifyRequest(store.transaction);
    });
}
/**
 * Clear all values in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function clear(customStore) {
    return customStore('readwrite', (store) => {
        store.clear();
        return promisifyRequest(store.transaction);
    });
}
function eachCursor(store, callback) {
    store.openCursor().onsuccess = function () {
        if (!this.result)
            return;
        callback(this.result);
        this.result.continue();
    };
    return promisifyRequest(store.transaction);
}
/**
 * Get all keys in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function keys(customStore) {
    return customStore('readonly', (store) => {
        // Fast path for modern browsers
        if (store.getAllKeys) {
            return promisifyRequest(store.getAllKeys());
        }
        const items = [];
        return eachCursor(store, (cursor) => items.push(cursor.key)).then(() => items);
    });
}
/**
 * Get all values in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function values(customStore) {
    return customStore('readonly', (store) => {
        // Fast path for modern browsers
        if (store.getAll) {
            return promisifyRequest(store.getAll());
        }
        const items = [];
        return eachCursor(store, (cursor) => items.push(cursor.value)).then(() => items);
    });
}
/**
 * Get all entries in the store. Each entry is an array of `[key, value]`.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function entries(customStore) {
    return customStore('readonly', (store) => {
        // Fast path for modern browsers
        // (although, hopefully we'll get a simpler path some day)
        if (store.getAll && store.getAllKeys) {
            return Promise.all([
                promisifyRequest(store.getAllKeys()),
                promisifyRequest(store.getAll()),
            ]).then(([keys, values]) => keys.map((key, i) => [key, values[i]]));
        }
        const items = [];
        return customStore('readonly', (store) => eachCursor(store, (cursor) => items.push([cursor.key, cursor.value])).then(() => items));
    });
}




/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   craftResponse: () => (/* binding */ craftResponse)
/* harmony export */ });
const mime_type = {
    'css': 'text/css',
    'js': 'text/javascript',
    'json': 'application/json',
    'html': 'text/html',
    'md': 'text/markdown',
    'txt': 'text/plain',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'eot': 'font/eot',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'pdf': 'application/pdf',
    'zip': 'application/zip',
    'gz': 'application/gzip',
    'tar': 'application/x-tar',
    'rar': 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    'exe': 'application/octet-stream',
    'bin': 'application/octet-stream',

};

const predictContentType = (url) => {
    const ext = url.split('.').pop();
    return mime_type[ext] || 'text/plain';
};


const craftResponse = (body, reqUrl) => {
    const headers = new Headers({
        'Content-Type': predictContentType(reqUrl),
        'Content-Length': body.length,
        'x-service-worker': 'true',
        'x-accumbens': '5dbwat4'
    });
    return new Response(new Blob([body]), {

    });
};



/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modified_idb_keyval_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _craft_response_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);




self.addEventListener('install', (event) => {
  // Initialize the cache with the intigreties
  event.waitUntil(
    Promise.all([
      fetch('/docs/md-integrity.json').then(r => r.json()).then(async (data) => {
        (0,_modified_idb_keyval_js__WEBPACK_IMPORTED_MODULE_0__.store)('accumbens-docs', 'md-integrity').setMany(Object.entries(data));
      }),
      fetch('/docs/assets-integrity.json').then(r => r.json()).then(async (data) => {
        (0,_modified_idb_keyval_js__WEBPACK_IMPORTED_MODULE_0__.store)('accumbens-docs', 'assets-integrity').setMany(Object.entries(data));
      })
    ])
  );

  // fetch('/assets/integrity.json').then(r => r.json()).then(async (data) => {
  //     store('accumbens-core', 'assets').setMany(Object.entries(data));
  // });
});

const createResponseFromKey = async (key) => {
  // Craft response from cache
  // console.log('creating response from key');

  const storex = (0,_modified_idb_keyval_js__WEBPACK_IMPORTED_MODULE_0__.store)('accumbens-docs', 'file-store')
  // try {
  // console.log('trying to get key');

  const content = await storex.get(key);
  if (content) {
    // console.log('found in cache');
    return (0,_craft_response_js__WEBPACK_IMPORTED_MODULE_1__.craftResponse)(content, '/accumbens-docs-api/' + key);
  } else {
    return await fetch('/docs/assets/' + key).then(async (response) => {
      const data = await response.blob();
      storex.set(key, data);
      return (0,_craft_response_js__WEBPACK_IMPORTED_MODULE_1__.craftResponse)(data, '/accumbens-docs-api/' + key);
    });
  }


  // return craftResponse(await storex.get(key), '/accumbens-docs-api/' + key);
  // } catch (e) {
  //     console.log(e);

  //     if (e.name === 'NotFoundError') {
  //         console.log('not found in cache');
  //         return await fetch('/docs/assets/' + key).then(async (response) => {
  //             const data = await response.blob();
  //             storex.set(key, data);
  //             return craftResponse(data, '/accumbens-docs-api/' + key);
  //         });
  //     }
  // }
  // if (storex.get(key)) {

  // } else {
  //     return await fetch('/docs/assets/' + key).then(async (response) => {
  //         const data = await response.blob();
  //         storex.set(key, data);
  //         return craftResponse(data, '/accumbens-docs-api/' + key);
  //     });
  // }
};

const createResponse = async (storex, path) => {
  // Craft response from cache
  if (storex.get(path)) {
    return (0,_craft_response_js__WEBPACK_IMPORTED_MODULE_1__.craftResponse)(storex.get(path), path);
  } else {
    return await fetch(path).then(async (response) => {
      const data = await response.blob();
      storex.set(path, data);
      return (0,_craft_response_js__WEBPACK_IMPORTED_MODULE_1__.craftResponse)(data, path);
    });
  }
};


self.addEventListener('fetch', async (event) => {
  const url = new URL(event.request.url);
  // console.log(url.pathname);

  event.respondWith(
    new Promise(async (resolve, reject) => {


      if (url.pathname.startsWith('/docs/') && url.pathname.endsWith('.md')) {
        const storex = (0,_modified_idb_keyval_js__WEBPACK_IMPORTED_MODULE_0__.store)('accumbens-docs', 'md-integrity');
        if (storex.get(url.pathname)) {
          // event.respondWith(await createResponseFromKey(await storex.get(url.pathname)))
          resolve(createResponseFromKey(await storex.get(url.pathname)));
          return;
        }
      }
      // if (url.pathname.startsWith('/assets/')) {
      //     const storex =await store('accumbens-core', 'assets');
      //     if (await storex.get(url.pathname)) {
      //         event.respondWith(await createResponse(storex,url.pathname))
      //         return;
      //     }
      // }
      // console.log(url.pathname.slice(1));

      await (0,_modified_idb_keyval_js__WEBPACK_IMPORTED_MODULE_0__.store)('accumbens-docs', 'assets-integrity').get(url.pathname.slice(1)).then(async (key) => {
        // console.log(key);

        if (key) {
          // console.log(await createResponseFromKey(key));

          // event.respondWith(await createResponseFromKey(key))
          resolve(createResponseFromKey(key));
          // event.respondWith('hello');
          return
        }
        resolve(fetch(event.request));
        return;
      }).catch(async (e) => {
        // console.log(e);
        // if (e.name === 'NotFoundError') {
        //     console.log('walked2');

        //     // event.respondWith(await fetch(event.request));

        //     return
        //     // console.log('Not found in cache');
        // }
        // console.log('walked');

      });


    })
  )

});
})();

/******/ })()
;