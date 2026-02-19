import { compileDocTree } from "./lib/compile-doc-tree-core.mjs";

const result = await compileDocTree({
  projectRoot: process.cwd(),
  notingDir: "noting",
});

console.log(
  `[compile-doc-tree] entries=${result.totalEntries}, configChunks=${result.configChunkCount}, entryChunks=${result.entryChunkCount}`
);
