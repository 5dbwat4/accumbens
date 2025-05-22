<template>
  <n-collapse-item :title="$attrs.nav.name" :name="$attrs.nav.path[0]">
    <!-- <template #header-extra>
      <span class="clp-extra">{{ $attrs.nav.key }}</span>
    </template> -->

    <!-- <component v-if="!$attrs.nav.leaf" v-for="item in $attrs.nav.sub" :key="item.key" :is="item"></component> -->
    <custom-collapse
      v-if="!$attrs.nav.leaf"
      v-for="item in $attrs.nav.subcategories.filter(v=>v.show)"
      :nav="item"
    ></custom-collapse>
    <n-space vertical style="margin-left: 32px;">
    <n-button
      text
      v-if="$attrs.nav.leaf"
      v-for="item in $attrs.nav.entries"
      :key="item.path"
      @click="$router.push('/'+$attrs.nav.path[0]+'/'+item.path)"
    >
      <template #icon>
        <n-icon>
          <ArrowForwardOutline />
        </n-icon>
      </template>
      {{ item.title|| "(no title) /"+item.path }}
      <span class="timeago-suf">{{ timeAgo(item.createdAt) }}</span>
    </n-button></n-space>
  </n-collapse-item>
</template>
<script setup>
import customCollapse from "@/components/custom-collapse.vue";
import {ArrowForwardOutline} from '@vicons/ionicons5'
import { timeAgo } from "@/utils/basic-utils";
</script>

<style scoped>
.clp-extra {
  font-size: 0.78em;
  color: #666;
  font-family: cardo;
}

.timeago-suf {
  font-size: 0.78em;
  color: #aaa;
  margin-left: 24px;
}
.n-collapse .n-collapse-item:first-child {
margin-top: 16px;
}
</style>
