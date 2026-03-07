import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import VueJsx from "@vitejs/plugin-vue-jsx";

// import { defineConfig } from 'vite'
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import {
  ElementPlusResolver,
  NaiveUiResolver,
} from "unplugin-vue-components/resolvers";
import VueRouter from "unplugin-vue-router/vite";
import Pages from "vite-plugin-pages";
import Icons from "@iconify/unplugin/vite";

import remarkToolchain from "./utils/remark-toolchain";

import encryptPlugin from "./utils/rollup-plugin-encrypt";
import detailPlugin from "./utils/rollup-plugin-bundleDetail";
import list3rdpartylist from "./utils/unplugin-list-3rd-party-libs";
import compileDocTreePlugin from "./utils/vite-plugin-compile-doc-tree.mjs";
import mdRelativeImageUrlPlugin from "./utils/vite-plugin-md-relative-image-url.mjs";

// function getModuleNameFromPath(path) {
//   // Regular expression to match the module name pattern
//   const regex = /\/\.pnpm\/([^/]+)\/node_modules\//;

//   // Extract the module name using the regex
//   const match = path.match(regex);

//   // If a match is found, return the captured group (module name)
//   if (match && match[1]) {
//     return match[1];
//   }

//   // If no match is found, return null or an appropriate message
//   return "";
// }

// function getPageModuleNameFromPath(path) {
//   const regex = /\/noting\/(.+)\//;
//   const match = path.match(regex);
//   if (match && match[1]) {
//     return match[1].replace(/-/g, "--").replace(/\//g, "-");
//   }
//   return "";
// }

const chunk_get_name = (id) => {
  const prefix = id.type === "chunk" ? "" : "assets/";
  if (id.type === "asset") {
    if(id.originalFileName && id.originalFileName.includes("/noting/")){
      return `assets/neuron.[hash][extname]`;
    }else{
      return `assets/myelin.[hash][extname]`;
    }
  }else if (id.type === "chunk") {
    if(id.moduleIds.some(moduleId=>moduleId.includes("/noting/"))){
      return `assets/neuron.[hash].js`;
    }else{
      return `assets/myelin.[hash].js`;
    }
  }

  // console.log("Getting chunk name for id", id);
  if (id.originalFileName && id.originalFileName.includes("node_modules")) {
    return `${prefix}neuron.[hash].js`;
  }
  return `${prefix}myelin.[hash].js`;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    compileDocTreePlugin({
      maxEntriesPerBucket: 128,
    }),
    mdRelativeImageUrlPlugin(),
    VueRouter(),
    Pages({
      dirs: "src/pages", // 需要生成路由的文件目录
      exclude: ["**/components/*.vue"], // 排除在外的目录，即所有 components 目录下的 .vue 文件都不会生成路由
    }),
    remarkToolchain(),
    Icons({
      compiler: "vue",
    }),
    Vue(),
    VueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver(), NaiveUiResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver(), NaiveUiResolver()],
    }),
    list3rdpartylist(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // 'vue': 'vue/dist/vue.esm-bundler.js',
      "@notes": fileURLToPath(new URL("./noting", import.meta.url)),
      "@notebook-entry": fileURLToPath(
        new URL("./noting/.accumbens", import.meta.url),
      ),
      "@md-components": fileURLToPath(
        new URL("./src/components/md-comp", import.meta.url),
      ),
    },
  },
  build: {
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        assetFileNames: chunk_get_name,
        chunkFileNames: chunk_get_name,
        entryFileNames: "assets/[name].[hash].js",
      },
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
