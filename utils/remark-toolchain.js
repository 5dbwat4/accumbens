import mdx from '@mdx-js/rollup'

import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHeadingId from "remark-heading-id";
import remarkFlexibleContainers from "remark-flexible-containers";
import remarkFlexibleToc from "remark-flexible-toc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePredefinedTags from "./rehype-handle-element-replacement"
import remarkEmbedImages from "remark-embed-images";
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';


export default  ()=>mdx({
      "jsxImportSource": "vue",
      "remarkPlugins":[
        remarkFrontmatter,
        remarkParse,
        remarkFlexibleContainers,
        remarkGfm,
        remarkMath,
        remarkEmbedImages,
        [remarkHeadingId,{defaults: true}],
        [remarkFlexibleToc,{
          maxDepth: 3,
          skipLevels: [],
        }],
        // [remarkRehype,{
        //   allowDangerousHtml: true,
        // }]
      ],
      "rehypePlugins":[
        // rehypeKatex ,
        // rehypeRaw,
        rehypePredefinedTags
      ],
    })