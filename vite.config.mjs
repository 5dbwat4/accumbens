import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import mdx from '@mdx-js/rollup'

// import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import VueRouter from 'unplugin-vue-router/vite'
import Pages from 'vite-plugin-pages';

import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHeadingId from "remark-heading-id";
import remarkFlexibleContainers from "remark-flexible-containers";
import remarkFlexibleToc from "remark-flexible-toc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePredefinedTags from "./utils/rehype-handle-element-replacement"
import remarkEmbedImages from "remark-embed-images"

function getModuleNameFromPath(path) {
  // Regular expression to match the module name pattern
  const regex = /\/\.pnpm\/([^/]+)\/node_modules\//;

  // Extract the module name using the regex
  const match = path.match(regex);

  // If a match is found, return the captured group (module name)
  if (match && match[1]) {
      return match[1];
  }

  // If no match is found, return null or an appropriate message
  return '';
}

function getPageModuleNameFromPath(path){
  const regex = /\/noting\/(.+)\//;
  const match = path.match(regex);
  if (match && match[1]) {
    return match[1].replace(/-/g,'--').replace(/\//g,'-');
  }
  return '';
}


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(),
    // Pages({
    //   dirs: 'src/pages',  // 需要生成路由的文件目录
    //   exclude: ['**/components/*.vue']  // 排除在外的目录，即所有 components 目录下的 .vue 文件都不会生成路由
    // }),
    mdx({
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
        }]
      ],
      "rehypePlugins":[
        // rehypeKatex ,
        rehypePredefinedTags
      ],
    }),
    Vue(),
    VueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver(), NaiveUiResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver(), NaiveUiResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 'vue': 'vue/dist/vue.esm-bundler.js',
      '@notes': fileURLToPath(new URL('./noting', import.meta.url)),
      '@notebook-entry': fileURLToPath(new URL('./noting/.accumbens', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks(id) {

        //   else if (id.includes('/noting/')) {
        //     return 'accumbensN--'+getPageModuleNameFromPath(id);
        //   }
        //   else {
        //     return true;
        //   }
        // },
      },
    },
  },
  server: {
    fs: {
      strict: false
    }
  }

})
