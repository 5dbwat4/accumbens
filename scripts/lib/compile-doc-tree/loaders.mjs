export const createEntryLoaderCode = (fileIds) => {
  const entryLoaderMapLiteral = `\n{\n${fileIds
    .map((fileId) => `  "${fileId}": () => import("./entry-chunks/${fileId}.js"),`)
    .join("\n")}\n}`;

  return `// THIS FILE IS GENERATED AUTOMATICALLY
import manifest from "./accumbens.entries.manifest.js";

const fileLoaders = ${entryLoaderMapLiteral};

const fileCache = new Map();

async function loadFile(fileId){
  if (!fileId) return null;
  if (!fileCache.has(fileId)) {
    const loader = fileLoaders[fileId];
    if (!loader) return null;
    const loaded = await loader();
    fileCache.set(fileId, loaded.default || loaded);
  }
  return fileCache.get(fileId);
}

export async function loadEntryModuleByKey(unikey){
  const fileId = manifest[unikey];
  if (!fileId) return null;
  const bucket = await loadFile(fileId);
  const importer = bucket?.[unikey];
  return importer ? importer() : null;
}

const entryProxy = new Proxy({}, {
  get(_, prop){
    if (typeof prop !== "string") return undefined;
    return loadEntryModuleByKey(prop);
  },
});

export default entryProxy;
`;
};

export const createConfigLoaderCode = (fileIds) => {
  const configLoaderMapLiteral = `\n{\n${fileIds
    .map((fileId) => `  "${fileId}": () => import("./config-chunks/${fileId}.json"),`)
    .join("\n")}\n}`;

  return `// THIS FILE IS GENERATED AUTOMATICALLY
import rootConfig from "./accumbens.config.json";
import chunkManifest from "./accumbens.config.manifest.js";

const configFileLoaders = ${configLoaderMapLiteral};

const loadedFiles = new Set();
const chunkCache = new Map();

export async function loadRootConfig(){
  return rootConfig;
}

async function loadChunkFile(fileId){
  if (!fileId || loadedFiles.has(fileId)) return;
  const loader = configFileLoaders[fileId];
  if (!loader) return;
  const loaded = await loader();
  const payload = loaded.default || loaded;
  const records = Array.isArray(payload) ? payload : [];
  for (const record of records) {
    if (record?.id) {
      chunkCache.set(record.id, record.data);
    }
  }
  loadedFiles.add(fileId);
}

export async function hydrateCategoryNode(category){
  if (!category?.chunk) return category;
  if (chunkCache.has(category.chunk)) {
    return chunkCache.get(category.chunk);
  }
  const fileId = chunkManifest[category.chunk];
  await loadChunkFile(fileId);
  return chunkCache.get(category.chunk) || category;
}

async function hydrateDeep(category){
  const loaded = await hydrateCategoryNode(category);
  const children = loaded?.subcategories || [];
  if (!children.length) return loaded;
  return {
    ...loaded,
    subcategories: await Promise.all(children.map((item) => hydrateDeep(item))),
  };
}

export async function loadFullNavTree(){
  const copy = structuredClone(rootConfig);
  copy.subcategories = await Promise.all((copy.subcategories || []).map((item) => hydrateDeep(item)));
  return copy;
}

export default rootConfig;
`;
};
