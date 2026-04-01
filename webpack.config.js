// Note that this file is only used for compile the service worker
// And when building, run this file first then vite.
import path from 'path';
import { fileURLToPath } from 'url';


export default {
    mode: 'none',
    entry: './src/service-worker/worker.js',
    output: {
        filename: 'cranium.js',
        path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'public'),
    },
    
}