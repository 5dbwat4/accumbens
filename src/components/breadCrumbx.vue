<template>
  <div class="breadcrumb" >
    <!-- <n-breadcrumb style="vertical-align: middle"> -->
      <n-button quaternary circle>
        <template #icon>
          <n-icon :component="IconChevronLeft"></n-icon>
        </template>
      </n-button>

      <!-- <n-breadcrumb-item > -->
        <n-button quaternary round @click="$router.push('/contents')">
          <template #icon>
          <n-icon :component="IconHomeTwotone" /></template>
          Home
        </n-button>
      <!-- </n-breadcrumb-item> -->
      <template v-for="vo in $props.breadcrumb">
        <span>/</span>
        <n-button quaternary round @click="$router.push('/'+vo.path[0]+'/')">
          <!-- <template #icon>
          <n-icon
            v-if="dataPreservedIcons[vo.key]"
            :component="dataPreservedIcons[vo.key]"
          /></template> -->
          {{ vo.name }}
         
        </n-button>
        </template>
      <!-- </n-breadcrumb-item> -->
    <!-- </n-breadcrumb> -->
  </div>
</template>

<script setup>
// import ""
// import { generateBreadcrumbData } from "@/router/prepareNotebookTree";
defineProps({
  breadcrumb: Array,
});
import { useRoute } from "vue-router";
import dataPreservedIcons from "@/router/dataPreservedIcons";
// import {Icon} from "@iconify/vue";
import {
  IconChevronLeft,
  IconHomeTwotone,
} from "@iconify-prerendered/vue-line-md";
// import { resolveBreadcrumbData } from "@/utils/markdown/resolveBreadcrumbData";
// const route = useRoute();

// const breadcrumb = await resolveBreadcrumbData(route.path);
// const breadcrumb = [];
// console.log(breadcrumb);
</script>


<style>
.breadcrumb{
  display: flex;
  vertical-align: middle;
  align-items: center;
}
</style>