import fs from "fs";
import path from "path";
import matter from "gray-matter";
import wordcount from "word-count";
import {
  importConfig,
  normalizeCategoryPath,
  normalizePath,
  resolveMaybeFunction,
  sha256,
  sortByPath,
} from "./helpers.mjs";

export const createCategoryParser = ({
  projectRoot,
  notingRootAbs,
  mode,
  includeContentHash,
}) => {
  const uniqueKeys = new Set();

  const toNoteRelativePath = (absPath) =>
    normalizePath(path.relative(notingRootAbs, absPath));

  const ensureUniqueKey = (seedKey, relPath) => {
    if (!uniqueKeys.has(seedKey)) {
      uniqueKeys.add(seedKey);
      return seedKey;
    }
    let index = 1;
    while (index <= 10_000) {
      const candidate = `${seedKey}~${index}`;
      if (!uniqueKeys.has(candidate)) {
        uniqueKeys.add(candidate);
        return candidate;
      }
      index += 1;
    }
    const fallback = sha256(`${seedKey}:${relPath}:${Date.now()}`);
    uniqueKeys.add(fallback);
    return fallback;
  };

  const parseCategory = async (categoryDirAbs) => {
    const cfg = await importConfig(path.join(categoryDirAbs, "accumbens.config.js"));
    const relativeDir = normalizeCategoryPath(toNoteRelativePath(categoryDirAbs));

    const context = {
      mode,
      includeContentHash,
      categoryDirAbs,
      categoryDir: relativeDir,
      projectRoot,
      notingRootAbs,
      fs,
      path,
    };

    const output = {
      path: normalizeCategoryPath(typeof cfg.path === "string" ? cfg.path : relativeDir),
      show: cfg.show === undefined ? true : Boolean(cfg.show),
      name: cfg.name || (relativeDir ? path.basename(relativeDir) : "ROOT"),
    };

    const entrySeed = await resolveMaybeFunction(cfg.entries, context);
    const bucketItems = [];

    const toEntryData = async (entryInput) => {
      const isStringEntry = typeof entryInput === "string";
      const filename = isStringEntry ? entryInput : entryInput?.file;
      if (!filename || typeof filename !== "string") {
        throw new Error(
          `Invalid entry in ${relativeDir || "/"}: entries item must be string or { file: string }`
        );
      }

      const entryAbs = path.resolve(categoryDirAbs, filename);
      const relPath = toNoteRelativePath(entryAbs);
      const content = await fs.promises.readFile(entryAbs, "utf-8");
      const matterResult = matter(content);
      const frontMatter = matterResult.data || {};
      const stat = await fs.promises.stat(entryAbs);

      const stableKey = ensureUniqueKey(sha256(relPath).slice(0, 24), relPath);
      const entryPath =
        !isStringEntry && typeof entryInput.path === "string"
          ? entryInput.path
          : path.basename(relPath).replace(/\.mdx?$/i, "");

      const entryData = {
        title: (!isStringEntry && entryInput.title) || frontMatter.title || "",
        updatedAt: new Date(
          (!isStringEntry && entryInput.updatedAt) || frontMatter.updatedAt || stat.mtime
        ).getTime(),
        wordcount: wordcount(matterResult.content || ""),
        unikey: stableKey,
        pathonly:
          (!isStringEntry && entryInput.pathonly) ||
          frontMatter.pathonly ||
          filename === "index.md" ||
          filename === "index.mdx",
        path: entryPath,
      };

      if (includeContentHash) {
        entryData.sha256 = sha256(content);
      }

      bucketItems.push({
        unikey: stableKey,
        relPath,
        categoryPath: output.path,
      });

      return entryData;
    };

    if (entrySeed === "auto") {
      const files = await fs.promises.readdir(categoryDirAbs);
      const autoEntries = files.filter((name) => /\.mdx?$/i.test(name)).sort(sortByPath);
      output.entries = await Promise.all(autoEntries.map(toEntryData));
    } else if (Array.isArray(entrySeed)) {
      output.entries = await Promise.all(entrySeed.map(toEntryData));
    } else {
      output.entries = [];
    }

    const subcategorySeed = await resolveMaybeFunction(cfg.subcategories, context);
    if (Array.isArray(subcategorySeed) && subcategorySeed.length > 0) {
      const parsedSubcategories = [];
      for (const sub of subcategorySeed) {
        const subDirValue = typeof sub === "string" ? sub : sub?.dir;
        if (!subDirValue || typeof subDirValue !== "string") {
          throw new Error(
            `Invalid subcategory in ${relativeDir || "/"}: subcategories item must be string or { dir: string }`
          );
        }

        const subcategoryAbs = path.resolve(categoryDirAbs, subDirValue);
        const subcategoryConfigAbs = path.join(subcategoryAbs, "accumbens.config.js");
        if (!fs.existsSync(subcategoryConfigAbs)) {
          throw new Error(`Missing accumbens.config.js in subcategory: ${subcategoryAbs}`);
        }

        const parsed = await parseCategory(subcategoryAbs);
        parsedSubcategories.push(parsed.category);
        bucketItems.push(...parsed.bucketItems);
      }
      output.subcategories = parsedSubcategories;
      output.leaf = false;
    } else {
      output.leaf = true;
    }

    const resolvedIndex = await resolveMaybeFunction(cfg.index, context);
    if (resolvedIndex && typeof resolvedIndex === "string") {
      const matched = output.entries.find((item) => {
        if (resolvedIndex === item.unikey) return true;
        if (resolvedIndex === item.path) return true;
        const md = `${item.path}.md`;
        const mdx = `${item.path}.mdx`;
        return resolvedIndex === md || resolvedIndex === mdx;
      });
      if (matched) {
        output.index = matched.unikey;
      }
    }

    if (!output.index) {
      const fallback = output.entries.find((item) => item.path === "index" || item.pathonly);
      if (fallback) {
        output.index = fallback.unikey;
      }
    }

    return {
      category: output,
      bucketItems,
    };
  };

  return {
    parseCategory,
  };
};
