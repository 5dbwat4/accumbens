const arg_doc_path = process.argv[2] || ".";

//----------------------------------------------

import fs from "node:fs";
import YAML from "js-yaml";
import { createHash, KeyObject } from "node:crypto";
import matter from "gray-matter";

// Structure:
// - /config.yml
// - /<category>/config.yml
// - /<category>/<subcategory>/.../config.yml
// In each config.yml:
// Case 1: Leaf catecory
// - leaf: true
// - title: <title>
// - aliases: [<key>]
// - nav: [{<key>: <filename>}, ...]
// All md files under such folder will be considered as a page of such category,
// and those in the nav will be shown.
// Case 2: Non-leaf category
// - leaf: false
// - title: <title>
// - aliases: [<key>]
// We assume that non-leaf category will have AT MOST 1 md file,
// which will be used as the index page of such category, and named index.md
// - sub: [<key>, ...]
// For those md file not associated with any category, they will be:
//    - able to view by direct access (/path/to/file -> /path/to/file.md)
//    - have a hash value for cache control
//    - and the hash value is saved in a file named ./md-integrity.json

// Utils

const loadConfigYML = (path) => YAML.load(fs.readFileSync(path, "utf-8"));

const hashContent = (content) => {
  const hash = createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
};

const hashFile = (path) => hashContent(fs.readFileSync(path, "utf-8"));

const generateFilepathsFromStar = (path) => {
  return fs
    .readdirSync(path)
    .filter((pred) => fs.statSync(`${path}/${pred}`).isDirectory());
};

// Step 1: Load all config.yml files recursively

/**
 * @typedef {Object} Config of navigation
 *
 * The config of navigation is a tree structure, with each node representing a category.
 *
 * Example:
 * [
 * {
 *      "key": "category1",
 *     "leaf": true,
 *    "title": "Category 1",
 *  "aliases": ["route1", "route2"],
 *      "nav": [
 *         {key:"file1",filename: "file1.md",...},
 *    ]
 * },
 * {
 *     "key": "category2",
 *    "leaf": false,
 *   "title": "Category 2",
 *  "aliases": ["route3"],
 * "index_file": true,
 *    "sub": {
 *           ...
 * }
 * ]
 */

if (fs.existsSync("./.accumbens")) {
  fs.rmSync("./.accumbens", { recursive: true });
}
fs.mkdirSync("./.accumbens/assets", { recursive: true });

let HandledFiles = [];
let MdIntegrity = {},
  AssetsIntegrity = {};
const resolveMdContent = (data, content, hash, path) => {
  const buf = {
    title: data.title || "Untitled",
    createAt: new Date(data.createAt || fs.statSync(path).birthtime).getTime(),
    updateAt: new Date(data.updateAt || fs.statSync(path).mtime).getTime(),
    content: content.replace(/\r\n/g, "\n"),
    root: path,
  };
  fs.writeFileSync("./.accumbens/assets/" + hash, JSON.stringify(buf));
  MdIntegrity[path.replace(".md", "")] = hash;
  HandledFiles.push(path);
  return;
};

const resolveMdFile = (path) => {
  const file = fs.readFileSync(path, "utf-8");
  const { data, content } = matter(file);
  const hash = hashContent(file);
  resolveMdContent(data, content, hash, path);
  return hash;
};

const resolveMdFileToConfig = (path) => {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  const file = fs.readFileSync(path, "utf-8");
  const { data, content } = matter(file);
  const hash = hashContent(file);
  resolveMdContent(data, content, hash, path);
  return {
    title: data.title || "Untitled",
    createAt: new Date(data.createAt || fs.statSync(path).birthtime).getTime(),
    updateAt: new Date(data.updateAt || fs.statSync(path).mtime).getTime(),
    hash,
  };
};

const resolveNonLeafCategory = (path, config) => {
  const sub = (
    config.sub === "*" ? generateFilepathsFromStar(path) : config.sub
  ).map((ov) => {
    return resolveConfig(`${path}/${ov}`);
  });
  return {
    key: config.key,
    title: config.title,
    aliases: config.aliases,
    leaf: false,
    index_file: fs.existsSync(path + "/index.md")
      ? resolveMdFile(path + "/index.md")
      : null,
    sub,
  };
};

const resolveLeafCategory = (path, config) => {
  const nav = config.nav === '*' ?
    fs.readdirSync(path).filter(o => fs.statSync(`${path}/${o}`).isDirectory() && o.endsWith('.md'))
      .map(v => v.slice(0, v.length - 3))
    : config.nav
  return {
    key: config.key,
    title: config.title,
    aliases: config.aliases,
    leaf: true,
    nav: nav.map((ov) => {
      if (typeof ov === "string") {
        return {
          key: ov,
          ...resolveMdFileToConfig(`${path}/${ov}.md`),
        };
      } else {
        const ob = Object.entries(ov)[0];
        return {
          key: ob[0],
          ...resolveMdFileToConfig(`${path}/${ob[1]}`),
        };
      }
    }),
  };
};

const resolveConfig = (path) => {
  const config = loadConfigYML(`${path}/config.yml`);
  if (!config.leaf) {
    return resolveNonLeafCategory(path, config);
  } else {
    return resolveLeafCategory(path, config);
  }
};

// console.log(arg_doc_path,`${arg_doc_path}/config.yml`,loadConfigYML(`${arg_doc_path}/config.yml`));

const config = loadConfigYML(`config.yml`).categories.map(
  (ov) => {
    return resolveConfig(`${ov}`);
  }
);

// console.log(config);

const walk = (dir) => {
  const files = fs.readdirSync(dir || ".");
  for (const file of files) {
    const path = dir ? `${dir}/${file}` : file;
    if (file.startsWith(".")) continue;
    if (file === "config.yml") continue;
    if (fs.statSync(path).isDirectory()) {
      walk(path);
    } else {
      if (HandledFiles.includes(path)) continue;

      if (file.endsWith(".md")) {
        resolveMdFile(path);
        continue;
      }

      const hash = hashFile(path);
      AssetsIntegrity[path] = hash;
      fs.copyFileSync(path, "./.accumbens/assets/" + hash);
      HandledFiles.push(path);
    }
  }
};

walk("");

fs.writeFileSync("./.accumbens/nav.json", JSON.stringify(config));
fs.writeFileSync("./.accumbens/md-integrity.json", JSON.stringify(MdIntegrity));
fs.writeFileSync(
  "./.accumbens/assets-integrity.json",
  JSON.stringify(AssetsIntegrity)
);
