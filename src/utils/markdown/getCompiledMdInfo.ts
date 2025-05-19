import { getMdFile } from "@/utils/network/parseMdFilePath";

import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import remarkFlexibleContainers from "remark-flexible-containers";
import remarkFlexibleToc from "remark-flexible-toc";
// import {read} from 'to-vfile'
import { unified } from "unified";
import { Heading, Root } from "mdast";
import { encodePPX } from "../codecForPropertyPass";
import remarkHeadingId from "remark-heading-id";
import rehypeReplacement from "./rehype-handle-element-replacement";

const processor = unified()
  .use(remarkParse)
  .use(remarkFlexibleContainers)
  .use(remarkGfm)
  .use(remarkHeadingId,{defaults: true})
  .use(remarkFlexibleToc, {
    maxDepth: 3,
    skipLevels: [],
  })
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeReplacement)
  .use(rehypeRaw)
  .use(rehypeStringify);

// const generateTocFromTree = (tree: Root) => {
//   // tree is a MDAST tree
//   const toc = [];
//   const stack = [];
//   for (const node of tree.children) {
//     if (node.type === "heading" && node.depth < 4) {
//       const newHeading = {
//         value: node.children[0].value,
//         depth: node.depth,
//         children: [],
//       };
//       while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
//         stack.pop();
//       }
//       if (stack.length === 0) {
//         toc.push(newHeading);
//       } else {
//         stack[stack.length - 1].children.push(newHeading);
//       }
//       stack.push(newHeading);
//     }
//   }
//   return toc;
// };

// const replaceTagnameFromTree = (tree: Root) => {
//   const replacement = {
//     img: "n-image",
//     // table: "-table",
//     h1: "x-h1",
//     h2: "x-h3",
//     h3: "x-h3",
//     h4: "x-h4",
//     h5: "x-h5",
//     h6: "x-h6",
//   };
//   // Walk through tree and replace occurred tagName
//   const repKeys = Object.keys(replacement);
//   function walker(tree) {
//     if (tree.type === "element" && repKeys.includes(tree.tagName)) {
//       tree.tagName = replacement[tree.tagName];
//     }
//     if (
//       tree.type === "element" &&
//       tree.tagName === "pre" &&
//       tree.children[0].type === "element" &&
//       tree.children[0].tagName === "code"
//     ) {
//       tree.tagName = "code-blocks";
//       tree.properties = {
//         language: tree.children[0].properties.className[0].slice(9),
//         code: encodePPX(tree.children[0].children[0].value),
//       };
//     }
//     if (tree.children) {
//       tree.children.forEach(walker);
//     }
//   }
//   walker(tree);
//   return tree;
// };

export async function getCompiledMdInfo(path: string): Promise<{
  template: string;
  toc: Object;
  config: Object;
}> {
  const data = await getMdFile(path);

  // const mdast = processor.parse(read(data.content));
  // const toc = generateTocFromTree(mdast);
  // console.log(processor.runSync(mdast));

  // const hast = replaceTagnameFromTree(processor.runSync(parse(data.content)));

  // const html = processor.stringify(hast);
  // const toc = processor.process(mdast).data.toc;

  const file = await processor.process(data.content);

  console.log(file);

  return {
    template: String(file),
    toc: file.data.toc,
    config: data,
  };
}
