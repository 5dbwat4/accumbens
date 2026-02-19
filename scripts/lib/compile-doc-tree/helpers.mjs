import crypto from "crypto";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export const normalizePath = (input) => input.replace(/\\/g, "/");

export const sha256 = (content) => {
  const hash = crypto.createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
};

export const normalizeCategoryPath = (value) => {
  if (!value || value === ".") return "";
  return normalizePath(value).replace(/\/+$/, "");
};

export const sortByPath = (left, right) =>
  left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });

export const readFileIfExists = async (absPath) => {
  try {
    return await fs.promises.readFile(absPath, "utf-8");
  } catch {
    return null;
  }
};

export const writeFileIfChanged = async (absPath, content, changedFiles) => {
  const previous = await readFileIfExists(absPath);
  if (previous === content) {
    return false;
  }
  await fs.promises.mkdir(path.dirname(absPath), { recursive: true });
  await fs.promises.writeFile(absPath, content, "utf-8");
  changedFiles.push(absPath);
  return true;
};

export const syncFlatDirectory = async (dirAbs, filesMap, changedFiles, removedFiles) => {
  await fs.promises.mkdir(dirAbs, { recursive: true });

  const desiredFileNames = new Set(Object.keys(filesMap));
  const existing = await fs.promises.readdir(dirAbs, { withFileTypes: true });

  for (const [fileName, content] of Object.entries(filesMap)) {
    await writeFileIfChanged(path.join(dirAbs, fileName), content, changedFiles);
  }

  for (const item of existing) {
    if (!item.isFile()) continue;
    if (desiredFileNames.has(item.name)) continue;
    const fullPath = path.join(dirAbs, item.name);
    await fs.promises.unlink(fullPath);
    removedFiles.push(fullPath);
  }
};

export const importConfig = async (configAbsPath) => {
  const cfgUrl = `${pathToFileURL(configAbsPath).href}?t=${Date.now()}-${Math.random()}`;
  const imported = await import(cfgUrl);
  return imported.default || {};
};

export const resolveMaybeFunction = async (value, context) => {
  if (typeof value === "function") {
    return await value(context);
  }
  return value;
};

export const countCategoryWeight = (category) => {
  if (!category || typeof category !== "object") return 0;
  const selfEntries = Array.isArray(category.entries) ? category.entries.length : 0;
  const sub = Array.isArray(category.subcategories)
    ? category.subcategories.reduce((sum, item) => sum + countCategoryWeight(item), 0)
    : 0;
  return selfEntries + sub;
};

export const toCategoryRef = (category, chunkId) => ({
  path: category.path,
  show: category.show,
  name: category.name,
  leaf: category.leaf,
  index: category.index,
  chunk: chunkId,
});
