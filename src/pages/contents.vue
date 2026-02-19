<template>
  <!-- <n-collapse>
    <component v-for="item in navTree" :key="item.name" :is="item"></component
  ></n-collapse> -->

  <div>
    <n-button text @click="navView = !navView">
      <template #icon>
        <n-icon :component="flip"></n-icon>
      </template>
      {{ navView ? "Navigate mode" : "Collapsed mode" }}
    </n-button>
  </div>
  <div v-if="!navView">
    <n-collapse>
      <custom-collapse
        v-for="item in navInfo.subcategories.filter((v) => v.show)"
        :nav="item"
      ></custom-collapse>
    </n-collapse>
  </div>
  <div v-else style="width: 70%">
    <dirList
      :entries="[]"
      :subcategories="navInfo.subcategories.filter((v) => v.show)"
    />
  </div>
</template>
<script setup>
import { getNavInfo } from "@/utils/configUtils.js";
import { ref } from "vue";
import { h } from "vue";
import { NCollapse, NCollapseItem } from "naive-ui";
import customCollapse from "@/components/custom-collapse.vue";
import dirList from "@/components/dir-content-main.vue";

import flip from "@/assets/fluent~card-ui-portrait-flip-16-regular.vue";

const navView = ref(true);
const navInfo = await getNavInfo({ full: true });

// const nav = await getNavConfig();
// console.log(nav);

// const generateNavTree = (tree) => {
//   return tree.map((item) => {
//     if (!item.leaf) {
//       return h(
//         NCollapseItem,
//         { title: item.title, name: item.name },
//         generateNavTree(item.sub)
//       );
//     } else {
//       return h(NCollapseItem, { title: item.title, name: item.name }, () => {
//         return [h("template", { slot: "header-extra" },()=>{
//             return h("span", { innerHTML: item.title });
//         }), h("div", { innerHTML: item.content })];
//       });
//     }
//   });
// };

// const navTree = generateNavTree(nav);
</script>
