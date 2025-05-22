<template>
  <!-- <n-collapse>
    <component v-for="item in navTree" :key="item.name" :is="item"></component
  ></n-collapse> -->


  <n-collapse >
    <custom-collapse
      v-for="item in navInfo.subcategories.filter((v) => v.show)"
      :nav="item"
    ></custom-collapse>
  </n-collapse>
</template>
<script setup>
import { navInfo } from "@/utils/configUtils.js";
import { ref } from "vue";
import { h } from "vue";
import { NCollapse, NCollapseItem } from "naive-ui";
import customCollapse from "@/components/custom-collapse.vue";
import dirList from "@/components/dir-content-main.vue";


const navView = ref(true);


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
