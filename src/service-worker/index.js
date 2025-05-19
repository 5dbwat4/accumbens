import { store } from './modified-idb-keyval.js';

import { craftResponse } from './craft-response.js';

self.addEventListener('install', (event) => {
  // Initialize the cache with the intigreties
  event.waitUntil(
    Promise.all([
      fetch('/docs/md-integrity.json').then(r => r.json()).then(async (data) => {
        store('accumbens-docs', 'md-integrity').setMany(Object.entries(data));
      }),
      fetch('/docs/assets-integrity.json').then(r => r.json()).then(async (data) => {
        store('accumbens-docs', 'assets-integrity').setMany(Object.entries(data));
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

  const storex = store('accumbens-docs', 'file-store')
  // try {
  // console.log('trying to get key');

  const content = await storex.get(key);
  if (content) {
    // console.log('found in cache');
    return craftResponse(content, '/accumbens-docs-api/' + key);
  } else {
    return await fetch('/docs/assets/' + key).then(async (response) => {
      const data = await response.blob();
      storex.set(key, data);
      return craftResponse(data, '/accumbens-docs-api/' + key);
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
    return craftResponse(storex.get(path), path);
  } else {
    return await fetch(path).then(async (response) => {
      const data = await response.blob();
      storex.set(path, data);
      return craftResponse(data, path);
    });
  }
};


self.addEventListener('fetch', async (event) => {
  const url = new URL(event.request.url);
  // console.log(url.pathname);

  event.respondWith(
    new Promise(async (resolve, reject) => {


      if (url.pathname.startsWith('/docs/') && url.pathname.endsWith('.md')) {
        const storex = store('accumbens-docs', 'md-integrity');
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

      await store('accumbens-docs', 'assets-integrity').get(url.pathname.slice(1)).then(async (key) => {
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