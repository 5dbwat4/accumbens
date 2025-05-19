<template>
  <a v-if="isForeignLink($props.href)" :href="$props.href" target="_blank" class="acc-a">
    <slot></slot>
    <n-icon :component="IconExternalLink"></n-icon>
</a>
<a v-else @click="$router.push($props.href)" class="acc-a">
    <slot></slot>
</a>
</template>
<script setup>
defineProps({
  href: {
    type: String,
    required: true,
  },
});
import {IconExternalLink} from '@iconify-prerendered/vue-line-md'
const isForeignLink = (href) => {
    // console.log('href', href);
    
  return (
    href &&
    !href.startsWith("/") &&
    href.startsWith("http") &&
    new URL(href).origin !== window.location.origin
  );
};
</script>
