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
} from "./helpers.mjs";
import { isConfigQuery } from "./config-helpers.mjs";

export const createCategoryParser = ({
  projectRoot,
  notingRootAbs,
  mode,
  includeContentHash,
  logger,
}) => {
  const uniqueKeys = new Set();
  const warn = (message) => {
    const fullMessage = `[accumbens] ${message}`;
    if (typeof logger?.warn === "function") {
      logger.warn(fullMessage);
      return;
    }
    console.warn(fullMessage);
  };

  const toNoteRelativePath = (absPath) =>
    normalizePath(path.relative(notingRootAbs, absPath));

  const formatCategoryName = (relativeDir) => relativeDir || "/";

  const describeValue = (value) => {
    if (typeof value === "string") return `string ${JSON.stringify(value)}`;
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") {
      const ctorName = value?.constructor?.name;
      return ctorName && ctorName !== "Object" ? ctorName : "object";
    }
    return `${typeof value} ${JSON.stringify(value)}`;
  };

  const resolveCollectionField = async ({
    fieldName,
    value,
    context,
    configAbs,
    relativeDir,
  }) => {
    if (value === undefined || value === null) return [];

    let resolved = value;

    if (typeof resolved === "function") {
      warn(
        `${fieldName} in ${formatCategoryName(
          relativeDir
        )} (${configAbs}): function will be execute at resolve time, and may not have proper 依赖追踪.`
      );
      try {
        resolved = await resolved(context);
      } catch (error) {
        throw new Error(
          `Failed to resolve ${fieldName} function in ${formatCategoryName(
            relativeDir
          )} (${configAbs}): ${error?.message || String(error)}`
        );
      }
    }

    if (isConfigQuery(resolved)) {
      try {
        resolved = await resolved.resolve({
          ...context,
          fieldName,
        });
      } catch (error) {
        throw new Error(
          `Failed to resolve ${fieldName} query in ${formatCategoryName(
            relativeDir
          )} (${configAbs}): ${error?.message || String(error)}`
        );
      }
    }

    if (Array.isArray(resolved)) return resolved;

    warn(
      `${fieldName} in ${formatCategoryName(relativeDir)} (${configAbs}): ${describeValue(
        resolved
      )} is not supported, this field will be ignored.`
    );
    return [];
  };

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
    const configAbs = path.join(categoryDirAbs, "accumbens.config.js");
    const relativeDir = normalizeCategoryPath(toNoteRelativePath(categoryDirAbs));
    let cfg;
    try {
      cfg = await importConfig(configAbs);
    } catch (error) {
      throw new Error(
        `Failed to import config for ${formatCategoryName(relativeDir)} (${configAbs}): ${
          error?.message || String(error)
        }`
      );
    }

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

    const entrySeed = await resolveCollectionField({
      fieldName: "entries",
      value: cfg.entries,
      context,
      configAbs,
      relativeDir,
    });
    const bucketItems = [];

    const toEntryData = async (entryInput, entryIndex) => {
      const isStringEntry = typeof entryInput === "string";
      const filename = isStringEntry ? entryInput : entryInput?.file;
      const entryLocation = `entries[${entryIndex}] in ${formatCategoryName(
        relativeDir
      )} (${configAbs})`;
      if (!filename || typeof filename !== "string") {
        throw new Error(
          `Invalid ${entryLocation}: item must be string or { file: string }`
        );
      }

      const entryAbs = path.resolve(categoryDirAbs, filename);
      const relPath = toNoteRelativePath(entryAbs);
      let content;
      try {
        content = await fs.promises.readFile(entryAbs, "utf-8");
      } catch (error) {
        throw new Error(
          `Failed to read ${entryLocation}, file ${entryAbs}: ${error?.message || String(error)}`
        );
      }

      let matterResult;
      try {
        matterResult = matter(content);
      } catch (error) {
        throw new Error(
          `Failed to parse frontmatter for ${entryLocation}, file ${entryAbs}: ${
            error?.message || String(error)
          }`
        );
      }
      const frontMatter = matterResult.data || {};
      let stat;
      try {
        stat = await fs.promises.stat(entryAbs);
      } catch (error) {
        throw new Error(
          `Failed to stat ${entryLocation}, file ${entryAbs}: ${error?.message || String(error)}`
        );
      }

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

    output.entries = await Promise.all(
      entrySeed.map((entryInput, entryIndex) => toEntryData(entryInput, entryIndex))
    );

    const subcategorySeed = await resolveCollectionField({
      fieldName: "subcategories",
      value: cfg.subcategories,
      context,
      configAbs,
      relativeDir,
    });
    if (Array.isArray(subcategorySeed) && subcategorySeed.length > 0) {
      const parsedSubcategories = [];
      for (let subIndex = 0; subIndex < subcategorySeed.length; subIndex += 1) {
        const sub = subcategorySeed[subIndex];
        const subDirValue = typeof sub === "string" ? sub : sub?.dir;
        const subcategoryLocation = `subcategories[${subIndex}] in ${formatCategoryName(
          relativeDir
        )} (${configAbs})`;
        if (!subDirValue || typeof subDirValue !== "string") {
          throw new Error(
            `Invalid ${subcategoryLocation}: item must be string or { dir: string }`
          );
        }

        const subcategoryAbs = path.resolve(categoryDirAbs, subDirValue);
        const subcategoryConfigAbs = path.join(subcategoryAbs, "accumbens.config.js");
        if (!fs.existsSync(subcategoryConfigAbs)) {
          throw new Error(
            `Missing accumbens.config.js for ${subcategoryLocation}, dir ${subcategoryAbs}: expected ${subcategoryConfigAbs}`
          );
        }

        let parsed;
        try {
          parsed = await parseCategory(subcategoryAbs);
        } catch (error) {
          throw new Error(
            `Failed to parse ${subcategoryLocation}, dir ${subcategoryAbs}: ${
              error?.message || String(error)
            }`
          );
        }
        parsedSubcategories.push(parsed.category);
        bucketItems.push(...parsed.bucketItems);
      }
      output.subcategories = parsedSubcategories;
      output.leaf = false;
    } else {
      output.leaf = true;
    }

    let resolvedIndex;
    try {
      resolvedIndex = await resolveMaybeFunction(cfg.index, context);
    } catch (error) {
      throw new Error(
        `Failed to resolve index in ${formatCategoryName(relativeDir)} (${configAbs}): ${
          error?.message || String(error)
        }`
      );
    }
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
