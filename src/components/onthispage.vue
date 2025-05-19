<template>
  <div id="table-of-contents" class="table-of-contents" v-if="toc.length>0">
    <p class="toc-hint">On this page:</p>
    <ul >
      <li v-for="item in toc" :style="{'padding-top': item.depth==1?'0.2em':'0'}">
        <span class="toc-numbering">{{ item.numbering.join('.') }}</span>
        <a :href="item.href" :style="{'padding-left': 1.5+'em'}">{{ item.value }}</a>
      </li>
    </ul>
  </div>
</template>
<script setup>
// import { useAttrs } from 'vue';

const props=defineProps({
  toc: Array,
});


</script>
