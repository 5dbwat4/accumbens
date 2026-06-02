import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export default function buildInfoPlugin() {
  const virtualModuleId = 'virtual:build-info';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  let gitInfo = { accumbens: { hash: '', url: '', time: '' }, noting: { hash: '', url: '', time: '' } };

  function getGitHash(dir) {
    try {
      return execSync('git rev-parse --short HEAD', { cwd: dir, encoding: 'utf-8' }).trim();
    } catch {
      return '(unknown)';
    }
  }

  function getGitTime(dir) {
    try {
      return execSync('git log -1 --format=%cI', { cwd: dir, encoding: 'utf-8' }).trim();
    } catch {
      return '';
    }
  }

  function getGitHubUrl(dir, hash) {
    try {
      const remote = execSync('git remote get-url origin', { cwd: dir, encoding: 'utf-8' }).trim();
      const match = remote.match(/[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (match) {
        return `https://github.com/${match[1]}/${match[2]}/commit/${hash}`;
      }
    } catch {
      // ignore
    }
    return '';
  }

  function walkDir(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.')) continue;
        results.push(...walkDir(fullPath));
      } else {
        const stat = fs.statSync(fullPath);
        results.push({
          ext: path.extname(entry.name).toLowerCase(),
          size: stat.size,
        });
      }
    }
    return results;
  }

  function computeSizeBreakdown(files) {
    const byExt = {};
    let totalSize = 0;
    for (const file of files) {
      const ext = file.ext || '(none)';
      if (!byExt[ext]) byExt[ext] = { count: 0, size: 0 };
      byExt[ext].count++;
      byExt[ext].size += file.size;
      totalSize += file.size;
    }
    const sorted = Object.entries(byExt)
      .sort((a, b) => b[1].size - a[1].size)
      .map(([ext, data]) => ({ ext, ...data }));
    return { totalSize, totalCount: files.length, byExt: sorted };
  }

  return {
    name: 'build-info',

    buildStart() {
      const root = process.cwd();
      gitInfo.accumbens.hash = getGitHash(root);
      gitInfo.accumbens.url = getGitHubUrl(root, gitInfo.accumbens.hash);
      gitInfo.accumbens.time = getGitTime(root);
      gitInfo.noting.hash = getGitHash(path.join(root, 'noting'));
      gitInfo.noting.url = getGitHubUrl(path.join(root, 'noting'), gitInfo.noting.hash);
      gitInfo.noting.time = getGitTime(path.join(root, 'noting'));
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify({ git: gitInfo })}`;
      }
    },

    closeBundle() {
      const root = process.cwd();
      const distDir = path.join(root, 'dist');

      if (!fs.existsSync(distDir)) return;

      const builtFiles = walkDir(distDir);
      const builtBreakdown = computeSizeBreakdown(builtFiles);
      const sizes = { built: builtBreakdown };

      const notingDir = path.join(root, 'noting');
      if (fs.existsSync(notingDir)) {
        const notingFiles = walkDir(notingDir);
        sizes.noting = computeSizeBreakdown(notingFiles);
      }

      fs.writeFileSync(
        path.join(distDir, 'build-info-sizes.json'),
        JSON.stringify(sizes),
      );
    },
  };
}
