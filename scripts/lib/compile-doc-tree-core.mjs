import fs from "fs";
import path from "path";
import { createConfigLoaderCode, createEntryLoaderCode } from "./compile-doc-tree/loaders.mjs";
import { buildConfigChunks, buildEntrySegments, packSegmentsIntoFiles } from "./compile-doc-tree/packing.mjs";
import { createCategoryParser } from "./compile-doc-tree/parser.mjs";
import { sortByPath, syncFlatDirectory, writeFileIfChanged } from "./compile-doc-tree/helpers.mjs";

export async function compileDocTree(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const notingDir = options.notingDir || "noting";
  const mode = options.mode || "production";
  const includeContentHash =
    options.includeContentHash === undefined
      ? mode === "production"
      : Boolean(options.includeContentHash);

  const maxItemsPerFile = Math.max(1, Number(options.maxEntriesPerBucket || 256));

  const notingRootAbs = path.resolve(projectRoot, notingDir);
  const outputRootAbs = path.join(notingRootAbs, ".accumbens");
  const configChunkDirAbs = path.join(outputRootAbs, "config-chunks");
  const entryChunkDirAbs = path.join(outputRootAbs, "entry-chunks");

  const rootConfigAbs = path.join(notingRootAbs, "accumbens.config.js");
  if (!fs.existsSync(rootConfigAbs)) {
    throw new Error(`Cannot find root config: ${rootConfigAbs}`);
  }

  const changedFiles = [];
  const removedFiles = [];

  const parser = createCategoryParser({
    projectRoot,
    notingRootAbs,
    mode,
    includeContentHash,
  });

  const parsedRoot = await parser.parseCategory(notingRootAbs);
  const fullConfig = parsedRoot.category;

  await fs.promises.mkdir(outputRootAbs, { recursive: true });
  await fs.promises.mkdir(configChunkDirAbs, { recursive: true });
  await fs.promises.mkdir(entryChunkDirAbs, { recursive: true });

  const { rootConfig, chunkSegments: configSegments } = buildConfigChunks({
    fullConfig,
    maxChunkWeight: maxItemsPerFile,
  });

  await writeFileIfChanged(
    path.join(outputRootAbs, "accumbens.config.json"),
    `${JSON.stringify(rootConfig, null, 2)}\n`,
    changedFiles
  );

  const packedConfigFiles = packSegmentsIntoFiles({
    segments: configSegments,
    maxPerFile: maxItemsPerFile,
    filePrefix: "cat",
  });

  const configChunkFiles = {};
  const configChunkManifest = {};

  for (const file of packedConfigFiles) {
    const records = file.segments.map((segment) => ({
      id: segment.id,
      data: segment.data,
    }));

    for (const segment of file.segments) {
      configChunkManifest[segment.id] = file.id;
    }

    configChunkFiles[`${file.id}.json`] = `${JSON.stringify(records, null, 2)}\n`;
  }

  await syncFlatDirectory(configChunkDirAbs, configChunkFiles, changedFiles, removedFiles);

  await writeFileIfChanged(
    path.join(outputRootAbs, "accumbens.config.manifest.js"),
    `// THIS FILE IS GENERATED AUTOMATICALLY\nexport default ${JSON.stringify(
      configChunkManifest,
      null,
      2
    )};\n`,
    changedFiles
  );

  await writeFileIfChanged(
    path.join(outputRootAbs, "accumbens.config.js"),
    createConfigLoaderCode(packedConfigFiles.map((item) => item.id).sort(sortByPath)),
    changedFiles
  );

  const entrySegments = buildEntrySegments({
    bucketItems: parsedRoot.bucketItems,
    maxEntriesPerChunk: maxItemsPerFile,
  });

  const packedEntryFiles = packSegmentsIntoFiles({
    segments: entrySegments,
    maxPerFile: maxItemsPerFile,
    filePrefix: "entry",
  });

  const entryChunkFiles = {};
  const entryManifest = {};

  for (const file of packedEntryFiles) {
    const lines = [];

    for (const segment of file.segments) {
      for (const item of segment.entries) {
        entryManifest[item.unikey] = file.id;
        lines.push(`  "${item.unikey}": () => import("../../${item.relPath}"),`);
      }
    }

    entryChunkFiles[`${file.id}.js`] = `// THIS FILE IS GENERATED AUTOMATICALLY\nexport default {\n${lines.join(
      "\n"
    )}\n};\n`;
  }

  await syncFlatDirectory(entryChunkDirAbs, entryChunkFiles, changedFiles, removedFiles);

  await writeFileIfChanged(
    path.join(outputRootAbs, "accumbens.entries.manifest.js"),
    `// THIS FILE IS GENERATED AUTOMATICALLY\nexport default ${JSON.stringify(
      entryManifest,
      null,
      2
    )};\n`,
    changedFiles
  );

  await writeFileIfChanged(
    path.join(outputRootAbs, "accumbens.entries.js"),
    createEntryLoaderCode(packedEntryFiles.map((item) => item.id).sort(sortByPath)),
    changedFiles
  );

  if (typeof options.onCompiled === "function") {
    options.onCompiled({
      totalEntries: parsedRoot.bucketItems.length,
      configChunkCount: packedConfigFiles.length,
      entryChunkCount: packedEntryFiles.length,
      changedFiles,
      removedFiles,
    });
  }

  return {
    totalEntries: parsedRoot.bucketItems.length,
    configChunkCount: packedConfigFiles.length,
    entryChunkCount: packedEntryFiles.length,
    changedFiles,
    removedFiles,
    includeContentHash,
    maxEntriesPerBucket: maxItemsPerFile,
  };
}
