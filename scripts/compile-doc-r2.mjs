const arg_doc_path = process.argv[2] || ".";

//----------------------------------------------

import fs from "node:fs";
import YAML from "js-yaml";
import { createHash, KeyObject } from "node:crypto";

// We consider /* and /*/* as Category and Subcategory
// A nav.yml file is under each subcategory

const nav = {};

// Read Categories from './config.yml'
const config = fs.readFileSync("./config.yml", "utf8");
const config_obj = YAML.load(config);

for (const category_obj of config_obj.categories) {
  const category = Object.entries(category_obj)[0];
  // console.log(category);

  nav[category[0]] = {
    title: category[1],
    key: category[0],
    subcategories: await getSubcategoriesList(category[0]),
  };
}

// Generate list of subcategory by reading directories
async function getSubcategoriesList(category) {
  const dirs = fs
    .readdirSync(arg_doc_path + "/" + category)
    .filter((f) =>
      fs.statSync(arg_doc_path + "/" + category + "/" + f).isDirectory()
    );
  const subcategories = [];
  for (const dir of dirs) {
    let subcategory = {
      title: dir,
      key: dir,
      nav: [],
      aliases: [],
    };
    const nav_file = arg_doc_path + "/" + category + "/" + dir + "/nav.yml";
    if (fs.existsSync(nav_file)) {
      const nav_content = fs.readFileSync(nav_file, "utf8");
      const nav_config = YAML.load(nav_content);
      subcategory.title = nav_config.title || dir;
      subcategory.nav = nav_config.nav.map((ov) => {
        const ob = Object.entries(ov)[0];
        return {
          filename: ov[1],
          title: ov[0],
        };
      });
      subcategory.aliases = nav_config["route-parent"] || [];
    }
    subcategories.push(subcategory);
  }
  return subcategories;
}

// console.log(JSON.stringify(nav));

// Compile each md file using remark

// import rehypeStringify from "rehype-stringify";
// import rehypeRaw from "rehype-raw";
// import remarkFrontmatter from "remark-frontmatter";
// import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
// import remarkMdx from "remark-mdx";
// import remarkGfm from "remark-gfm";
// import remarkFlexibleContainers from "remark-flexible-containers";
// import { unified } from "unified";
import matter from "gray-matter";
import { join as path_resolve } from "path";

// const processor = unified()
//   .use(remarkParse)
//   .use(remarkFrontmatter)
//   .use(remarkFlexibleContainers)
//   .use(remarkGfm)
//   .use(remarkRehype)
//   .use(rehypeRaw)
//   .use(rehypeStringify);
// .use(remarkMdx)

const resolveNavChain = (path) => {
  const pc = path.split("/");
  if (pc.length <= 2) {
  }
};

const updateNavInfo = (path, config) => {};

fs.rmSync("./.compiled/", { recursive: true });
fs.mkdirSync("./.compiled");
fs.mkdirSync('./.compiled/docassets')

let MdIntegrity = {},AssetsIntegrity = {};

const savefile = (path, content,type) => {
  const hash = createHash("sha256");
  // const content = fs.readFileSync(path, "binary");
  hash.update(content);
  const hashed = hash.digest("hex");
  fs.writeFileSync('./.compiled/docassets/'+hashed,content);
  if(type==='md'){
    MdIntegrity[path]=hashed
  }else{
    AssetsIntegrity[path]=hashed
  }
  return

}

const Compile_and_build_Walk = async (dir='.') => {
  const files = fs.readdirSync(dir||'.');
  for (const file of files) {
    if (file.startsWith(".")) {
      continue;
    }
    const path = dir=='.'?file: dir + "/" + file;
    // const path=path_resolve(dir,file)
    console.log(path);

    if (fs.statSync(path).isDirectory()) {
      // fs.mkdirSync(path_resolve("./.compiled", path));
      await Compile_and_build_Walk(path);
    } else {
      if (file === "nav.yml") {
        continue;
      }
      if (file.endsWith(".md")) {
        const file = fs.readFileSync(path, "utf8");

        const { data, content } = matter(file);
        // const template = String(await processor.process(content));
        const stat = fs.statSync(path);

        const buf = {
          title: data.title,
        //   template: template,
        raw: content,
          createAt: new Date(data.createAt || stat.birthtime).getTime(),
          updateAt: new Date(data.updateAt || stat.mtime).getTime(),
          root: dir,
          category: data.category || resolveNavChain(path),
        };

        updateNavInfo(path, { createAt: buf.createAt, updateAt: buf.updateAt });

        // fs.writeFileSync(
        //   path_resolve("./.compiled/", path + ".json"),
        //   JSON.stringify(buf)
        // );
        savefile(path,JSON.stringify(buf),'md')
        continue;
      }
      if (file.endsWith(".yml")) continue;

      // Consider the file bare assets
      
      // fs.cpSync(path, path_resolve("./.compiled/", path));
      savefile(path,fs.readFileSync(path),'assets')
    }
  }
};

await Compile_and_build_Walk();

// Save nav file

fs.writeFileSync("./.compiled/config.json", JSON.stringify({ nav }));

// Generate integrity file

// let hashed = {};

// Walk through all files and generate hash
// const Hash_Walk = async (dir) => {
//   // console.log(dir);

//   const files = fs.readdirSync(path_resolve("./.compiled/", dir));
//   //   console.log(files,path_resolve("./.compiled/", dir));

//   for (const file of files) {
//     if (file.startsWith(".")) {
//       continue;
//     }
//     const key = dir + "/" + file;
//     const path = path_resolve("./.compiled/", key);
//     // console.log(key,path);

//     if (fs.statSync(path).isDirectory()) {
//       await Hash_Walk(key);
//     } else {
//       const hash = createHash("sha256");
//       const content = fs.readFileSync(path, "binary");
//       hash.update(content);
//       hashed[key] = hash.digest("hex");
//     }
//   }
// };

// await Hash_Walk(".");

fs.writeFileSync("./.compiled/md-integrity.json", JSON.stringify(MdIntegrity));
fs.writeFileSync("./.compiled/assets-integrity.json", JSON.stringify(AssetsIntegrity));
