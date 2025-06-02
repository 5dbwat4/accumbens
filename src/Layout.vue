<template>
  <print-notin class="print-only" />
  <BreadCrumbx
    :breadcrumb="mdcfg.breadcrumb"
    v-if="content_loading_stage >= 1"
  />
  <index-alternative-switch v-if="(mdcfg.is_dir && mdcfg.index) || mdcfg.is_index"/>
  <n-h1 prefix="bar" v-if="content_loading_stage >= 1 && mdcfg.title"
    ><span class="heading-overwrite">{{ mdcfg.title }}</span></n-h1
  >
  <!-- <aside class="side-nav">
    <component :is="_SideNavComp" />
  </aside> -->
  <!-- <Onthispage :toc="toc" /> -->
  <main
    class="markdown-body"
    id="markdown-body"
    v-if="content_loading_stage >= 1"
  >
    <LoadingSkeletons
      v-if="content_loading_stage == 2 || content_loading_stage == 1"
    />
    <!-- <p>Loading stage: {{ (["Before all","Metadata calculated","Receiving content","Rendering","Fulfilled"])[content_loading_stage] }}</p> -->
    <render
      :components="defaultComponents"
      v-if="content_loading_stage == 3 || content_loading_stage == 4"
    />
    <dirList
      v-if="content_loading_stage == 3 && mdcfg.is_dir"
      :entries="mdcfg.entries"
      :subcategories="mdcfg.subcategories"
    />
  </main>
  <div v-if="content_loading_stage > 1">
    <hr v-if="mdcfg.updatedAt" />
    <!-- <p class="postconfig-bottom" v-if="mdcfg.createdAt">
      <n-icon :component="IconCalendarAddOn" />
      <span>Create At : {{ date_format(mdcfg.createdAt || "") }}</span>
    </p> -->
    <p class="postconfig-bottom" v-if="mdcfg.updatedAt">
      <n-icon :component="IconEditCalendar" />
      <span>Last Update : {{ date_format(mdcfg.updatedAt || "") }}</span>
    </p>
  </div>
  <div v-if="content_loading_stage == -404">
    <n-h1 prefix="bar">404 Not Found</n-h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <notFoundPage />
  </div>
</template>
<script setup>
import { useRoute, useRouter } from "vue-router";
import {
  defineAsyncComponent,
  h,
  nextTick,
  onMounted,
  ref,
  shallowRef,
} from "vue";
import LoadingSkeletons from "./components/LoadingSkeletons.vue";
import { handleKatexRender } from "./utils/handleKatexRender";
import { getEntry } from "./utils/configUtils";
import {
  IconCalendarAddOn,
  IconEditCalendar,
} from "@iconify-prerendered/vue-material-symbols";
import { date_format } from "./utils/date-format";
import { NTable } from "naive-ui";
import AccHeading from "./components/md-comp/accHeading.vue";
import CodeBlocks from "./components/md-comp/CodeBlocks.vue";
import dirList from "./components/dir-content-main.vue";
import ElementAHandler from "./components/md-comp/element-a-handler.vue";
import printNotin from "./components/print-notin.vue";
import IndexAlternativeSwitch from "./components/index-alternative-switch.vue";
// import infoRoot from "@notebook-entry/accumbens.config.json"

const route = useRoute();
const router = useRouter();

const path = ref(route.path);

const available = ref(true);
const notFoundPage = defineAsyncComponent(() => import("@/pages/404.vue"));

const content_loading_stage = ref(
  0 /**
0: Before all
1: config loaded
3: entry loading ok
4: render ok
-404: 404 page
*/
);
const mdcfg = await getEntry(path.value.slice(1));

console.log("mdcfg", mdcfg);

content_loading_stage.value = 1;

console.log(mdcfg);

// console.log(mdcfg);

const defaultComponents = {
  "acc-heading": AccHeading,
  "code-blocks": CodeBlocks,
  table: NTable,
  "element-a": ElementAHandler,
  "n-image": NImage,
};

// const _SideNavComp = shallowRef(h("div"));

const render = shallowRef(null);

if (!mdcfg) {
  content_loading_stage.value = -404;
} else {
  if (mdcfg.is_dir) {
    content_loading_stage.value = 3;
    if (mdcfg.index) {
      mdcfg.entry?.then(async (entry) => {
        // console.log(entry);
        render.value = entry.default;
        content_loading_stage.value = 3;
        await nextTick();
        content_loading_stage.value = 4;
        handleKatexRender();
      });
    } else {
      if (route.path.endsWith("/")) {
        router.replace(route.path.slice(0, -1));
      }
    }
  } else {
    content_loading_stage.value = 2;
    mdcfg.entry?.then(async (entry) => {
      // console.log(entry);
      render.value = entry.default;
      content_loading_stage.value = 3;
      await nextTick();
      content_loading_stage.value = 4;
      handleKatexRender();
    });
  }
}
onMounted(() => {
  handleKatexRender();
});

</script>

<style scoped>
.heading-overwrite {
  font-family: Cardo, LXGW-Wenkai-Screen;
  color: #000000;
  font-weight: bold;
  letter-spacing: 0.05em;
  margin-bottom: 1em;
}
.markdown-body {
  /* font-family: LXGW-Wenkai-Screen; */
  font-family: "Roboto", sans-serif;
  /* font-size: 1.2em; */
  /* line-height: 1.8em; */
  /* padding: 1em; */
  /* border-radius: 0.5em; */
  /* background-color: #f0f0f0; */
  /* border: 1px dotted #a0a0a0; */
  margin: 1em;
  margin: auto;
}

.postconfig-bottom {
  font-size: 0.8em;
  /* line-height: 0%; */
  margin-top: 0.3em;
  margin-bottom: 0.3em;
  vertical-align: middle;
  color: #a0a0a0;
}

.side-nav {
  position: fixed;
  top: 0;
  right: 0;
  height: fit-content;
  overflow-y: auto;
  padding: 1em;
  margin: 1em;
  margin: auto;
  width: 20%;
  max-width: 300px;
  border-radius: 0.5em;
  /* background-color: #f0f0f0; */
  /* border: 1px dotted #a0a0a0; */
}

.print-only {
  display: none;
}
@media print {
  .print-only {
    display: block;
  }
}
</style>

<style src="@/assets/markdown-overwrite.css"></style>
<style src="@/assets/md-custom-toc.css"></style>
