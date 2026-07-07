import path from "path";
import { normalizePath, sortByPath } from "./helpers.mjs";

export const ACCUMBENS_CONFIG_QUERY = Symbol.for("accumbens.config.query");

const IGNORED_DIRS = new Set([".accumbens", ".git", ".obsidian", "node_modules"]);

const isMarkdownFile = (name) => /\.mdx?$/i.test(name);

const toEntryPath = (relPath) => relPath.replace(/\.mdx?$/i, "");

const readDirSorted = async (fsLike, dirAbs) => {
  const items = await fsLike.promises.readdir(dirAbs, { withFileTypes: true });
  return items.sort((left, right) => sortByPath(left.name, right.name));
};

const existsFile = async (fsLike, fileAbs) => {
  try {
    const stat = await fsLike.promises.stat(fileAbs);
    return stat.isFile();
  } catch {
    return false;
  }
};

const applySteps = (items, steps, ctx) => {
  let output = [...items];

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    try {
      if (step.type === "filter") {
        output = output.filter((item) => step.predicate(item, ctx));
      } else if (step.type === "map") {
        output = output.map((item) => step.projector(item, ctx));
      } else if (step.type === "sort") {
        output = output.slice().sort((left, right) => step.compare(left, right, ctx));
      } else {
        throw new Error(`unknown query step ${JSON.stringify(step.type)}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to apply ${step.type} step #${index + 1}: ${error?.message || String(error)}`
      );
    }
  }

  return output;
};

const ensureStepFunction = (fn, stepName) => {
  if (typeof fn !== "function") {
    throw new TypeError(`Config query .${stepName}() expects a function`);
  }
};

const collectContentFiles = async (ctx, { recursive }) => {
  const results = [];

  const scan = async (dirAbs, relDir = "") => {
    let items;
    try {
      items = await readDirSorted(ctx.fs, dirAbs);
    } catch (error) {
      throw new Error(`Failed to read directory ${dirAbs}: ${error?.message || String(error)}`);
    }

    for (const item of items) {
      if (IGNORED_DIRS.has(item.name)) continue;

      const itemAbs = path.join(dirAbs, item.name);
      const relPath = normalizePath(relDir ? path.join(relDir, item.name) : item.name);

      if (item.isDirectory()) {
        if (recursive) {
          await scan(itemAbs, relPath);
        }
        continue;
      }

      if (!item.isFile() || !isMarkdownFile(item.name)) continue;

      results.push({
        file: relPath,
        path: toEntryPath(relPath),
      });
    }
  };

  await scan(ctx.categoryDirAbs);
  return results.sort((left, right) => sortByPath(left.file, right.file));
};

const collectSubfoldersWithConfig = async (ctx) => {
  const results = [];

  const scan = async (dirAbs, relDir = "") => {
    let items;
    try {
      items = await readDirSorted(ctx.fs, dirAbs);
    } catch (error) {
      throw new Error(`Failed to read directory ${dirAbs}: ${error?.message || String(error)}`);
    }

    for (const item of items) {
      if (!item.isDirectory() || IGNORED_DIRS.has(item.name)) continue;

      const subdirAbs = path.join(dirAbs, item.name);
      const subdirRel = normalizePath(relDir ? path.join(relDir, item.name) : item.name);

      if (await existsFile(ctx.fs, path.join(subdirAbs, "accumbens.config.js"))) {
        results.push(`./${subdirRel}`);
      }

      await scan(subdirAbs, subdirRel);
    }
  };

  await scan(ctx.categoryDirAbs);
  return results.sort(sortByPath);
};

const resolveBaseQuery = async (kind, ctx) => {
  if (kind === "entries:auto-content-files") {
    return collectContentFiles(ctx, { recursive: false });
  }

  if (kind === "entries:auto-all-content-file") {
    return collectContentFiles(ctx, { recursive: true });
  }

  if (kind === "subcategories:all-subfolders-with-config") {
    return collectSubfoldersWithConfig(ctx);
  }

  throw new Error(`Unsupported config query kind ${JSON.stringify(kind)}`);
};

export class ConfigQuery {
  constructor(kind, steps = []) {
    this[ACCUMBENS_CONFIG_QUERY] = true;
    this.kind = kind;
    this.steps = steps;
  }

  filter(predicate) {
    ensureStepFunction(predicate, "filter");
    return new ConfigQuery(this.kind, [
      ...this.steps,
      { type: "filter", predicate },
    ]);
  }

  map(projector) {
    ensureStepFunction(projector, "map");
    return new ConfigQuery(this.kind, [
      ...this.steps,
      { type: "map", projector },
    ]);
  }

  sort(compare) {
    ensureStepFunction(compare, "sort");
    return new ConfigQuery(this.kind, [
      ...this.steps,
      { type: "sort", compare },
    ]);
  }

  async resolve(ctx) {
    const items = await resolveBaseQuery(this.kind, ctx);
    return applySteps(items, this.steps, ctx);
  }
}

export const isConfigQuery = (value) =>
  Boolean(value?.[ACCUMBENS_CONFIG_QUERY] && typeof value.resolve === "function");

export const autoContentFiles = () => new ConfigQuery("entries:auto-content-files");

export const autoAllContentFile = () => new ConfigQuery("entries:auto-all-content-file");

export const autoAllContentFiles = autoAllContentFile;

export const allSubfoldersWithAccumbensConfig = () =>
  new ConfigQuery("subcategories:all-subfolders-with-config");
