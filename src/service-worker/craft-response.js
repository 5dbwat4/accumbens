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

export { craftResponse };