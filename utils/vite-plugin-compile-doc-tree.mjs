import { compileDocTree } from "../scripts/lib/compile-doc-tree-core.mjs";

const isNoteStructureFile = (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized.includes("/noting/")) return false;
  if (normalized.includes(".accumbens/")) return false;
  return (
    normalized.endsWith(".md") ||
    normalized.endsWith(".mdx") ||
    normalized.endsWith("accumbens.config.js")
  );
};

export default function compileDocTreePlugin() {
  let root = process.cwd();
  let lastRun = Promise.resolve();

  const runCompile = async ({ reason, mode, logger, onAfter }) => {
    lastRun = lastRun.then(async () => {
      const result = await compileDocTree({
        projectRoot: root,
        notingDir: "noting",
        mode,
        includeContentHash: mode === "production",
        maxEntriesPerBucket: 256,
      });
      logger?.info?.(
        `[accumbens] doc tree updated (${reason}) entries=${result.totalEntries}, configChunks=${result.configChunkCount}, entryChunks=${result.entryChunkCount}`,
        { timestamp: true }
      );
      if (typeof onAfter === "function") {
        onAfter(result);
      }
    });
    return lastRun;
  };

  return {
    name: "accumbens-compile-doc-tree",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
    },
    async buildStart() {
      const buildLogger = {
        info: (msg) => this.info(msg),
      };
      await runCompile({ reason: "buildStart", mode: "production", logger: buildLogger });
    },
    configureServer(server) {
      const notifyChangedFiles = (result) => {
        if (!result) return;
        for (const changedFile of result.changedFiles || []) {
          server.watcher.emit("change", changedFile);
        }
        for (const removedFile of result.removedFiles || []) {
          server.watcher.emit("unlink", removedFile);
        }
      };

      runCompile({ reason: "devServerStart", mode: "development", logger: server.config.logger }).catch((error) => {
        server.config.logger.error(`[accumbens] compile-doc-tree failed: ${error.message}`);
      });

      const schedule = (changedPath) => {
        if (!isNoteStructureFile(changedPath)) return;
        runCompile({
          reason: `fs:${changedPath.split("/").pop()}`,
          mode: "development",
          logger: server.config.logger,
          onAfter: notifyChangedFiles,
        }).catch((error) => {
          server.config.logger.error(`[accumbens] compile-doc-tree failed: ${error.message}`);
        });
      };

      server.watcher.on("add", schedule);
      server.watcher.on("unlink", schedule);
      server.watcher.on("change", schedule);
    },
  };
}
