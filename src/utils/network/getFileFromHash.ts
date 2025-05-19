export function getFileFromHash(hash: string): Promise<Response> {
    return fetch('/docs/assets/'+hash);
}