<template>
   <n-h1 prefix="bar">
    <span class="heading-overwrite">3rd-party Libraries</span>
  </n-h1>
    <n-p>Here is a list of 3rd-party libraries used in the framework:</n-p>
    <third-party-lib-card v-for="library in _3rd_party_libs" :key="library.name" :library="library" />
    <n-p>And specially thanks to xecades/Alpha for its inspiration.</n-p>
</template>
<script setup>
import _3rd_party_libs from 'virtual:get-3rd-party-libs';
import thirdPartyLibCard from '@/components/3rd-party-lib-card.vue';
</script>

<style scoped>
.heading-overwrite {
  font-family: Cardo;
  color: #000000;
  font-weight: bold;
}
</style>
