import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DOC_EXTENSIONS = new Set([".md", ".mdx"]);
const GENERATED_STATS_FILES = new Set(["accumbens-stats.json", "build-info-sizes.json"]);
const IGNORED_SOURCE_DIRS = new Set([
  ".git",
  ".accumbens",
  ".obsidian",
  "node_modules",
]);

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const notingDir = path.join(projectRoot, "noting");
const outputPath = path.join(distDir, "accumbens-stats.json");

const statsStartTime = process.hrtime.bigint();
let documentGitInfoMatched = 0;
let documentGitInfoMs = 0;

function elapsedMs(startTime) {
  return Number(process.hrtime.bigint() - startTime) / 1_000_000;
}

function formatMs(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

function logStep(message, startTime) {
  console.log(`[accumbens-stats] ${message} (${formatMs(elapsedMs(startTime))})`);
}

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function runGit(cwd, args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function getGitHubUrl(dir, hash) {
  const remote = runGit(dir, ["remote", "get-url", "origin"]);
  const match = remote.match(/[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match || !hash) return "";
  return `https://github.com/${match[1]}/${match[2]}/commit/${hash}`;
}

function getRepoInfo(dir) {
  const stepStart = process.hrtime.bigint();
  const fullHash = runGit(dir, ["rev-parse", "HEAD"]);
  const hash = runGit(dir, ["rev-parse", "--short", "HEAD"]);
  const time = runGit(dir, ["log", "-1", "--format=%cI"]);

  const info = {
    hash: hash || "(unknown)",
    fullHash,
    time,
    url: getGitHubUrl(dir, fullHash || hash),
  };
  logStep(`git info ${toPosix(path.relative(projectRoot, dir)) || "."}`, stepStart);
  return info;
}

function walkFiles(rootDir, options = {}) {
  const excludeDirs = options.excludeDirs || new Set();
  const files = [];
  const stack = [rootDir];

  if (!fs.existsSync(rootDir)) return files;

  while (stack.length > 0) {
    const currentDir = stack.pop();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const absPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!excludeDirs.has(entry.name)) {
          stack.push(absPath);
        }
        continue;
      }

      if (!entry.isFile()) continue;

      const stat = fs.statSync(absPath);
      const relPath = toPosix(path.relative(rootDir, absPath));

      files.push({
        absPath,
        path: relPath,
        ext: path.extname(entry.name).toLowerCase() || "(none)",
        size: stat.size,
      });
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function summarizeFiles(files) {
  const byExtMap = new Map();
  let totalSize = 0;

  for (const file of files) {
    totalSize += file.size;
    const current = byExtMap.get(file.ext) || { ext: file.ext, count: 0, size: 0 };
    current.count += 1;
    current.size += file.size;
    byExtMap.set(file.ext, current);
  }

  return {
    count: files.length,
    size: totalSize,
    byExt: [...byExtMap.values()].sort((a, b) => b.size - a.size),
  };
}

function classifyBuildFile(file) {
  const fileName = path.posix.basename(file.path);
  const isCodeArtifact = file.ext === ".js" || file.ext === ".css";

  if (file.path.startsWith("assets/") && fileName.startsWith("neuron.")) {
    return isCodeArtifact ? "neuron" : "neuronAssets";
  }

  if (file.path.startsWith("assets/")) {
    return "myelin";
  }

  return "other";
}

function sumBuildGroupByExt(files, groupName) {
  return summarizeFiles(files.filter((file) => classifyBuildFile(file) === groupName)).byExt;
}

function summarizeBuild(files) {
  const groups = {
    total: { count: files.length, size: 0 },
    neuron: { count: 0, size: 0 },
    neuronAssets: { count: 0, size: 0 },
    myelin: { count: 0, size: 0 },
    other: { count: 0, size: 0 },
  };

  for (const file of files) {
    const group = classifyBuildFile(file);
    groups.total.size += file.size;
    groups[group].count += 1;
    groups[group].size += file.size;
  }

  return {
    ...groups,
    byExt: summarizeFiles(files).byExt,
    neuronByExt: sumBuildGroupByExt(files, "neuron"),
    neuronAssetsByExt: sumBuildGroupByExt(files, "neuronAssets"),
  };
}

function splitLines(content) {
  if (!content) return [];
  return content.split(/\r\n|\r|\n/);
}

function stripMarkdownSyntax(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^import\s.+$/gm, " ")
    .replace(/^export\s.+$/gm, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, " ")
    .replace(/[#>*_\-[\]{}()|:=+~]/g, " ");
}

function countWords(content) {
  const plain = stripMarkdownSyntax(content);
  const cjkMatches =
    plain.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu) || [];
  const withoutCjk = plain.replace(
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
    " "
  );
  const wordMatches = withoutCjk.match(/[A-Za-z0-9]+(?:['_-][A-Za-z0-9]+)*/g) || [];
  return cjkMatches.length + wordMatches.length;
}

function analyzeDocumentContent(content) {
  const lines = splitLines(content);
  const textLines = [];
  let codeBlockLines = 0;
  let inCodeFence = false;
  let fenceMarker = "";
  let inFrontmatter = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (index === 0 && trimmed === "---") {
      inFrontmatter = true;
      continue;
    }

    if (inFrontmatter) {
      if (index > 0 && trimmed === "---") {
        inFrontmatter = false;
      }
      continue;
    }

    const fenceMatch = trimmed.match(/^(```+|~~~+)/);

    if (inCodeFence) {
      if (trimmed.startsWith(fenceMarker)) {
        inCodeFence = false;
        fenceMarker = "";
      } else {
        codeBlockLines += 1;
      }
      continue;
    }

    if (fenceMatch) {
      inCodeFence = true;
      fenceMarker = fenceMatch[1];
      continue;
    }

    textLines.push(line);
  }

  return {
    lines: lines.length,
    codeBlockLines,
    words: countWords(textLines.join("\n")),
  };
}

function extractTitle(content) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const titleLine = frontmatterMatch[1]
      .split(/\r\n|\r|\n/)
      .find((line) => line.trim().startsWith("title:"));
    if (titleLine) {
      return titleLine
        .replace(/^title:\s*/, "")
        .replace(/^["']|["']$/g, "")
        .trim();
    }
  }

  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].replace(/[#*_`]/g, "").trim();
  }

  return "";
}

function parseCommitHeader(line) {
  const parts = line.split("\t");
  if (parts.length < 2) return null;
  const [hash, updatedAt] = parts;
  if (!/^[0-9a-f]{7,40}$/i.test(hash) || !updatedAt) return null;

  return {
    hash,
    shortHash: hash.slice(0, 7),
    updatedAt,
  };
}

function buildDocumentGitInfoMap(documents) {
  const stepStart = process.hrtime.bigint();
  const wantedDocs = new Set(documents.map((file) => file.path));
  const latestByFile = new Map();

  if (wantedDocs.size === 0) return latestByFile;

  let output = "";
  try {
    output = execFileSync(
      "git",
      ["log", "--name-only", "--format=%H%x09%cI", "--", ...wantedDocs],
      {
        cwd: notingDir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        maxBuffer: 256 * 1024 * 1024,
      }
    );
  } catch {
    output = "";
  }

  let currentCommit = null;

  for (const rawLine of output.split(/\r\n|\r|\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const commit = parseCommitHeader(line);
    if (commit) {
      currentCommit = commit;
      continue;
    }

    const filePath = toPosix(line);
    if (!currentCommit || !wantedDocs.has(filePath) || latestByFile.has(filePath)) continue;

    latestByFile.set(filePath, currentCommit);
    if (latestByFile.size === wantedDocs.size) break;
  }

  documentGitInfoMatched = latestByFile.size;
  documentGitInfoMs = elapsedMs(stepStart);
  logStep(`document git log batch files=${wantedDocs.size}, matched=${latestByFile.size}`, stepStart);
  return latestByFile;
}

function loadJsonIfExists(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function normalizeRoutePart(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function joinRoute(categoryPath, entryPath) {
  const parts = [categoryPath, entryPath].map(normalizeRoutePart).filter(Boolean);
  return `/${parts.join("/")}`;
}

function loadEntryPathMap() {
  const entryChunkDir = path.join(notingDir, ".accumbens", "entry-chunks");
  const entryPathByKey = new Map();

  if (!fs.existsSync(entryChunkDir)) return entryPathByKey;

  for (const file of fs.readdirSync(entryChunkDir)) {
    if (!file.endsWith(".js")) continue;
    const content = fs.readFileSync(path.join(entryChunkDir, file), "utf8");
    const entryPattern = /"([^"]+)":\s*\(\)\s*=>\s*import\("\.\.\/\.\.\/([^"]+)"\)/g;
    let match = entryPattern.exec(content);

    while (match) {
      entryPathByKey.set(match[1], toPosix(match[2]));
      match = entryPattern.exec(content);
    }
  }

  return entryPathByKey;
}

function loadConfigChunkMap() {
  const configChunkDir = path.join(notingDir, ".accumbens", "config-chunks");
  const configByChunkId = new Map();

  if (!fs.existsSync(configChunkDir)) return configByChunkId;

  for (const file of fs.readdirSync(configChunkDir)) {
    if (!file.endsWith(".json")) continue;
    const records = loadJsonIfExists(path.join(configChunkDir, file));
    if (!Array.isArray(records)) continue;

    for (const record of records) {
      if (record?.id && record?.data) {
        configByChunkId.set(record.id, record.data);
      }
    }
  }

  return configByChunkId;
}

function buildDocumentRouteMap() {
  const stepStart = process.hrtime.bigint();
  const rootConfig = loadJsonIfExists(path.join(notingDir, ".accumbens", "accumbens.config.json"));
  const entryPathByKey = loadEntryPathMap();
  const configByChunkId = loadConfigChunkMap();
  const routeByDocumentPath = new Map();

  if (!rootConfig) {
    logStep("route map skipped: missing .accumbens config", stepStart);
    return routeByDocumentPath;
  }

  const hydrateCategory = (category) => {
    if (category?.chunk && configByChunkId.has(category.chunk)) {
      return configByChunkId.get(category.chunk);
    }
    return category;
  };

  const visitCategory = (categoryRef) => {
    const category = hydrateCategory(categoryRef);
    if (!category) return;

    for (const entry of category.entries || []) {
      const relPath = entryPathByKey.get(entry.unikey);
      if (!relPath) continue;
      routeByDocumentPath.set(relPath, joinRoute(category.path, entry.path));
    }

    for (const child of category.subcategories || []) {
      visitCategory(child);
    }
  };

  visitCategory(rootConfig);
  logStep(
    `route map entries=${routeByDocumentPath.size}, entryKeys=${entryPathByKey.size}, configChunks=${configByChunkId.size}`,
    stepStart
  );
  return routeByDocumentPath;
}

function analyzeDocuments(sourceFiles) {
  const stepStart = process.hrtime.bigint();
  const documents = sourceFiles.filter((file) => DOC_EXTENSIONS.has(file.ext));
  const routeByDocumentPath = buildDocumentRouteMap();
  const gitInfoByDocumentPath = buildDocumentGitInfoMap(documents);
  const analyzed = [];
  let totalLines = 0;
  let totalWords = 0;
  let codeBlockLines = 0;
  let totalSize = 0;

  for (const file of documents) {
    const fileStart = process.hrtime.bigint();
    let content = "";
    try {
      content = fs.readFileSync(file.absPath, "utf8");
    } catch {
      content = "";
    }

    const contentStats = analyzeDocumentContent(content);
    const git = gitInfoByDocumentPath.get(file.path) || { hash: "", shortHash: "", updatedAt: "" };
    const routePath = routeByDocumentPath.get(file.path);
    const item = {
      path: file.path,
      title: extractTitle(content),
      size: file.size,
      lines: contentStats.lines,
      words: contentStats.words,
      codeBlockLines: contentStats.codeBlockLines,
      updatedAt: git.updatedAt,
      hash: git.shortHash,
      fullHash: git.hash,
    };

    if (routePath) {
      item.routePath = routePath;
    }

    totalLines += item.lines;
    totalWords += item.words;
    codeBlockLines += item.codeBlockLines;
    totalSize += item.size;
    analyzed.push(item);

    const fileMs = elapsedMs(fileStart);
    if (fileMs >= 250) {
      console.log(`[accumbens-stats] slow doc ${file.path} (${formatMs(fileMs)})`);
    }
  }

  const sortStart = process.hrtime.bigint();
  const topSize = [...analyzed].sort((a, b) => b.size - a.size).slice(0, 10);
  const recentlyUpdated = [...analyzed]
    .filter((item) => item.updatedAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);
  logStep("document rankings", sortStart);
  console.log(
    `[accumbens-stats] document git log matched=${documentGitInfoMatched}/${documents.length}, total=${formatMs(
      documentGitInfoMs
    )}`
  );
  logStep(`documents analyzed count=${documents.length}`, stepStart);

  return {
    totalFiles: documents.length,
    totalSize,
    totalLines,
    totalWords,
    codeBlockLines,
    topSize,
    recentlyUpdated,
  };
}

if (!fs.existsSync(distDir)) {
  console.error("[accumbens-stats] dist directory does not exist. Run vite build first.");
  process.exitCode = 1;
} else {
  const walkBuildStart = process.hrtime.bigint();
  const buildFiles = walkFiles(distDir).filter((file) => !GENERATED_STATS_FILES.has(file.path));
  logStep(`walk dist files=${buildFiles.length}`, walkBuildStart);

  const walkSourceStart = process.hrtime.bigint();
  const sourceFiles = walkFiles(notingDir, { excludeDirs: IGNORED_SOURCE_DIRS });
  logStep(`walk noting files=${sourceFiles.length}`, walkSourceStart);

  const buildSummaryStart = process.hrtime.bigint();
  const buildSummary = summarizeBuild(buildFiles);
  logStep("summarize build files", buildSummaryStart);

  const sourceSummaryStart = process.hrtime.bigint();
  const sourceSummary = summarizeFiles(sourceFiles);
  logStep("summarize source files", sourceSummaryStart);

  const docsStart = process.hrtime.bigint();
  const docsSummary = analyzeDocuments(sourceFiles);
  logStep("summarize documents", docsStart);

  const stats = {
    generatedAt: new Date().toISOString(),
    git: {
      accumbens: getRepoInfo(projectRoot),
      noting: getRepoInfo(notingDir),
    },
    build: buildSummary,
    source: sourceSummary,
    docs: docsSummary,
  };

  const writeStart = process.hrtime.bigint();
  fs.writeFileSync(outputPath, `${JSON.stringify(stats, null, 2)}\n`);
  logStep("write accumbens-stats.json", writeStart);
  console.log(`[accumbens-stats] wrote ${toPosix(path.relative(projectRoot, outputPath))}`);
  logStep("total", statsStartTime);
}
