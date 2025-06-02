import { createHash, createCipheriv } from 'crypto';

const encryptedCode = (code, key) => {
    const keyHash = createHash('sha256').update(key).digest();
  const key0 = keyHash.slice(0, 16); // Use the first 16 bytes for AES-128   
  const iv = Buffer.from('1234567890123456'); // 16 bytes IV for AES-128-CBC
  const cipher = createCipheriv('aes-128-cbc', Buffer.from(key0, 'utf8'), iv);
    let encrypted = cipher.update(code, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

export default function encryptPlugin(rules = []) {
  
  return {
    name: 'encrypt-bundle',
    
    renderChunk(code, chunk) {
    if(!chunk.moduleIds.some(id => rules.some(rule => id.includes(rule.path)))) {
      // 如果没有匹配到任何规则，则不进行加密处理
      return null;
    }
    console.log(`Processing chunk:`,chunk);
    return `
    ${Object.entries(chunk.importedBindings).map(([key,imports]) => imports.length===0?`import ${key}`:`import {imports.}`).join('\n')}
    const encodedPrompt = window.encodedPrompt || void 0;
    const moduleDecoder = window.moduleDecoder || window.atob || void 0;
    import("data:text/javascript;base64,"+atob(${btoa(JSON.stringify(code))}))
    `

    }
  };
}  