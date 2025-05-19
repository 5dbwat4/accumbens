// Note that this file is only used for compile the service worker
// And when building, run this file first then vite.
const path = require('path');


module.exports = {
    mode: 'none',
    entry: './src/service-worker/index.js',
    output: {
        filename: 'sw.js',
        path: path.resolve(__dirname, 'public'),
    },
    
}