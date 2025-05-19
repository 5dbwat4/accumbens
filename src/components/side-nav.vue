<!-- Warning this file also handles behavior of TOC -->

<template>
  <n-anchor style="z-index: 1" :bound="24"
  affix >
    <n-anchor-link
      v-for="vox in $attrs.ast.c"
      :title="vox.n"
      :href="'#' + vox.n.trim().replaceAll(' ','-')"
    >
      <n-anchor-link
        v-for="voxx in vox.c"
        :title="voxx.n"
        :href="voxx.href"
      >
        <n-anchor-link
          v-for="voxxx in voxx.c"
          :title="voxxx.n"
          :href="voxxx.href"
        >
        </n-anchor-link
      ></n-anchor-link>
    </n-anchor-link>
  </n-anchor>
</template>
<script setup>
import { h, onMounted, useAttrs } from "vue";
import { NAnchor, NAnchorLink } from "naive-ui";

const attrs = useAttrs();
console.log(attrs.ast);

onMounted(() => {});
// I used to try to use recursive function to generate the toc tree, but it failed to work.
const toTosTree = (tox) => {
  console.log(tox);

  if (tox.c.length === 0) {
    return h(NAnchorLink, {
      title: tox.n,
      href: "#" + tox.n.trim(),
    });
  } else {
    return h(
      NAnchorLink,
      {
        title: tox.n,
        href: "#" + tox.n.trim(),
      },
      tox.c.map((tox) => toTosTree(tox))
    );
  }
};
</script>
